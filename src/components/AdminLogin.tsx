import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  onClose: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-cyber-dark p-6 rounded-2xl border border-cyber-primary/20 w-full max-w-md">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-medium text-purple-300">Admin Login</h2>
          <button 
            onClick={onClose}
            className="text-cyber-text/50 hover:text-cyber-text"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-cyber-text/70 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cyber-dark-secondary text-cyber-text border border-cyber-primary/20 rounded px-3 py-2"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyber-primary text-black py-2 rounded hover:bg-cyber-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Login
          </button>
        </form>
      </div>
    </div>
  );
};