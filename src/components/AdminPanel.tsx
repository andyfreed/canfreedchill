import React, { useState } from 'react';
import { Plus, Trash2, Lock, RefreshCw, Infinity, Clock } from 'lucide-react';
import { ParentingSchedule, RepeatFrequency, CountdownEvent } from '../types';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { VisitorLog } from './VisitorLog';
import { Calendar } from './Calendar';

interface AdminPanelProps {
  schedule: ParentingSchedule[];
  onScheduleUpdate: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  schedule,
  onScheduleUpdate,
  onLogout,
  isOpen,
  onClose,
}) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>('NONE');
  const [repeatUntil, setRepeatUntil] = useState<Date | null>(null);
  const [isIndefinite, setIsIndefinite] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Event state
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventColor, setEventColor] = useState('#FF4081');
  const [activeTab, setActiveTab] = useState<'schedule' | 'events'>('schedule');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSchedule = async () => {
    if (dateRange[0] && dateRange[1]) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      // Set the times on the dates
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const startDateObj = new Date(dateRange[0]);
      startDateObj.setHours(startHours, startMinutes, 0, 0);

      const endDateObj = new Date(dateRange[1]);
      endDateObj.setHours(endHours, endMinutes, 0, 0);

      const newScheduleData = {
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        repeatFrequency,
        repeatUntil: repeatFrequency !== 'NONE' && !isIndefinite ? repeatUntil?.toISOString() : null,
        notes
      };

      const { error } = await supabase
        .from('parenting_schedules')
        .insert([newScheduleData]);

      if (error) {
        console.error('Error saving schedule:', error);
        return;
      }

      // Trigger parent's update function
      onScheduleUpdate();
      
      // Reset form
      setDateRange([null, null]);
      setStartTime("09:00");
      setEndTime("17:00");
      setRepeatFrequency('NONE');
      setRepeatUntil(null);
      setIsIndefinite(false);
      setNotes('');
    }
  };

  const removeSchedule = async (id: string) => {
    const { error } = await supabase
      .from('parenting_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting schedule:', error);
      return;
    }

    // Trigger parent's update function
    onScheduleUpdate();
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      // Set the times on the dates
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const startDateObj = new Date(startDate);
      startDateObj.setHours(startHours, startMinutes, 0, 0);

      const endDateObj = new Date(endDate);
      endDateObj.setHours(endHours, endMinutes, 0, 0);

      const scheduleData = {
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        repeatFrequency,
        repeatUntil: repeatFrequency !== 'NONE' && !isIndefinite ? repeatUntil?.toISOString() : null,
        notes
      };

      console.log('Submitting schedule:', scheduleData);

      const { error } = await supabase
        .from('parenting_schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting schedule:', error);
        return;
      }

      // Trigger parent's update function
      onScheduleUpdate();

      // Reset form
      setStartDate('');
      setEndDate('');
      setStartTime("09:00");
      setEndTime("17:00");
      setRepeatFrequency('NONE');
      setRepeatUntil(null);
      setIsIndefinite(false);
      setNotes('');
    } catch (err) {
      console.error('Error in handleScheduleSubmit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const event = {
        title: eventTitle,
        start_date: eventStartDate, // Already in YYYY-MM-DD format
        end_date: eventEndDate,     // Already in YYYY-MM-DD format
        color: eventColor
      };

      console.log('Submitting event:', event);

      const { data, error } = await supabase
        .from('countdown_events')
        .insert([event])
        .select()
        .single();

      if (error) {
        console.error('Error inserting event:', error.message);
        return;
      }

      console.log('Event added successfully:', data);

      // Trigger parent's update function to refresh events
      onScheduleUpdate();

      // Reset form
      setEventTitle('');
      setEventStartDate('');
      setEventEndDate('');
      setEventColor('#FF4081');
    } catch (err) {
      console.error('Error in handleEventSubmit:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-cyber-dark p-6 rounded-2xl border border-cyber-primary/20 w-full max-w-md">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-medium text-purple-300">Admin Panel</h2>
          <button onClick={onClose} className="text-cyber-text/50 hover:text-cyber-text">✕</button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'schedule' ? 'bg-cyber-primary text-black' : 'text-cyber-text/70'}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'events' ? 'bg-cyber-primary text-black' : 'text-cyber-text/70'}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
        </div>

        {activeTab === 'schedule' ? (
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">Repeat</label>
              <select
                value={repeatFrequency}
                onChange={(e) => setRepeatFrequency(e.target.value as RepeatFrequency)}
                className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
              >
                <option value="NONE">No repeat</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Biweekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            {repeatFrequency !== 'NONE' && !isIndefinite && (
              <div>
                <label className="block text-sm text-cyber-text/70 mb-1">Repeat Until</label>
                <input
                  type="date"
                  value={repeatUntil ? format(repeatUntil, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setRepeatUntil(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
                />
              </div>
            )}
            {repeatFrequency !== 'NONE' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isIndefinite}
                  onChange={(e) => setIsIndefinite(e.target.checked)}
                  className="bg-cyber-dark-secondary border border-cyber-primary/20 rounded"
                />
                <label className="text-sm text-cyber-text/70">Repeat indefinitely</label>
              </div>
            )}
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyber-primary text-black py-2 rounded hover:bg-cyber-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding Schedule...' : 'Add Schedule'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">Event Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">Start Date</label>
              <input
                type="date"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">End Date</label>
              <input
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cyber-text/70 mb-1">Calendar Color</label>
              <input
                type="color"
                value={eventColor}
                onChange={(e) => setEventColor(e.target.value)}
                className="w-full h-10 bg-cyber-dark-secondary border border-cyber-primary/20 rounded px-1"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-cyber-primary text-black py-2 rounded hover:bg-cyber-primary/90 transition-colors"
            >
              Add Event
            </button>
          </form>
        )}
      </div>
    </div>
  );
};