import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, RefreshCw, Infinity, Clock } from 'lucide-react';
import { ParentingSchedule, RepeatFrequency } from '../types';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { VisitorLog } from './VisitorLog';
import { Calendar } from './Calendar';

interface AdminPanelProps {
  schedule: ParentingSchedule[];
  onScheduleUpdate: (newSchedule: ParentingSchedule[]) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  schedule,
  onScheduleUpdate,
  onLogout,
}) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>('none');
  const [repeatUntil, setRepeatUntil] = useState<Date | null>(null);
  const [isIndefinite, setIsIndefinite] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error loading schedules:', error);
      return;
    }

    const parsedSchedules: ParentingSchedule[] = schedules.map(schedule => ({
      id: schedule.id,
      startDate: new Date(schedule.start_date),
      endDate: new Date(schedule.end_date),
      type: schedule.type as 'parenting' | 'free',
      repeat: schedule.repeat as RepeatFrequency,
      ...(schedule.repeat_until && { repeatUntil: new Date(schedule.repeat_until) }),
    }));

    onScheduleUpdate(parsedSchedules);
  };

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

      const startDate = new Date(dateRange[0]);
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date(dateRange[1]);
      endDate.setHours(endHours, endMinutes, 0, 0);

      const newScheduleData = {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        type: 'parenting',
        repeat: repeatFrequency,
        repeat_until: repeatFrequency !== 'none' && !isIndefinite ? repeatUntil?.toISOString() : null,
        user_id: user.id
      };

      const { error } = await supabase
        .from('schedules')
        .insert([newScheduleData]);

      if (error) {
        console.error('Error saving schedule:', error);
        return;
      }

      await loadSchedules();
      
      setDateRange([null, null]);
      setStartTime("09:00");
      setEndTime("17:00");
      setRepeatFrequency('none');
      setRepeatUntil(null);
      setIsIndefinite(false);
    }
  };

  const removeSchedule = async (id: string) => {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting schedule:', error);
      return;
    }

    await loadSchedules();
  };

  return (
    <div className="space-y-6">
      <div className="bg-cyber-darker rounded-3xl shadow-2xl p-8 border border-cyber-primary/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-cyber-primary">Admin Panel</h2>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-cyber-text hover:text-cyber-primary transition-colors"
          >
            <Lock className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-cyber-text mb-4">Add New Schedule</h3>
            
            {/* Calendar */}
            <Calendar
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              schedule={schedule}
            />

            {/* Time Selection */}
            {dateRange[0] && dateRange[1] && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-cyber-dark p-6 rounded-xl border border-cyber-primary/20">
                <div className="space-y-2">
                  <label className="block text-sm text-cyber-text">Start Time</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyber-primary" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-cyber-darker border border-cyber-primary/30 rounded-lg px-3 py-2 text-cyber-text focus:border-cyber-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-cyber-text">End Time</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyber-primary" />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-cyber-darker border border-cyber-primary/30 rounded-lg px-3 py-2 text-cyber-text focus:border-cyber-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Repeat Options */}
            {dateRange[0] && dateRange[1] && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-cyber-text mb-2">Repeat</label>
                    <select
                      value={repeatFrequency}
                      onChange={(e) => {
                        setRepeatFrequency(e.target.value as RepeatFrequency);
                        if (e.target.value === 'none') {
                          setIsIndefinite(false);
                        }
                      }}
                      className="w-full px-4 py-2 bg-cyber-darker border border-cyber-primary/30 rounded-lg text-cyber-text focus:border-cyber-primary focus:outline-none"
                    >
                      <option value="none">No Repeat</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  {repeatFrequency !== 'none' && !isIndefinite && (
                    <div>
                      <label className="block text-sm text-cyber-text mb-2">Repeat Until</label>
                      <input
                        type="date"
                        value={repeatUntil?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setRepeatUntil(new Date(e.target.value))}
                        min={dateRange[1]?.toISOString().split('T')[0]}
                        className="w-full px-4 py-2 bg-cyber-darker border border-cyber-primary/30 rounded-lg text-cyber-text focus:border-cyber-primary focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {repeatFrequency !== 'none' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="indefinite"
                      checked={isIndefinite}
                      onChange={(e) => {
                        setIsIndefinite(e.target.checked);
                        if (e.target.checked) {
                          setRepeatUntil(null);
                        }
                      }}
                      className="rounded border-cyber-primary/30 text-cyber-primary focus:ring-cyber-primary bg-cyber-darker"
                    />
                    <label htmlFor="indefinite" className="text-sm text-cyber-text flex items-center gap-1">
                      Repeat indefinitely <Infinity className="w-4 h-4 text-cyber-primary" />
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={addSchedule}
                disabled={!dateRange[0] || !dateRange[1] || (repeatFrequency !== 'none' && !isIndefinite && !repeatUntil)}
                className="flex items-center gap-2 px-6 py-3 bg-cyber-primary text-cyber-black rounded-xl hover:shadow-neon disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                Add Schedule
              </button>
            </div>
          </div>

          {/* Current Schedule */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-cyber-text mb-4">Current Schedule</h3>
            <div className="space-y-3">
              {schedule.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center justify-between p-4 bg-cyber-dark rounded-xl border border-cyber-primary/20"
                >
                  <div className="flex-1">
                    <p className="text-cyber-text font-medium">
                      {format(period.startDate, 'MMMM d, yyyy h:mm aa')} -{' '}
                      {format(period.endDate, 'MMMM d, yyyy h:mm aa')}
                    </p>
                    {period.repeat !== 'none' && (
                      <p className="text-sm text-cyber-text/70 mt-1 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Repeats {period.repeat}
                        {period.repeatUntil ? (
                          ` until ${format(period.repeatUntil, 'MMMM d, yyyy')}`
                        ) : (
                          <span className="flex items-center gap-1">
                            indefinitely <Infinity className="w-3 h-3" />
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeSchedule(period.id)}
                    className="p-2 text-cyber-secondary hover:text-cyber-secondary/70 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {schedule.length === 0 && (
                <p className="text-cyber-text/50 text-center py-4">No schedules added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <VisitorLog />
    </div>
  );
};