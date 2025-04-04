import { ParentingSchedule } from '../types';
import { 
  addWeeks, 
  addMonths, 
  addYears, 
  isBefore,
  isAfter,
  isWithinInterval, 
  addYears as addYearsDate,
  areIntervalsOverlapping,
  isEqual,
  isSameDay
} from 'date-fns';

export function getRepeatingDates(schedule: ParentingSchedule, targetDate: Date): Date[] {
  const dates: Date[] = [];
  let currentStart = new Date(schedule.startDate);
  let currentEnd = new Date(schedule.endDate);
  
  // If no repeatUntil is set, we'll look ahead 2 years by default
  const repeatUntil = schedule.repeatUntil || addYearsDate(targetDate, 2);

  while (isBefore(currentStart, repeatUntil)) {
    dates.push(new Date(currentStart));
    
    switch (schedule.repeat) {
      case 'weekly':
        currentStart = addWeeks(currentStart, 1);
        currentEnd = addWeeks(currentEnd, 1);
        break;
      case 'biweekly':
        currentStart = addWeeks(currentStart, 2);
        currentEnd = addWeeks(currentEnd, 2);
        break;
      case 'monthly':
        currentStart = addMonths(currentStart, 1);
        currentEnd = addMonths(currentEnd, 1);
        break;
      case 'yearly':
        currentStart = addYears(currentStart, 1);
        currentEnd = addYears(currentEnd, 1);
        break;
      default:
        return [new Date(schedule.startDate)];
    }
  }

  return dates;
}

export function isDateInSchedule(date: Date, schedule: ParentingSchedule): boolean {
  if (schedule.repeat === 'none') {
    return isWithinInterval(date, { start: schedule.startDate, end: schedule.endDate });
  }

  // For indefinite repeating schedules, look ahead 2 years from the given date
  const repeatUntil = schedule.repeatUntil || addYearsDate(date, 2);
  let currentStart = new Date(schedule.startDate);
  let currentEnd = new Date(schedule.endDate);

  while (isBefore(currentStart, repeatUntil)) {
    if (isWithinInterval(date, { start: currentStart, end: currentEnd })) {
      return true;
    }

    switch (schedule.repeat) {
      case 'weekly':
        currentStart = addWeeks(currentStart, 1);
        currentEnd = addWeeks(currentEnd, 1);
        break;
      case 'biweekly':
        currentStart = addWeeks(currentStart, 2);
        currentEnd = addWeeks(currentEnd, 2);
        break;
      case 'monthly':
        currentStart = addMonths(currentStart, 1);
        currentEnd = addMonths(currentEnd, 1);
        break;
      case 'yearly':
        currentStart = addYears(currentStart, 1);
        currentEnd = addYears(currentEnd, 1);
        break;
    }
  }

  return false;
}

export function findOverlappingSchedules(
  startDate: Date,
  endDate: Date,
  schedules: ParentingSchedule[]
): { startDate: Date; endDate: Date }[] {
  const overlappingPeriods: { startDate: Date; endDate: Date }[] = [];
  const targetStart = new Date(startDate);
  const targetEnd = new Date(endDate);

  schedules.forEach(schedule => {
    if (schedule.repeat === 'none') {
      const scheduleStart = new Date(schedule.startDate);
      const scheduleEnd = new Date(schedule.endDate);
      
      // Only consider it a conflict if the schedule end is after target start
      // AND schedule start is before target end
      if (isAfter(scheduleEnd, targetStart) && isBefore(scheduleStart, targetEnd)) {
        overlappingPeriods.push({
          startDate: scheduleStart,
          endDate: scheduleEnd
        });
      }
    } else {
      // For repeating schedules
      const repeatUntil = schedule.repeatUntil || addYearsDate(endDate, 2);
      let currentStart = new Date(schedule.startDate);
      let currentEnd = new Date(schedule.endDate);

      while (isBefore(currentStart, repeatUntil)) {
        // Only consider it a conflict if the current period end is after target start
        // AND current period start is before target end
        if (isAfter(currentEnd, targetStart) && isBefore(currentStart, targetEnd)) {
          overlappingPeriods.push({
            startDate: new Date(currentStart),
            endDate: new Date(currentEnd)
          });
        }

        switch (schedule.repeat) {
          case 'weekly':
            currentStart = addWeeks(currentStart, 1);
            currentEnd = addWeeks(currentEnd, 1);
            break;
          case 'biweekly':
            currentStart = addWeeks(currentStart, 2);
            currentEnd = addWeeks(currentEnd, 2);
            break;
          case 'monthly':
            currentStart = addMonths(currentStart, 1);
            currentEnd = addMonths(currentEnd, 1);
            break;
          case 'yearly':
            currentStart = addYears(currentStart, 1);
            currentEnd = addYears(currentEnd, 1);
            break;
        }
      }
    }
  });

  return overlappingPeriods
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .filter((period, index, self) => {
      // Remove duplicates
      return index === 0 || !isEqual(period.startDate, self[index - 1].startDate);
    });
}

export type DayAvailability = {
  morning?: boolean;
  afternoon?: boolean;
  evening?: boolean;
  isFullyAvailable: boolean;
};

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  availability: DayAvailability;
  isSelected?: boolean;
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-11
  weeks: CalendarDay[][];
}

export function generateCalendarMonth(year: number, month: number): CalendarMonth {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get the last day of previous month to fill in the first week
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  
  const today = new Date();
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];
  
  // Fill in days from previous month
  for (let i = 0; i < startingDayOfWeek; i++) {
    const date = new Date(year, month - 1, daysInPreviousMonth - startingDayOfWeek + i + 1);
    currentWeek.push({
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        isFullyAvailable: true
      }
    });
  }
  
  // Fill in days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    currentWeek.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      availability: {
        morning: true,
        afternoon: true,
        evening: true,
        isFullyAvailable: true
      }
    });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Fill in days from next month
  if (currentWeek.length > 0) {
    const daysNeeded = 7 - currentWeek.length;
    for (let day = 1; day <= daysNeeded; day++) {
      const date = new Date(year, month + 1, day);
      currentWeek.push({
        date,
        dayOfMonth: day,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        availability: {
          morning: true,
          afternoon: true,
          evening: true,
          isFullyAvailable: true
        }
      });
    }
    weeks.push(currentWeek);
  }
  
  return {
    year,
    month,
    weeks
  };
}

export function getMonthName(month: number): string {
  return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
}

export function getDayAvailability(date: Date, schedules: ParentingSchedule[]): DayAvailability {
  const morning = !findOverlappingSchedules(
    new Date(date.setHours(0, 0, 0, 0)),
    new Date(date.setHours(8, 0, 0, 0)),
    schedules
  ).length;

  const afternoon = !findOverlappingSchedules(
    new Date(date.setHours(8, 0, 0, 0)),
    new Date(date.setHours(16, 0, 0, 0)),
    schedules
  ).length;

  const evening = !findOverlappingSchedules(
    new Date(date.setHours(16, 0, 0, 0)),
    new Date(date.setHours(23, 59, 59, 999)),
    schedules
  ).length;

  return {
    morning,
    afternoon,
    evening,
    isFullyAvailable: morning && afternoon && evening
  };
}

export function updateCalendarAvailability(
  calendar: CalendarMonth,
  schedules: ParentingSchedule[]
): CalendarMonth {
  return {
    ...calendar,
    weeks: calendar.weeks.map(week =>
      week.map(day => ({
        ...day,
        availability: getDayAvailability(day.date, schedules)
      }))
    )
  };
}