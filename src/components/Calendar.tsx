import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isWithinInterval } from 'date-fns';
import { ParentingSchedule } from '../types';
import { 
  generateCalendarMonth, 
  updateCalendarAvailability, 
  getMonthName,
  CalendarMonth,
  CalendarDay
} from '../utils/dateUtils';

interface CalendarProps {
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (dates: [Date | null, Date | null]) => void;
  schedule: ParentingSchedule[];
}

export const Calendar: React.FC<CalendarProps> = ({ dateRange, onDateRangeChange, schedule }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, endDate] = dateRange;

  const calendarMonth = useMemo(() => {
    const month = generateCalendarMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    return updateCalendarAvailability(month, schedule);
  }, [currentDate, schedule]);

  const handleDateClick = (day: CalendarDay) => {
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      const newDate = new Date(day.date.setHours(0, 0, 0, 0));
      onDateRangeChange([newDate, null]);
    } else {
      // Complete selection
      const newDate = new Date(day.date.setHours(23, 59, 59, 999));
      if (day.date < startDate) {
        onDateRangeChange([newDate, startDate]);
      } else {
        onDateRangeChange([startDate, newDate]);
      }
    }
  };

  const getDayClasses = (day: CalendarDay) => {
    let classes = "relative w-full aspect-square rounded-lg flex flex-col items-center justify-start p-2 transition-all duration-200 ";

    if (!day.isCurrentMonth) {
      classes += "text-gray-400 hover:text-gray-300 ";
    } else {
      classes += "text-white hover:text-purple-300 ";
    }

    if (day.isToday) {
      classes += "border-2 border-purple-400 ";
    }

    // Base background for partial availability
    if (!day.availability.isFullyAvailable) {
      if (!day.availability.morning && day.availability.afternoon && day.availability.evening) {
        classes += "bg-gradient-to-b from-purple-600/40 via-transparent to-transparent ";
      } else if (day.availability.morning && !day.availability.afternoon && day.availability.evening) {
        classes += "bg-gradient-to-b from-transparent via-purple-600/40 to-transparent ";
      } else if (day.availability.morning && day.availability.afternoon && !day.availability.evening) {
        classes += "bg-gradient-to-b from-transparent via-transparent to-purple-600/40 ";
      } else if (!day.availability.isFullyAvailable) {
        classes += "bg-purple-600/30 ";
      }
    }

    if (startDate && endDate && day.date >= startDate && day.date <= endDate) {
      if (!day.availability.isFullyAvailable) {
        classes += "bg-gradient-to-b from-indigo-600/40 via-indigo-600/20 to-indigo-600/20 hover:from-indigo-600/50 hover:via-indigo-600/30 hover:to-indigo-600/30 ";
      } else {
        classes += "bg-indigo-600/30 hover:bg-indigo-600/40 ";
      }
    }

    if (startDate && day.date.getTime() === startDate.getTime()) {
      classes += "!bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/30 ";
    }

    if (endDate && day.date.getTime() === endDate.getTime()) {
      classes += "!bg-purple-500 text-white font-medium shadow-lg shadow-purple-500/30 ";
    }

    return classes;
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const getDateRangeInfo = () => {
    if (!startDate || !endDate) return null;

    const selectedDays = calendarMonth.weeks.flat().filter(day => 
      day.date >= startDate && 
      day.date <= endDate
    );

    const daysWithRestrictions = selectedDays.filter(day => 
      !day.availability.isFullyAvailable
    );

    if (daysWithRestrictions.length === 0) {
      return "Freed is available during this period";
    }

    // Calculate percentage of time with kids
    let totalTimeSlots = selectedDays.length * 3; // 3 time slots per day (morning, afternoon, evening)
    let restrictedTimeSlots = 0;

    daysWithRestrictions.forEach(day => {
      const { morning, afternoon, evening } = day.availability;
      if (!morning) restrictedTimeSlots++;
      if (!afternoon) restrictedTimeSlots++;
      if (!evening) restrictedTimeSlots++;
    });

    const restrictionPercentage = (restrictedTimeSlots / totalTimeSlots) * 100;

    const restrictionInfo = daysWithRestrictions.map(day => {
      const { morning, afternoon, evening } = day.availability;
      
      if (!morning && !afternoon && !evening) {
        return `${format(day.date, 'EEEE')} all day`;
      }
      
      if (!morning && afternoon && evening) {
        return `${format(day.date, 'EEEE')} in the morning`;
      }
      
      if (morning && !afternoon && evening) {
        return `${format(day.date, 'EEEE')} in the afternoon`;
      }
      
      if (morning && afternoon && !evening) {
        return `${format(day.date, 'EEEE')} in the evening`;
      }
      
      return `${format(day.date, 'EEEE')} partially`;
    }).join(', ');

    return restrictionPercentage < 25
      ? `Freed is mostly available but has the kids on ${restrictionInfo}`
      : `Freed has the kids on ${restrictionInfo}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-gray-900 border-2 border-purple-500/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-gray-400 hover:text-purple-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-medium text-purple-300">
            {getMonthName(calendarMonth.month)} {calendarMonth.year}
          </h2>
          <button
            onClick={handleNextMonth}
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
          {calendarMonth.weeks.flat().map((day) => {
            const getTooltip = () => {
              if (day.availability.isFullyAvailable) return undefined;
              const { morning, afternoon, evening } = day.availability;
              
              if (!morning && !afternoon && !evening) return "Has kids all day";
              if (!morning && afternoon && evening) return "Has kids in the morning";
              if (morning && !afternoon && evening) return "Has kids in the afternoon";
              if (morning && afternoon && !evening) return "Has kids in the evening";
              return "Has kids part of the day";
            };

            return (
              <button
                key={day.date.toISOString()}
                onClick={() => handleDateClick(day)}
                className={getDayClasses(day)}
                title={getTooltip()}
              >
                <span className="text-sm">{day.dayOfMonth}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Range Info */}
        {startDate && endDate && (
          <div className="mt-6 space-y-2 border-t border-purple-500/20 pt-4">
            <div className="text-sm text-purple-300">
              {format(startDate, 'MMM d')} → {format(endDate, 'MMM d')}
            </div>
            <div className="text-sm text-purple-300/70">
              {getDateRangeInfo()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};