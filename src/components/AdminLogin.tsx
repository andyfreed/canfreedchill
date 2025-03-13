import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Emmy2016Isla2020!') {
      onLogin(password);
    } else {
      setError(true);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-cyber-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-cyber-darker rounded-3xl shadow-neon p-8 border border-cyber-primary/30 max-w-md w-full mx-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyber-text hover:text-cyber-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-cyber-dark rounded-full mb-4 border border-cyber-primary/30">
            <Lock className="w-6 h-6 text-cyber-primary" />
          </div>
          <h2 className="text-2xl font-bold text-cyber-primary neon-text">Admin Login</h2>
          <p className="text-cyber-text mt-2">Enter your password to manage schedules</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cyber-text mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full px-4 py-2 bg-cyber-dark border rounded-lg focus:ring-2 focus:ring-cyber-primary focus:border-transparent text-cyber-text ${
                error ? 'border-cyber-secondary' : 'border-cyber-primary/30'
              }`}
            />
            {error && (
              <p className="mt-2 text-sm text-cyber-secondary">Incorrect password</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-cyber-primary text-cyber-black rounded-lg hover:shadow-neon transition-all duration-300 font-bold uppercase tracking-wider"
          >
            <Lock className="w-4 h-4" />
            Login
          </button>
        </form>
      </div>
    </div>
  );
};