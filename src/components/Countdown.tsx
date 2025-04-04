import React, { useState, useEffect } from 'react';
import { differenceInMilliseconds, format } from 'date-fns';

interface CountdownEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface CountdownProps {
  event: CountdownEvent | null;
}

interface TimeLeft {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const difference = differenceInMilliseconds(targetDate, new Date());
  
  return {
    total: difference,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
};

const formatTimeUnit = (value: number, unit: string): string => {
  return `${value} ${unit}${value !== 1 ? 's' : ''}`;
};

export const Countdown: React.FC<CountdownProps> = ({ event }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    if (!event) return;
    
    const targetDate = new Date(event.startDate);
    targetDate.setHours(8, 0, 0, 0);
    
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(targetDate));
    };
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(timer);
  }, [event]);
  
  if (!event || !timeLeft) {
    return (
      <div className="bg-cyber-dark p-6 rounded-2xl border border-cyber-primary/20">
        <h3 className="text-lg font-medium text-purple-300 mb-4">Event Countdown</h3>
        <p className="text-cyber-text/50 text-sm">No upcoming events</p>
      </div>
    );
  }

  const isEventStarted = timeLeft.total <= 0;
  
  return (
    <div className="bg-cyber-dark p-6 rounded-2xl border border-cyber-primary/20">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-purple-300">
          {event.title}
        </h3>
        <button 
          className="text-cyber-text/50 hover:text-cyber-text transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isEventStarted ? (
        <p className="text-[#00ff9d] mt-4">Event has started!</p>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-2xl text-[#00ff9d] font-mono">
            {formatTimeUnit(timeLeft.days, 'day')}, {formatTimeUnit(timeLeft.hours, 'hour')}, {formatTimeUnit(timeLeft.minutes, 'minute')}, {formatTimeUnit(timeLeft.seconds, 'second')}
          </p>
          
          {isExpanded && (
            <div className="space-y-2 text-sm text-cyber-text/70 border-t border-cyber-primary/20 pt-4 mt-4">
              <p>Total milliseconds: {timeLeft.total.toLocaleString()}</p>
              <p>Total seconds: {Math.floor(timeLeft.total / 1000).toLocaleString()}</p>
              <p>Total minutes: {Math.floor(timeLeft.total / (1000 * 60)).toLocaleString()}</p>
              <p>Total hours: {Math.floor(timeLeft.total / (1000 * 60 * 60)).toLocaleString()}</p>
              <p>Total days: {Math.floor(timeLeft.total / (1000 * 60 * 60 * 24)).toLocaleString()}</p>
              <p>Total weeks: {Math.floor(timeLeft.total / (1000 * 60 * 60 * 24 * 7)).toLocaleString()}</p>
              <p>Date format: {format(event.startDate, "EEEE, MMMM do 'at' h:mm aa")}</p>
              <div 
                className="w-4 h-4 rounded mt-2" 
                style={{ backgroundColor: event.color }} 
                title="Calendar color"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 