/**
 * Day names for labeling
 */
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]!;
};

/**
 * Get the day name from a date
 */
export const getDayName = (date: Date): string => {
  return DAY_NAMES[date.getDay()]!;
};

/**
 * Generate array of dates for the last N days (including today)
 */
export const getDateRange = (referenceDate: string, days: number): string[] => {
  const dates: string[] = [];
  const refDate = new Date(referenceDate);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(refDate);
    date.setDate(refDate.getDate() - i);
    dates.push(formatDate(date));
  }

  return dates;
};

/**
 * Determine time period from HH:MM format
 */
export const getTimePeriod = (
  time: string,
): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = parseInt(time.split(':')[0] || '0', 10);

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

/**
 * Get label for time period
 */
export const getTimePeriodLabel = (
  period: 'morning' | 'afternoon' | 'evening' | 'night',
): string => {
  const labels = {
    morning: 'Pagi (06:00 - 12:00)',
    afternoon: 'Siang (12:00 - 17:00)',
    evening: 'Sore (17:00 - 21:00)',
    night: 'Malam (21:00 - 06:00)',
  };
  return labels[period];
};

/**
 * Get today's date in a specific timezone
 * @param timezone - IANA timezone string (e.g., 'Asia/Jakarta', 'America/New_York')
 * @returns Date string in YYYY-MM-DD format
 */
export const getTodayInTimezone = (timezone?: string): string => {
  const now = new Date();

  if (!timezone) {
    // Default to UTC if no timezone provided
    return formatDate(now);
  }

  try {
    // Use Intl.DateTimeFormat to get the date parts in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    // en-CA locale returns date in YYYY-MM-DD format
    return formatter.format(now);
  } catch {
    // Invalid timezone, fall back to UTC
    return formatDate(now);
  }
};
