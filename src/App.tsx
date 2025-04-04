import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Mock data for offline mode
const MOCK_SCHEDULES = [
  {
    id: '1',
    startDate: new Date(2024, 3, 1), // April 1, 2024
    endDate: new Date(2024, 3, 7),   // April 7, 2024
    repeatFrequency: 'BIWEEKLY',
    notes: 'With Andy'
  },
  {
    id: '2',
    startDate: new Date(2024, 3, 15), // April 15, 2024
    endDate: new Date(2024, 3, 21),   // April 21, 2024
    repeatFrequency: 'BIWEEKLY',
    notes: 'With Andy'
  }
];

const MOCK_EVENT = {
  id: '1',
  title: 'Summer Vacation',
  startDate: new Date(2024, 5, 15), // June 15, 2024
  endDate: new Date(2024, 7, 15),   // August 15, 2024
  color: '#00ff9d'
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Simple timeout to simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleDayClick = (day: number) => {
    console.log('Day clicked:', day);
    setSelectedDay(day);
  };

  const toggleAdmin = () => {
    console.log('Admin toggled');
    setShowAdmin(!showAdmin);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center">
        <div className="text-cyber-primary mb-4">Loading mock data...</div>
        <div className="text-sm text-cyber-primary/50">
          Using simplified mode with mock data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-darker text-cyber-text p-8">
      <div className="fixed top-0 left-0 w-full bg-yellow-600 text-black text-center py-1 text-sm z-10">
        Running in simplified mode. Database connections disabled.
      </div>
      
      <div className="max-w-7xl mx-auto mt-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-cyber-primary">Can Freed Chill?</h1>
          <button 
            onClick={toggleAdmin}
            className="px-4 py-2 bg-cyber-primary text-black rounded hover:bg-cyber-primary/80 transition-colors cursor-pointer"
          >
            {showAdmin ? 'Hide Admin' : 'Admin Login'}
          </button>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-cyber-dark p-6 rounded-2xl border border-cyber-primary/20">
            <h3 className="text-lg font-medium text-purple-300 mb-4">Static Calendar</h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-medium text-cyber-primary">{day}</div>
              ))}
              
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const isSelected = selectedDay === day;
                
                return (
                  <div 
                    key={i} 
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square flex items-center justify-center rounded cursor-pointer transition-colors
                      ${isSelected 
                        ? 'bg-cyber-primary text-black' 
                        : 'bg-cyber-dark border border-cyber-primary/20 hover:border-cyber-primary/50'
                      }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {showAdmin && (
            <div className="bg-cyber-dark p-6 rounded-2xl border border-cyber-primary/20">
              <h3 className="text-lg font-medium text-purple-300 mb-4">Admin Panel (Demo)</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Form submitted!'); }}>
                <div>
                  <label className="block text-sm text-cyber-primary mb-1">Event Title</label>
                  <input 
                    type="text" 
                    className="w-full p-2 bg-cyber-darker border border-cyber-primary/20 rounded text-white"
                    placeholder="Enter event title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-cyber-primary mb-1">Start Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 bg-cyber-darker border border-cyber-primary/20 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cyber-primary mb-1">End Date</label>
                    <input 
                      type="date" 
                      className="w-full p-2 bg-cyber-darker border border-cyber-primary/20 rounded text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-cyber-primary mb-1">Color</label>
                  <input 
                    type="color" 
                    defaultValue="#00ff9d"
                    className="w-full p-1 h-10 bg-cyber-darker border border-cyber-primary/20 rounded"
                  />
                </div>
                <div>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-cyber-primary text-black rounded hover:bg-cyber-primary/80 transition-colors cursor-pointer"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-cyber-dark p-6 rounded-2xl border border-cyber-primary/20">
            <h3 className="text-lg font-medium text-purple-300 mb-4">Next Event</h3>
            <div className="text-cyber-primary">
              <div className="text-xl font-bold mb-2">{MOCK_EVENT.title}</div>
              <div>
                {format(MOCK_EVENT.startDate, 'MMM d')} - {format(MOCK_EVENT.endDate, 'MMM d, yyyy')}
              </div>
              <div className="mt-4">
                <span className="text-sm">Days until event: </span>
                <span className="text-2xl font-bold">
                  {Math.ceil((MOCK_EVENT.startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;