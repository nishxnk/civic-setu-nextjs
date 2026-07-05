import { getSlaHours } from "@/config/config";

/**
 * Calculate the SLA deadline for a complaint based on its category.
 * SLA is calculated in working hours (8 hours/day, Mon-Sat).
 */
export function calculateSlaDeadline(category: string, createdAt?: Date): Date {
  const hours = getSlaHours(category);
  const start = createdAt ? new Date(createdAt) : new Date();
  return addWorkingHours(start, hours);
}

/**
 * Check if a complaint has breached its SLA deadline.
 */
export function isSlaBreached(
  slaDeadline: Date,
  status: string,
  resolvedDate?: Date
): boolean {
  if (status === "resolved") {
    if (!resolvedDate) return false;
    return new Date(resolvedDate) > new Date(slaDeadline);
  }
  return new Date() > new Date(slaDeadline);
}

/**
 * Get remaining SLA time as a human-readable string.
 * Returns null if SLA has already breached.
 */
export function getSlaRemainingText(slaDeadline: Date): string | null {
  const now = new Date();
  const diff = new Date(slaDeadline).getTime() - now.getTime();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  return `${hours}h ${mins}m remaining`;
}

/**
 * Add working hours to a date (8-hour days, Mon-Sat, no holidays for MVP).
 */
function addWorkingHours(date: Date, hours: number): Date {
  const result = new Date(date);
  let remaining = hours;

  while (remaining > 0) {
    const day = result.getDay();
    // Skip Sunday (0)
    if (day === 0) {
      result.setDate(result.getDate() + 1);
      result.setHours(8, 0, 0, 0);
      continue;
    }

    const currentHour = result.getHours();
    const workEnd = 18; // 6 PM
    const workStart = 8; // 8 AM

    if (currentHour >= workEnd || currentHour < workStart) {
      // Outside working hours, move to next work start
      result.setHours(workStart, 0, 0, 0);
      if (currentHour >= workEnd) {
        result.setDate(result.getDate() + 1);
      }
      continue;
    }

    const hoursLeftInDay = workEnd - currentHour;
    if (remaining <= hoursLeftInDay) {
      result.setHours(result.getHours() + remaining);
      remaining = 0;
    } else {
      remaining -= hoursLeftInDay;
      result.setDate(result.getDate() + 1);
      result.setHours(workStart, 0, 0, 0);
    }
  }

  return result;
}
