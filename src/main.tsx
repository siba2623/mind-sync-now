import { createRoot } from "react-dom/client";
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile.css";

// Initialize Capacitor plugins for mobile
const initializeApp = async () => {
  if (Capacitor.isNativePlatform()) {
    // Configure status bar
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
    
    // Hide splash screen after app loads
    await SplashScreen.hide();
  }
};

// Initialize app
initializeApp();

createRoot(document.getElementById("root")!).render(<App />);
