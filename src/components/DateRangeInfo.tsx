import React from 'react';
import { ParentingSchedule } from '../types';
import { findOverlappingSchedules } from '../utils/dateUtils';

interface DateRangeInfoProps {
  dateRange: [Date | null, Date | null];
  schedule: ParentingSchedule[];
}

export const DateRangeInfo: React.FC<DateRangeInfoProps> = ({ dateRange, schedule }) => {
  if (!dateRange[0] || !dateRange[1]) {
    return null;
  }

  const overlappingSchedules = findOverlappingSchedules(dateRange[0], dateRange[1], schedule);
  
  if (overlappingSchedules.length === 0) {
    return (
      <p className="text-cyber-text">
        Freed is available during this period
      </p>
    );
  }

  // If there are overlapping schedules, show restricted availability
  return (
    <p className="text-cyber-text">
      Freed has parenting time during this period
    </p>
  );
}; 