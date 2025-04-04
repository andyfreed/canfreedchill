import React, { useEffect, useState } from 'react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

interface HistoricalWeatherProps {
  dateRange: [Date | null, Date | null];
}

interface WeatherData {
  date: string;
  temperature: number;
}

interface Location {
  name: string;
  query: string;
}

const LOCATIONS: Location[] = [
  { name: 'Massachusetts', query: 'Massachusetts,MA,USA' },
  { name: 'New Hampshire', query: 'New Hampshire,NH,USA' },
  { name: 'Vermont', query: 'Vermont,VT,USA' },
  { name: 'Maine', query: 'Maine,ME,USA' },
  { name: 'New Jersey', query: 'New Jersey,NJ,USA' }
];

const MIN_DATE = new Date('2010-01-01');
const MAX_DAYS_AGO = 365; // WeatherAPI free tier limitation

export const HistoricalWeather: React.FC<HistoricalWeatherProps> = ({ dateRange }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);

  useEffect(() => {
    const fetchHistoricalWeather = async () => {
      if (!dateRange[0] || !dateRange[1]) return;
      
      // Skip API call for New Jersey
      if (selectedLocation.query.includes('NJ')) {
        setWeatherData([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Validate date range
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (isBefore(startDate, MIN_DATE) || isBefore(endDate, MIN_DATE)) {
        setError('Historical weather data is only available from January 1st, 2010 onwards');
        setWeatherData([]);
        return;
      }

      const maxHistoricalDate = new Date();
      maxHistoricalDate.setDate(maxHistoricalDate.getDate() - MAX_DAYS_AGO);
      maxHistoricalDate.setHours(0, 0, 0, 0);

      if (isBefore(startDate, maxHistoricalDate) || isBefore(endDate, maxHistoricalDate)) {
        setError(`Historical weather data is only available for the last ${MAX_DAYS_AGO} days`);
        setWeatherData([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      
      if (!apiKey || apiKey === 'your_api_key_here') {
        setError('Weather API key not configured');
        setIsLoading(false);
        return;
      }

      try {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');

        const response = await fetch(
          `https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${selectedLocation.query}&dt=${formattedStartDate}&end_dt=${formattedEndDate}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'Failed to fetch weather data');
        }

        const data = await response.json();
        
        if (!data.forecast?.forecastday) {
          throw new Error('Invalid weather data format received');
        }

        setWeatherData(data.forecast.forecastday.map((day: any) => ({
          date: day.date,
          temperature: day.day.avgtemp_f
        })));
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load historical weather data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalWeather();
  }, [dateRange, selectedLocation]);

  if (!dateRange[0] || !dateRange[1]) {
    return <p className="text-cyber-text/50">Select dates to see weather info</p>;
  }

  if (isLoading) {
    return <p className="text-cyber-text">Loading historical temperature data...</p>;
  }

  if (error) {
    return (
      <div className="text-cyber-secondary">
        <p>{error}</p>
        {error === 'Weather API key not configured' && (
          <p className="text-xs text-cyber-text/50 mt-2">
            To enable historical weather data, please configure a valid API key from WeatherAPI.com in the .env file.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <select
          value={selectedLocation.query}
          onChange={(e) => {
            const location = LOCATIONS.find(loc => loc.query === e.target.value);
            if (location) setSelectedLocation(location);
          }}
          className="
            bg-[#1a1a2e] 
            text-[#00ff9d] 
            border-2 
            border-[#00ff9d]/30 
            rounded 
            px-3 
            py-1.5 
            text-sm 
            focus:outline-none 
            focus:border-[#00ff9d] 
            focus:shadow-[0_0_10px_rgba(0,255,157,0.3)] 
            hover:border-[#00ff9d]/50
            appearance-none 
            cursor-pointer
            min-w-[180px]
            transition-all
            duration-200
            shadow-inner
            backdrop-blur-sm
            [&>option]:bg-[#1a1a2e]
            [&>option]:text-[#00ff9d]
          "
        >
          {LOCATIONS.map(location => (
            <option key={location.query} value={location.query}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {selectedLocation.query.includes('NJ') ? (
        <p className="text-[#00ff9d] text-xl">
          It is always terrible in New Jersey this time of year.
        </p>
      ) : weatherData.length > 0 ? (
        <>
          <p className="text-[#00ff9d] text-xl">
            {Math.round(weatherData.reduce((sum, day) => sum + day.temperature, 0) / weatherData.length)}°F
          </p>
          <p className="text-cyber-text mt-2">
            Average temperature during this time in {selectedLocation.name}
          </p>
          <div className="mt-4 space-y-1">
            {weatherData.map(day => (
              <p key={day.date} className="text-cyber-text/70">
                {format(new Date(day.date), 'MMM d')}: {Math.round(day.temperature)}°F
              </p>
            ))}
          </div>
        </>
      ) : (
        <div className="text-cyber-text">
          <p>No historical temperature data available for the selected dates.</p>
          <p className="text-cyber-text/50 mt-2">Try selecting dates within the last {MAX_DAYS_AGO} days.</p>
        </div>
      )}
    </div>
  );
}; 