import React, { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { ParentingSchedule, AdminState, RepeatFrequency } from './types';
import { Settings, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from './lib/supabase';

function App() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [adminState, setAdminState] = useState<AdminState>({
    isAdmin: false,
    password: '',
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [parentingSchedule, setParentingSchedule] = useState<ParentingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadSchedules();
  }, []);

  const checkAuthAndLoadSchedules = async () => {
    try {
      // Check auth state
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAdminState({ isAdmin: true, password: '' });
        setShowAdminPanel(true);
      }

      // Load schedules for all users
      await loadSchedules();
    } catch (error) {
      console.error('Error checking auth:', error);
    }

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setAdminState({ isAdmin: true, password: '' });
        setShowAdminPanel(true);
      } else if (event === 'SIGNED_OUT') {
        setAdminState({ isAdmin: false, password: '' });
        setShowAdminPanel(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  };

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const { data: schedules, error } = await supabase
        .from('schedules')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;

      const parsedSchedules: ParentingSchedule[] = schedules.map(schedule => ({
        id: schedule.id,
        startDate: new Date(schedule.start_date),
        endDate: new Date(schedule.end_date),
        type: schedule.type as 'parenting' | 'free',
        repeat: schedule.repeat as RepeatFrequency,
        ...(schedule.repeat_until && { repeatUntil: new Date(schedule.repeat_until) }),
      }));

      setParentingSchedule(parsedSchedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@canfreedchill.com',
        password: password
      });

      if (error) throw error;

      setAdminState({ isAdmin: true, password });
      setShowAdminPanel(true);
      setShowAdminLogin(false);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAdminState({ isAdmin: false, password: '' });
      setShowAdminPanel(false);
      setShowAdminLogin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleView = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-black retro-grid flex items-center justify-center">
        <div className="text-cyber-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-black retro-grid">
      {/* Navigation Bar */}
      <nav className="bg-cyber-darker border-b border-cyber-primary/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-cyber-primary">
                Can Freed Chill?
              </h1>
            </div>
            {adminState.isAdmin ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleView}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showAdminPanel
                      ? 'text-cyber-primary bg-cyber-dark hover:bg-cyber-dark/70'
                      : 'text-cyber-text hover:text-cyber-primary'
                  }`}
                >
                  {showAdminPanel ? (
                    <>
                      View Calendar
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Manage Schedule
                    </>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-cyber-text hover:text-cyber-secondary transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center gap-2 px-4 py-2 text-cyber-text hover:text-cyber-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
                Admin Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {adminState.isAdmin && showAdminPanel ? (
          <AdminPanel
            schedule={parentingSchedule}
            onScheduleUpdate={setParentingSchedule}
            onLogout={handleLogout}
          />
        ) : (
          <div className="bg-cyber-darker rounded-3xl shadow-2xl p-8 border border-cyber-primary/30 backdrop-blur-sm">
            <div className="text-center mb-8">
              <p className="text-cyber-text mt-2">Select some dates to see if Freed can chill.</p>
            </div>

            <div className="space-y-8">
              <div className="bg-cyber-dark p-8 rounded-2xl border border-cyber-primary/20">
                <Calendar
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  schedule={parentingSchedule}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showAdminLogin && (
        <AdminLogin 
          onLogin={handleLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

export default App;