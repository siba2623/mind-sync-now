import { useState, useEffect } from 'react';
import { languageService, type Language } from '@/services/languageService';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(languageService.getLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(languageService.getLanguage());
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const t = (key: string) => languageService.translate(key);

  return { t, language };
}
