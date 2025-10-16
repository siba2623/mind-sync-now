const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
}

export const getWeatherData = async (city: string = 'London'): Promise<WeatherData | null> => {
  if (!WEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

export const getWeatherBasedActivitySuggestion = (weather: WeatherData | null): string => {
  if (!weather) return 'Try any activity that feels right for you today.';

  const { temp, condition } = weather;

  // Cold weather (below 10°C)
  if (temp < 10) {
    return 'It\'s cold outside! Perfect time for indoor breathing exercises or cozy meditation.';
  }

  // Hot weather (above 25°C)
  if (temp > 25) {
    return 'It\'s warm today! Stay hydrated and try gentle stretches in a cool space.';
  }

  // Rainy weather
  if (condition.toLowerCase().includes('rain')) {
    return 'Rainy day - great for calming sounds and indoor mindfulness activities.';
  }

  // Cloudy weather
  if (condition.toLowerCase().includes('cloud')) {
    return 'Cloudy day - perfect for light stretching or gratitude journaling.';
  }

  // Clear/Sunny
  if (condition.toLowerCase().includes('clear')) {
    return 'Beautiful clear weather! Consider taking your breathing exercises outside.';
  }

  // Default
  return 'Nice weather for any mindfulness activity you choose.';
};
