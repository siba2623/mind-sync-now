import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile.css";

// Initialize Capacitor plugins for mobile (only if available)
const initializeApp = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    
    if (Capacitor.isNativePlatform()) {
      // Configure status bar
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      
      // Hide splash screen after app loads
      const { SplashScreen } = await import('@capacitor/splash-screen');
      await SplashScreen.hide();
    }
  } catch (error) {
    // Capacitor not available (web mode), continue without it
    console.log('Running in web mode');
  }
};

// Initialize app
initializeApp();

createRoot(document.getElementById("root")!).render(<App />);
