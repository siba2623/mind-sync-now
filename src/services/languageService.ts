export type Language = 'en' | 'zu' | 'xh' | 'af' | 'st';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'st', name: 'Sotho', nativeName: 'Sesotho' },
];

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': {
    en: 'Dashboard',
    zu: 'Ibhodi Lokubuka',
    xh: 'Ibhodi Yokubuka',
    af: 'Dashboard',
    st: 'Dashboard',
  },
  'nav.health_hub': {
    en: 'Health Hub',
    zu: 'Isikhungo Sezempilo',
    xh: 'Iziko Lempilo',
    af: 'Gesondheidssentrum',
    st: 'Setsi sa Bophelo',
  },
  'nav.insights': {
    en: 'Insights',
    zu: 'Ukuqonda',
    xh: 'Ukuqonda',
    af: 'Insigte',
    st: 'Temohisiso',
  },
  
  // Common phrases
  'common.how_are_you_feeling': {
    en: 'How are you feeling?',
    zu: 'Uzizwa kanjani?',
    xh: 'Uziva njani?',
    af: 'Hoe voel jy?',
    st: 'O ikutlwa jwang?',
  },
  'common.save': {
    en: 'Save',
    zu: 'Gcina',
    xh: 'Gcina',
    af: 'Stoor',
    st: 'Boloka',
  },
  'common.cancel': {
    en: 'Cancel',
    zu: 'Khansela',
    xh: 'Rhoxisa',
    af: 'Kanselleer',
    st: 'Hlakola',
  },
  
  // Crisis support
  'crisis.need_help': {
    en: 'Need immediate help?',
    zu: 'Udinga usizo ngokushesha?',
    xh: 'Ufuna uncedo ngoko nangoko?',
    af: 'Het jy dadelik hulp nodig?',
    st: 'O hloka thuso hang-hang?',
  },
  'crisis.call_hotline': {
    en: 'Call Crisis Hotline',
    zu: 'Shayela Umugqa Wosizo',
    xh: 'Fumana Uncedo',
    af: 'Bel Krisisslyn',
    st: 'Letsa Mohala wa Thuso',
  },
  
  // Mood tracking
  'mood.track_mood': {
    en: 'Track Your Mood',
    zu: 'Landelela Umuzwa Wakho',
    xh: 'Landela Imvakalelo Yakho',
    af: 'Volg Jou Gemoedstoestand',
    st: 'Latela Maikutlo a Hao',
  },
  'mood.how_feeling_today': {
    en: 'How are you feeling today?',
    zu: 'Uzizwa kanjani namuhla?',
    xh: 'Uziva njani namhlanje?',
    af: 'Hoe voel jy vandag?',
    st: 'O ikutlwa jwang kajeno?',
  },
  
  // Emotions
  'emotion.happy': {
    en: 'Happy',
    zu: 'Ujabule',
    xh: 'Uvuyile',
    af: 'Gelukkig',
    st: 'Thabile',
  },
  'emotion.sad': {
    en: 'Sad',
    zu: 'Udabukile',
    xh: 'Ulusizi',
    af: 'Hartseer',
    st: 'Masoabi',
  },
  'emotion.anxious': {
    en: 'Anxious',
    zu: 'Ukhathazekile',
    xh: 'Unexhala',
    af: 'Angstig',
    st: 'Tshwenyehile',
  },
  'emotion.calm': {
    en: 'Calm',
    zu: 'Uzolile',
    xh: 'Uzolile',
    af: 'Kalm',
    st: 'Kgotso',
  },
  
  // Therapist
  'therapist.find_therapist': {
    en: 'Find a Therapist',
    zu: 'Thola Umsebenzi Wengqondo',
    xh: 'Fumana Ugqirha Wengqondo',
    af: 'Vind \'n Terapeut',
    st: 'Fumana Seeledi',
  },
  'therapist.book_session': {
    en: 'Book Session',
    zu: 'Bhukha Isikhathi',
    xh: 'Bhukisha Iseshoni',
    af: 'Bespreek Sessie',
    st: 'Beha Nako',
  },
  
  // Crisis Support
  'crisis.immediate_support': {
    en: 'Immediate Support Resources',
    zu: 'Izinsiza Zosizo Ngokushesha',
    xh: 'Uncedo Olukhawulezileyo',
    af: 'Onmiddellike Ondersteuning',
    st: 'Thuso e Potlakileng',
  },
  'crisis.not_alone': {
    en: "We've detected you may need immediate support. You're not alone - help is available 24/7.",
    zu: 'Sibone ukuthi ungase udinge usizo ngokushesha. Awuwedwa - usizo luyatholakala 24/7.',
    xh: 'Siqaphele ukuba unokufuna uncedo ngoko nangoko. Awukho wedwa - uncedo luyafumaneka 24/7.',
    af: 'Ons het opgelet jy mag dadelik ondersteuning nodig hê. Jy is nie alleen nie - hulp is 24/7 beskikbaar.',
    st: 'Re lemohile hore o ka hloka thuso hang-hang. Ha o mong - thuso e fumaneha 24/7.',
  },
  'crisis.emergency': {
    en: 'Emergency',
    zu: 'Isimo Esiphuthumayo',
    xh: 'Ingxaki',
    af: 'Noodgeval',
    st: 'Tshohanyetso',
  },
  'crisis.medical_emergency': {
    en: 'If this is a medical emergency:',
    zu: 'Uma lesi yisimo esiphuthumayo sezempilo:',
    xh: 'Ukuba oku yingxaki yezempilo:',
    af: 'As dit \'n mediese noodgeval is:',
    st: 'Haeba ena e le tshohanyetso ya bongaka:',
  },
  'crisis.call_emergency': {
    en: 'Call Emergency Services',
    zu: 'Shayela Izinsizakalo Eziphuthumayo',
    xh: 'Fumana Iinkonzo Zongxamiseko',
    af: 'Bel Nooddienste',
    st: 'Letsa Litšebeletso tsa Tshohanyetso',
  },
  'crisis.nearest_hospital': {
    en: 'Or go to your nearest hospital emergency room',
    zu: 'Noma yiya egumbini lezimo eziphuthumayo esibhedlela esiseduze',
    xh: 'Okanye yiya kwigumbi longxamiseko lwesibhedlele elikufutshane',
    af: 'Of gaan na jou naaste hospitaal se noodkamer',
    st: 'Kapa o ye kamoreng ya tshohanyetso ya sepetlele se haufi',
  },
};

class LanguageService {
  private currentLanguage: Language = 'en';

  constructor() {
    const saved = localStorage.getItem('language') as Language;
    if (saved && languages.find(l => l.code === saved)) {
      this.currentLanguage = saved;
    }
  }

  setLanguage(lang: Language): void {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  translate(key: string): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[this.currentLanguage] || translation.en || key;
  }

  t = this.translate.bind(this);
}

export const languageService = new LanguageService();
