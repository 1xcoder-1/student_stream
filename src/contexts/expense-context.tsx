"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type {
  Expense,
  SpendingGoal,
  CustomCategory,
  Currency,
} from "@/lib/types";
import { logError } from "@/lib/error-logger";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./auth-context";
import { calculateNextRenewalDate } from "@/lib/renewal-calculator";

const IS_SERVER = typeof window === "undefined";

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (IS_SERVER) return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logError(error, { key, operation: "localStorage.getItem" });
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (value) => {
      if (IS_SERVER) {
        console.warn(`Tried to set localStorage key "${key}" on the server.`);
        return;
      }
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error: any) {
        if (error?.name === "QuotaExceededError") {
          alert(
            "Storage quota exceeded. Please export your data."
          );
        }
        logError(error, { key, operation: "localStorage.setItem" });
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}

interface ExpenseContextType {
  subscriptions: Expense[]; // Aliased for backward compatibility with UI
  expenses: Expense[];
  addSubscription: (expense: Omit<Expense, "id">) => Promise<void>; // Alias
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Expense>) => Promise<void>; // Alias
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>; // Alias
  deleteExpense: (id: string) => Promise<void>;
  importSubscriptions: (newExpenses: Expense[]) => void;
  incrementUsage: (id: string) => Promise<void>;
  upgradePromptOpen: boolean;
  upgradePromptMessage: string;
  showUpgradePrompt: (message?: string) => void;
  dismissUpgradePrompt: () => void;
  spendingGoals: SpendingGoal[];
  addSpendingGoal: (goal: Omit<SpendingGoal, "id">) => void;
  updateSpendingGoal: (id: string, updates: Partial<SpendingGoal>) => void;
  deleteSpendingGoal: (id: string) => void;
  customCategories: CustomCategory[];
  addCustomCategory: (category: Omit<CustomCategory, "id">) => void;
  deleteCustomCategory: (id: string) => void;
  displayCurrency: Currency;
  setDisplayCurrency: (currency: Currency) => void;
  loading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(
  undefined,
);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [upgradePromptMessage, setUpgradePromptMessage] = useState(
    "You have reached the free tier limits.",
  );
  const [spendingGoals, setSpendingGoals] = useLocalStorage<SpendingGoal[]>(
    "spendingGoals",
    [],
  );
  const [customCategories, setCustomCategories] = useLocalStorage<
    CustomCategory[]
  >("customCategories", []);
  const [displayCurrency, setDisplayCurrency] = useLocalStorage<Currency>(
    "displayCurrency",
    "PKR", // Default to PKR for students
  );

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const fetchExpenses = async () => {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .select(
            "id, name, provider, category, icon, start_date, due_date, frequency, amount, currency, notes, active_status, auto_renew, is_shared, reminder_enabled, reminder_days_before, last_reminder_sent, usage_count, last_used",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && isMounted) {
          const formattedSubs: Expense[] = data.map((item) => ({
            id: item.id,
            name: item.name,
            provider: item.provider || "",
            category: item.category,
            icon: (item.icon as any) || "default",
            startDate: item.start_date || new Date().toISOString().split("T")[0],
            billingCycle: item.frequency as any,
            amount: Number(item.amount),
            currency: item.currency as any,
            notes: item.notes || "",
            activeStatus: item.active_status,
            autoRenew: item.auto_renew,
            isShared: item.is_shared || false,
            reminderEnabled: item.reminder_enabled ?? false,
            reminderDaysBefore: (item.reminder_days_before as any) ?? 3,
            nextRenewalDate: item.due_date ?? null,
            lastReminderSent: item.last_reminder_sent ?? null,
            usageCount: item.usage_count || 0,
            lastUsed: item.last_used || undefined,
          }));
          setExpenses(formattedSubs);
        }
      } catch (error) {
        logError(error, { context: "fetchExpenses", userId: user.id });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExpenses();

    // Set up real-time subscription
    const channel = supabase
      .channel('realtime:expenses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new;
            setExpenses((prev) => {
              if (prev.some((s) => s.id === newItem.id)) return prev;
              
              const formatted: Expense = {
                id: newItem.id,
                name: newItem.name,
                provider: newItem.provider || "",
                category: newItem.category,
                icon: (newItem.icon as any) || "default",
                startDate: newItem.start_date,
                billingCycle: newItem.frequency as any,
                amount: Number(newItem.amount),
                currency: newItem.currency as any,
                notes: newItem.notes || "",
                activeStatus: newItem.active_status,
                autoRenew: newItem.auto_renew,
                isShared: newItem.is_shared || false,
                reminderEnabled: newItem.reminder_enabled ?? false,
                reminderDaysBefore: (newItem.reminder_days_before as any) ?? 3,
                nextRenewalDate: newItem.due_date ?? null,
                lastReminderSent: newItem.last_reminder_sent ?? null,
                usageCount: newItem.usage_count || 0,
                lastUsed: newItem.last_used || undefined,
              };
              return [formatted, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new;
            setExpenses((prev) => prev.map((item) => {
              if (item.id === updatedItem.id) {
                return {
                  ...item,
                  name: updatedItem.name,
                  provider: updatedItem.provider || "",
                  category: updatedItem.category,
                  icon: (updatedItem.icon as any) || "default",
                  startDate: updatedItem.start_date,
                  billingCycle: updatedItem.frequency as any,
                  amount: Number(updatedItem.amount),
                  currency: updatedItem.currency as any,
                  notes: updatedItem.notes || "",
                  activeStatus: updatedItem.active_status,
                  autoRenew: updatedItem.auto_renew,
                  isShared: updatedItem.is_shared || false,
                  reminderEnabled: updatedItem.reminder_enabled ?? false,
                  reminderDaysBefore: (updatedItem.reminder_days_before as any) ?? 3,
                  nextRenewalDate: updatedItem.due_date ?? null,
                  lastReminderSent: updatedItem.last_reminder_sent ?? null,
                  usageCount: updatedItem.usage_count || 0,
                  lastUsed: updatedItem.last_used || undefined,
                };
              }
              return item;
            }));
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old;
            setExpenses((prev) => prev.filter((item) => item.id !== deletedItem.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addExpense = useCallback(
    async (expense: Omit<Expense, "id">) => {
      if (!user) throw new Error("User not authenticated");

      const supabase = createClient();

      try {
        const nextRenewal = calculateNextRenewalDate(
          expense.startDate,
          expense.billingCycle,
        );
        const nextRenewalDate = nextRenewal
          ? nextRenewal.toISOString().split("T")[0]
          : null;

        const { data, error } = await supabase
          .from("expenses")
          .insert({
            user_id: user.id,
            name: expense.name,
            provider: expense.provider,
            category: expense.category,
            icon: expense.icon || "default",
            start_date: expense.startDate,
            frequency: expense.billingCycle,
            amount: expense.amount,
            currency: expense.currency,
            notes: expense.notes || "",
            active_status: expense.activeStatus,
            auto_renew: expense.autoRenew,
            is_shared: expense.isShared || false,
            usage_count: expense.usageCount || 0,
            due_date: nextRenewalDate,
          })
          .select()
          .single();

        if (error) throw new Error(`Database error: ${error.message}`);
        if (!data) throw new Error("No data returned from database");

        const newExpense: Expense = {
          id: data.id,
          name: data.name,
          provider: data.provider || "",
          category: data.category,
          icon: (data.icon as any) || "default",
          startDate: data.start_date,
          billingCycle: data.frequency as any,
          amount: Number(data.amount),
          currency: data.currency as any,
          notes: data.notes || "",
          activeStatus: data.active_status,
          autoRenew: data.auto_renew,
          isShared: data.is_shared || false,
          reminderEnabled: expense.reminderEnabled ?? false,
          reminderDaysBefore: expense.reminderDaysBefore ?? 3,
          nextRenewalDate: nextRenewalDate,
          lastReminderSent: null,
          usageCount: data.usage_count || 0,
          lastUsed: data.last_used || undefined,
        };
        setExpenses((prev) => [newExpense, ...prev]);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error) || "Unknown error";
        logError(error, { context: "addExpense" });
        throw new Error(errorMessage);
      }
    },
    [user],
  );

  const updateExpense = useCallback(
    async (id: string, updates: Partial<Expense>) => {
      if (!user) return;
      const supabase = createClient();

      try {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.provider !== undefined) dbUpdates.provider = updates.provider;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.billingCycle !== undefined) dbUpdates.frequency = updates.billingCycle;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.activeStatus !== undefined) dbUpdates.active_status = updates.activeStatus;
        if (updates.autoRenew !== undefined) dbUpdates.auto_renew = updates.autoRenew;
        if (updates.isShared !== undefined) dbUpdates.is_shared = updates.isShared;
        if (updates.reminderEnabled !== undefined) dbUpdates.reminder_enabled = updates.reminderEnabled;
        if (updates.reminderDaysBefore !== undefined) dbUpdates.reminder_days_before = updates.reminderDaysBefore;
        if (updates.lastReminderSent !== undefined) dbUpdates.last_reminder_sent = updates.lastReminderSent;
        if (updates.usageCount !== undefined) dbUpdates.usage_count = updates.usageCount;
        if (updates.lastUsed !== undefined) dbUpdates.last_used = updates.lastUsed;

        if (
          updates.startDate !== undefined ||
          updates.billingCycle !== undefined
        ) {
          const current = expenses.find((e) => e.id === id);
          const startDate = updates.startDate ?? current?.startDate;
          const billingCycle = updates.billingCycle ?? current?.billingCycle;
          if (startDate && billingCycle) {
            const nextRenewal = calculateNextRenewalDate(
              startDate,
              billingCycle,
            );
            dbUpdates.due_date = nextRenewal
              ? nextRenewal.toISOString().split("T")[0]
              : null;
            updates.nextRenewalDate = dbUpdates.due_date;
          }
        }

        const { error } = await supabase
          .from("expenses")
          .update(dbUpdates)
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) throw error;

        setExpenses((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        );
      } catch (error) {
        logError(error, { context: "updateExpense", id });
        throw error;
      }
    },
    [user, expenses],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!user) return;
      const supabase = createClient();

      try {
        const { error } = await supabase
          .from("expenses")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (error) throw error;

        setExpenses((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        logError(error, { context: "deleteExpense", id });
        throw error;
      }
    },
    [user],
  );

  const incrementUsage = useCallback(
    async (id: string) => {
      const item = expenses.find((e) => e.id === id);
      if (!item) return;
      await updateExpense(id, {
        usageCount: (item.usageCount || 0) + 1,
        lastUsed: new Date().toISOString(),
      });
    },
    [expenses, updateExpense],
  );

  const addSpendingGoal = useCallback(
    (goal: Omit<SpendingGoal, "id">) => {
      const newGoal = { ...goal, id: crypto.randomUUID() };
      setSpendingGoals((prev: SpendingGoal[]) => [...prev, newGoal]);
    },
    [setSpendingGoals],
  );

  const updateSpendingGoal = useCallback(
    (id: string, updates: Partial<SpendingGoal>) => {
      setSpendingGoals((prev: SpendingGoal[]) =>
        prev.map((goal: SpendingGoal) =>
          goal.id === id ? { ...goal, ...updates } : goal,
        ),
      );
    },
    [setSpendingGoals],
  );

  const deleteSpendingGoal = useCallback(
    (id: string) => {
      setSpendingGoals((prev: SpendingGoal[]) =>
        prev.filter((goal: SpendingGoal) => goal.id !== id),
      );
    },
    [setSpendingGoals],
  );

  const addCustomCategory = useCallback(
    (category: Omit<CustomCategory, "id">) => {
      const newCategory = { ...category, id: crypto.randomUUID() };
      setCustomCategories((prev: CustomCategory[]) => [...prev, newCategory]);
    },
    [setCustomCategories],
  );

  const deleteCustomCategory = useCallback(
    (id: string) => {
      setCustomCategories((prev: CustomCategory[]) =>
        prev.filter((cat: CustomCategory) => cat.id !== id),
      );
    },
    [setCustomCategories],
  );

  const importSubscriptions = useCallback(
    async (newExpenses: Expense[]) => {
      if (!user || !Array.isArray(newExpenses)) {
        logError(new Error("Import failed"), {
          context: "importSubscriptions",
        });
        return;
      }

      try {
        const validItems = newExpenses.filter((s) => s.name && s.amount);
        for (const item of validItems) {
          await addExpense({
            name: item.name,
            provider: item.provider || "",
            category: item.category,
            icon: item.icon,
            startDate: item.startDate,
            billingCycle: item.billingCycle,
            amount: item.amount,
            currency: item.currency,
            notes: item.notes,
            activeStatus: item.activeStatus,
            autoRenew: item.autoRenew,
            isShared: item.isShared || false,
            usageCount: item.usageCount,
          });
        }
      } catch (error) {
        logError(error, { context: "importSubscriptions" });
      }
    },
    [user, addExpense],
  );

  const value = useMemo(
    () => ({
      subscriptions: expenses, // Backward compatibility alias
      expenses,
      addSubscription: addExpense, // Backward compatibility alias
      addExpense,
      updateSubscription: updateExpense, // Backward compatibility alias
      updateExpense,
      deleteSubscription: deleteExpense, // Backward compatibility alias
      deleteExpense,
      importSubscriptions,
      incrementUsage,
      upgradePromptOpen,
      upgradePromptMessage,
      showUpgradePrompt: (message?: string) => {
        if (message) setUpgradePromptMessage(message);
        setUpgradePromptOpen(true);
      },
      dismissUpgradePrompt: () => setUpgradePromptOpen(false),
      spendingGoals,
      addSpendingGoal,
      updateSpendingGoal,
      deleteSpendingGoal,
      customCategories,
      addCustomCategory,
      deleteCustomCategory,
      displayCurrency,
      setDisplayCurrency,
      loading,
    }),
    [
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      importSubscriptions,
      incrementUsage,
      upgradePromptOpen,
      upgradePromptMessage,
      spendingGoals,
      addSpendingGoal,
      updateSpendingGoal,
      deleteSpendingGoal,
      customCategories,
      addCustomCategory,
      deleteCustomCategory,
      displayCurrency,
      setDisplayCurrency,
      loading,
    ],
  );

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error(
      "useExpenses must be used within an ExpenseProvider",
    );
  }
  return context;
}

// Backward compatibility exports
export const SubscriptionProvider = ExpenseProvider;
export const useSubscriptions = useExpenses;
