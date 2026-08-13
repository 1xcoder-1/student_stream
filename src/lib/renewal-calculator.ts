export function calculateNextRenewalDate(
  startDate: string,
  billingCycle: string
): Date | null {
  const cycle = billingCycle.toLowerCase();
  if (cycle === 'one-time' || cycle === 'onetime') return null;

  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let next = new Date(start);

  while (next <= today) {
    if (cycle === 'daily') {
      next.setDate(next.getDate() + 1);
    } else if (cycle === 'weekly') {
      next.setDate(next.getDate() + 7);
    } else if (cycle === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else if (cycle === 'quarterly') {
      next.setMonth(next.getMonth() + 3);
    } else if (cycle === 'yearly' || cycle === 'annually') {
      next.setFullYear(next.getFullYear() + 1);
    } else {
      // Fallback, assume monthly if unknown
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next;
}

export function getDaysUntilRenewal(renewalDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

