/**
 * Utility functions for date formatting and calculations
 */

export interface DateRange {
  start: string;
  end?: string;
}

export interface FormattedDateRange {
  startFormatted: string;
  endFormatted: string;
  duration: string;
}

/**
 * Format a date string (YYYY-MM format) to a readable format
 */
export function formatDate(dateString: string): string {
  if (dateString === 'present') return 'Present';
  
  try {
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Month is 0-indexed in JavaScript
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  } catch (error) {
    console.warn(`Invalid date format: ${dateString}`);
    return dateString;
  }
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(start: string, end?: string): string {
  try {
    // Parse start date
    const startParts = start.split('-');
    const startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, 1);
    
    // Parse end date
    let endDate: Date;
    if (end && end !== 'present') {
      const endParts = end.split('-');
      endDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, 1);
    } else {
      endDate = new Date();
    }
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    if (months < 1) {
      return 'Less than 1 month';
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.warn(`Error calculating duration for dates: ${start} - ${end}`);
    return 'Duration unknown';
  }
}

/**
 * Format a complete date range with duration
 */
export function formatDateRange(dateRange: DateRange): FormattedDateRange {
  const startFormatted = formatDate(dateRange.start);
  const endFormatted = dateRange.end ? formatDate(dateRange.end) : 'Present';
  const duration = calculateDuration(dateRange.start, dateRange.end);
  
  return {
    startFormatted,
    endFormatted,
    duration
  };
}

/**
 * Sort experiences by start date (most recent first)
 */
export function sortExperiencesByDate<T extends { data: { startDate: string } }>(experiences: T[]): T[] {
  return experiences.sort((a, b) => {
    try {
      const partsA = a.data.startDate.split('-');
      const partsB = b.data.startDate.split('-');
      const dateA = new Date(parseInt(partsA[0]), parseInt(partsA[1]) - 1, 1);
      const dateB = new Date(parseInt(partsB[0]), parseInt(partsB[1]) - 1, 1);
      return dateB.getTime() - dateA.getTime();
    } catch (error) {
      console.warn('Error sorting experiences by date:', error);
      return 0;
    }
  });
}

/**
 * Validate date format (YYYY-MM)
 */
export function isValidDateFormat(dateString: string): boolean {
  if (dateString === 'present') return true;
  
  const dateRegex = /^\d{4}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  try {
    const date = new Date(dateString + '-01');
    const isValid = !isNaN(date.getTime());
    
    // Additional validation: check if month is valid (01-12)
    if (isValid) {
      const [year, month] = dateString.split('-');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      return monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= new Date().getFullYear() + 10;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Normalize date string to ensure consistent format
 */
export function normalizeDateString(dateString: string): string {
  if (dateString === 'present') return 'present';
  
  // Handle various input formats
  const cleaned = dateString.trim().toLowerCase();
  
  // If already in YYYY-MM format, return as is
  if (/^\d{4}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Handle YYYY-M format (single digit month)
  if (/^\d{4}-\d{1}$/.test(cleaned)) {
    const [year, month] = cleaned.split('-');
    return `${year}-${month.padStart(2, '0')}`;
  }
  
  // Handle "current", "now", etc.
  if (['current', 'now', 'ongoing'].includes(cleaned)) {
    return 'present';
  }
  
  // If we can't parse it, return the original
  console.warn(`Unable to normalize date format: ${dateString}`);
  return dateString;
}

/**
 * Get relative time description (e.g., "2 years ago", "current")
 */
export function getRelativeTime(dateString: string): string {
  if (dateString === 'present') return 'Current';
  
  try {
    const date = new Date(dateString + '-01');
    const now = new Date();
    const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    
    if (diffInMonths < 1) {
      return 'Current';
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.warn(`Error calculating relative time for: ${dateString}`);
    return 'Unknown';
  }
}