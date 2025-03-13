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
  isEqual
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