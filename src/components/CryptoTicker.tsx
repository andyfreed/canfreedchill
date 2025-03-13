import React, { useState, useEffect } from 'react';
import Marquee from 'react-fast-marquee';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface CryptoPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

// Carefully selected top cryptocurrencies for optimal performance
const CRYPTO_IDS = [
  'bitcoin',
  'ethereum',
  'binancecoin',
  'solana',
  'cardano',
  'ripple',
  'polkadot',
  'avalanche-2'
].join(',');

// Fallback data in case the API fails
const FALLBACK_PRICES: CryptoPrice[] = [
  { id: 'bitcoin', symbol: 'btc', current_price: 67000, price_change_percentage_24h: 2.5 },
  { id: 'ethereum', symbol: 'eth', current_price: 3800, price_change_percentage_24h: 1.8 },
  { id: 'binancecoin', symbol: 'bnb', current_price: 420, price_change_percentage_24h: 1.2 },
  { id: 'solana', symbol: 'sol', current_price: 145, price_change_percentage_24h: -0.5 },
  { id: 'cardano', symbol: 'ada', current_price: 0.65, price_change_percentage_24h: 0.8 },
  { id: 'ripple', symbol: 'xrp', current_price: 0.62, price_change_percentage_24h: 1.1 },
  { id: 'polkadot', symbol: 'dot', current_price: 8.5, price_change_percentage_24h: -0.3 },
  { id: 'avalanche-2', symbol: 'avax', current_price: 35, price_change_percentage_24h: 1.5 }
];

export const CryptoTicker: React.FC = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>(FALLBACK_PRICES);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    const fetchPrices = async () => {
      // Rate limiting: Only fetch if it's been more than 30 seconds since the last fetch
      const now = Date.now();
      if (now - lastFetchTime < 30000) {
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO_IDS}&vs_currencies=usd&include_24h_vol=true&include_24hr_change=true&include_last_updated_at=true`,
          {
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the data into our expected format
        const transformedData: CryptoPrice[] = Object.entries(data).map(([id, details]: [string, any]) => ({
          id,
          symbol: id === 'avalanche-2' ? 'avax' : id.slice(0, 3),
          current_price: details.usd,
          price_change_percentage_24h: details.usd_24h_change
        }));

        setPrices(transformedData);
        setError(false);
        setRetryCount(0);
        setLastFetchTime(now);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        setError(true);
        
        // Implement exponential backoff for retries
        if (retryCount < 3) {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, backoffTime);
        }
      }
    };

    fetchPrices();
    
    // Use a longer interval to avoid rate limiting
    const interval = setInterval(fetchPrices, 60000); // Update every minute

    return () => {
      clearInterval(interval);
    };
  }, [retryCount, lastFetchTime]);

  if (error && retryCount >= 3) {
    return null; // Hide the ticker completely after 3 failed retries
  }

  return (
    <div className="bg-cyber-darker border-b border-cyber-primary/30 py-2 text-sm">
      <Marquee gradient={false} speed={40}>
        <div className="flex items-center space-x-8">
          {error && (
            <div className="flex items-center gap-2 px-4 text-cyber-secondary">
              <AlertCircle className="w-4 h-4" />
              <span>Live prices temporarily unavailable</span>
            </div>
          )}
          {prices.map((crypto) => (
            <div key={crypto.id} className="flex items-center space-x-2 px-4">
              <span className="text-cyber-text uppercase">{crypto.symbol}:</span>
              <span className="text-cyber-primary font-medium">
                ${crypto.current_price.toLocaleString()}
              </span>
              <span
                className={`flex items-center ${
                  crypto.price_change_percentage_24h >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {crypto.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
};