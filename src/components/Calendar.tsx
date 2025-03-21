import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  startOfWeek,
  endOfWeek,
  isWithinInterval
} from 'date-fns';
import { ParentingSchedule } from '../types';

interface CalendarProps {
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (dates: [Date | null, Date | null]) => void;
  schedule: ParentingSchedule[];
}

export const Calendar: React.FC<CalendarProps> = ({ dateRange, onDateRangeChange, schedule }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, endDate] = dateRange;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  // Get all days to display in the calendar grid
  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      const newDate = new Date(date.setHours(0, 0, 0, 0));
      onDateRangeChange([newDate, null]);
    } else {
      // Complete selection
      const newDate = new Date(date.setHours(23, 59, 59, 999));
      if (date < startDate) {
        onDateRangeChange([newDate, startDate]);
      } else {
        onDateRangeChange([startDate, newDate]);
      }
    }
  };

  const isParentingDay = (day: Date): boolean => {
    return schedule.some(schedule => {
      if (schedule.type === 'parenting') {
        if (schedule.repeat === 'none') {
          return isWithinInterval(day, { start: schedule.startDate, end: schedule.endDate });
        }
        // Handle repeating schedules
        const start = new Date(schedule.startDate);
        const end = schedule.repeatUntil ? new Date(schedule.repeatUntil) : new Date(schedule.endDate);
        
        if (day < start || day > end) return false;
        
        switch (schedule.repeat) {
          case 'weekly':
            return day.getDay() === start.getDay();
          case 'biweekly':
            const weeksDiff = Math.floor((day.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
            return weeksDiff % 2 === 0 && day.getDay() === start.getDay();
          case 'monthly':
            return day.getDate() === start.getDate();
          case 'yearly':
            return day.getMonth() === start.getMonth() && day.getDate() === start.getDate();
          default:
            return false;
        }
      }
      return false;
    });
  };

  const getDayClasses = (day: Date) => {
    let classes = "w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-200 ";

    if (!isSameMonth(day, currentMonth)) {
      classes += "text-gray-400 hover:text-gray-300 ";
    } else {
      classes += "text-white hover:text-purple-300 ";
    }

    if (isToday(day)) {
      classes += "border-2 border-purple-400 ";
    }

    if (isParentingDay(day)) {
      classes += "bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 ";
    } else if (startDate && endDate && day >= startDate && day <= endDate) {
      classes += "bg-indigo-600/30 hover:bg-indigo-600/40 ";
    }

    if (startDate && isSameDay(day, startDate)) {
      classes += "!bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/30 ";
    }

    if (endDate && isSameDay(day, endDate)) {
      classes += "!bg-purple-500 text-white font-medium shadow-lg shadow-purple-500/30 ";
    }

    if (!startDate || (startDate && endDate)) {
      classes += "hover:bg-indigo-500/20 cursor-pointer ";
    } else {
      classes += "hover:bg-purple-500/20 cursor-pointer ";
    }

    return classes;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 border-2 border-purple-500/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 text-gray-400 hover:text-purple-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-medium text-purple-300">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 text-gray-400 hover:text-purple-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysInCalendar.map((day, idx) => (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={getDayClasses(day)}
            >
              {format(day, 'd')}
            </button>
          ))}
        </div>

        {/* Selected Range Display */}
        {(startDate || endDate) && (
          <div className="mt-6 space-y-2 border-t border-purple-500/20 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="w-4 h-4 text-purple-300" />
              <span className="text-gray-400">Selected:</span>
              <span className="text-purple-300">
                {startDate ? format(startDate, 'MMM d') : '...'}
                {' → '}
                {endDate ? format(endDate, 'MMM d') : '...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};