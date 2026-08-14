import { 
  Film, 
  Music, 
  Tv, 
  Briefcase, 
  Gamepad2, 
  ShoppingCart, 
  Heart, 
  HelpCircle, 
  Laptop, 
  Clapperboard, 
  Book, 
  Newspaper,
  BookOpen,
  BrainCircuit,
  Building,
  Cloud,
  Code,
  Dumbbell,
  Globe,
  GraduationCap,
  Home,
  MonitorPlay,
  Podcast,
  Rocket,
  Server,
  Shield,
  Smartphone,
  Store,
  Utensils,
  Wifi,
  Zap,
} from "lucide-react";

export const BILLING_CYCLES = ["Daily", "Weekly", "Monthly", "Quarterly", "Annually", "one-time", "monthly", "yearly", "One-time"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number] | string;

export const CURRENCIES = ["PKR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

// Kept for backwards compatibility for existing expenses
export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  entertainment: Clapperboard,
  music: Music,
  streaming: Tv,
  software: Laptop,
  gaming: Gamepad2,
  shopping: ShoppingCart,
  health: Heart,
  business: Briefcase,
  finance: Book,
  news: Newspaper,
  bookOpen: BookOpen,
  brain: BrainCircuit,
  building: Building,
  cloud: Cloud,
  code: Code,
  fitness: Dumbbell,
  domain: Globe,
  education: GraduationCap,
  home: Home,
  monitorPlay: MonitorPlay,
  podcast: Podcast,
  startup: Rocket,
  hosting: Server,
  security: Shield,
  mobile: Smartphone,
  ecommerce: Store,
  food: Utensils,
  internet: Wifi,
  utilities: Zap,
  default: HelpCircle,
};

export const ICON_CATEGORIES: Record<string, Record<string, React.ElementType>> = {
  "Academics & Fees": {
    education: GraduationCap,
    books: BookOpen,
    finance: Book,
  },
  "Hostel & Rent": {
    home: Home,
    building: Building,
  },
  "Food & Mess": {
    food: Utensils,
  },
  "Mobile & Internet": {
    internet: Wifi,
    mobile: Smartphone,
  },
  "Transport": {
    domain: Globe,
    startup: Rocket,
  },
  "Entertainment & Outings": {
    streaming: Tv,
    music: Music,
    gaming: Gamepad2,
    movies: Film,
  },
  "Freelance Tools & Learning": {
    software: Laptop,
    code: Code,
    ai: BrainCircuit,
    hosting: Server,
    security: Shield,
  },
  "Other": {
    default: HelpCircle,
  }
};


export interface Expense {
  id: string;
  name: string;
  provider: string;
  category: string;
  icon: keyof typeof CATEGORY_ICONS;
  startDate: string; // ISO string for date
  billingCycle: BillingCycle; // maps to frequency
  amount: number;
  currency: Currency;
  notes: string;
  activeStatus: boolean;
  autoRenew: boolean;
  isShared?: boolean; // student flat splitting
  reminderEnabled?: boolean;
  reminderDaysBefore?: 1 | 3 | 7 | 14;
  nextRenewalDate?: string | null; // ISO date (YYYY-MM-DD) or null (maps to due_date)
  lastReminderSent?: string | null;
  usageCount?: number;
  lastUsed?: string;
}

export type Subscription = Expense; // Alias for backward compatibility if needed in some untracked files

export interface SpendingGoal {
  id: string;
  type: 'monthly' | 'annual';
  amount: number;
  currency: Currency;
  category?: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CurrencyRate {
  [key: string]: number;
}

export type SubscriptionFormData = Omit<Expense, "id">;
export type ExpenseFormData = Omit<Expense, "id">;
