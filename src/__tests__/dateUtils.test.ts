import { describe, it, expect } from 'vitest';
import { isDateInSchedule, getRepeatingDates } from '../utils/dateUtils';
import { ParentingSchedule } from '../types';

describe('dateUtils', () => {
  describe('isDateInSchedule', () => {
    it('should return true for a date within a non-repeating schedule', () => {
      const schedule: ParentingSchedule = {
        id: '1',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-07'),
        type: 'parenting',
        repeat: 'none'
      };
      
      const testDate = new Date('2024-03-03');
      expect(isDateInSchedule(testDate, schedule)).toBe(true);
    });

    it('should return false for a date outside a non-repeating schedule', () => {
      const schedule: ParentingSchedule = {
        id: '1',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-07'),
        type: 'parenting',
        repeat: 'none'
      };
      
      const testDate = new Date('2024-03-08');
      expect(isDateInSchedule(testDate, schedule)).toBe(false);
    });

    it('should handle weekly repeating schedules correctly', () => {
      const schedule: ParentingSchedule = {
        id: '1',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-07'),
        type: 'parenting',
        repeat: 'weekly',
        repeatUntil: new Date('2024-04-01')
      };
      
      const testDate = new Date('2024-03-15'); // Two weeks later
      expect(isDateInSchedule(testDate, schedule)).toBe(true);
    });
  });

  describe('getRepeatingDates', () => {
    it('should return correct dates for weekly repeating schedule', () => {
      const schedule: ParentingSchedule = {
        id: '1',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-07'),
        type: 'parenting',
        repeat: 'weekly',
        repeatUntil: new Date('2024-03-22')
      };
      
      const dates = getRepeatingDates(schedule, new Date('2024-03-01'));
      expect(dates).toHaveLength(3); // Should have 3 occurrences
      expect(dates[0]).toEqual(new Date('2024-03-01'));
      expect(dates[1]).toEqual(new Date('2024-03-08'));
      expect(dates[2]).toEqual(new Date('2024-03-15'));
    });

    it('should handle non-repeating schedules', () => {
      const schedule: ParentingSchedule = {
        id: '1',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-07'),
        type: 'parenting',
        repeat: 'none'
      };
      
      const dates = getRepeatingDates(schedule, new Date('2024-03-01'));
      expect(dates).toHaveLength(1);
      expect(dates[0]).toEqual(new Date('2024-03-01'));
    });
  });
});