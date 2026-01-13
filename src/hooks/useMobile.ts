import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';

export const useMobile = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web');

  useEffect(() => {
    const checkPlatform = () => {
      const isNativePlatform = Capacitor.isNativePlatform();
      setIsNative(isNativePlatform);
      
      if (isNativePlatform) {
        setPlatform(Capacitor.getPlatform() as 'ios' | 'android');
      }
    };

    checkPlatform();
  }, []);

  const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (isNative) {
      try {
        const impactStyle = style === 'light' ? ImpactStyle.Light : 
                           style === 'medium' ? ImpactStyle.Medium : 
                           ImpactStyle.Heavy;
        await Haptics.impact({ style: impactStyle });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
  };

  const exitApp = async () => {
    if (isNative) {
      try {
        await App.exitApp();
      } catch (error) {
        console.log('Exit app not available:', error);
      }
    }
  };

  const getAppInfo = async () => {
    if (isNative) {
      try {
        return await App.getInfo();
      } catch (error) {
        console.log('App info not available:', error);
        return null;
      }
    }
    return null;
  };

  return {
    isNative,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    triggerHaptic,
    exitApp,
    getAppInfo
  };
};

export default useMobile;