import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('renders the main title', () => {
    expect(screen.getByText('Can Freed Chill?')).toBeInTheDocument();
  });

  it('shows admin login button when not logged in', () => {
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
  });

  it('opens admin login modal when clicking login button', () => {
    fireEvent.click(screen.getByText('Admin Login'));
    expect(screen.getByText('Enter your password to manage schedules')).toBeInTheDocument();
  });

  it('shows date selection interface', () => {
    expect(screen.getByText('Start Date & Time')).toBeInTheDocument();
    expect(screen.getByText('End Date & Time')).toBeInTheDocument();
  });
});