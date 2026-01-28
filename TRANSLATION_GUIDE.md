# Translation System Guide

## Current Status

Your language system is **working** but components need to be updated to use translations.

## How It Works (No API Required)

You have a **client-side translation system** that stores translations in `languageService.ts`. No external API is needed for the languages you've defined (English, Zulu, Xhosa, Afrikaans, Sotho).

## How to Use Translations in Components

### Step 1: Import the hook
```tsx
import { useTranslation } from '@/hooks/useTranslation';
```

### Step 2: Use in your component
```tsx
export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.how_are_you_feeling')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

## Adding New Translations

Edit `src/services/languageService.ts` and add to the `translations` object:

```typescript
const translations: Translations = {
  'your.translation.key': {
    en: 'English text',
    zu: 'isiZulu text',
    xh: 'isiXhosa text',
    af: 'Afrikaans text',
    st: 'Sesotho text',
  },
};
```

## Available Translation Keys

### Navigation
- `nav.dashboard`
- `nav.health_hub`
- `nav.insights`

### Common
- `common.how_are_you_feeling`
- `common.save`
- `common.cancel`

### Crisis Support
- `crisis.need_help`
- `crisis.call_hotline`
- `crisis.immediate_support`
- `crisis.not_alone`
- `crisis.emergency`
- `crisis.medical_emergency`
- `crisis.call_emergency`
- `crisis.nearest_hospital`

### Mood Tracking
- `mood.track_mood`
- `mood.how_feeling_today`

### Emotions
- `emotion.happy`
- `emotion.sad`
- `emotion.anxious`
- `emotion.calm`

### Therapist
- `therapist.find_therapist`
- `therapist.book_session`

## Example: Updated Component

See `src/components/CrisisSupport.tsx` for a working example.

## Do You Need a Translation API?

### You DON'T need an API if:
- ✅ You manually define all translations (current approach)
- ✅ You only support the 5 languages you've defined
- ✅ You're okay with updating translations in code

### You NEED an API if:
- ❌ You want automatic translation of user-generated content
- ❌ You want to support 50+ languages dynamically
- ❌ You want real-time translation of chat messages

## Next Steps

1. **Test the current system**: Change language and reload - CrisisSupport component should now translate
2. **Add more translation keys**: Update `languageService.ts` with more phrases
3. **Update other components**: Use `useTranslation()` hook in other components
4. **Consider i18next**: For larger scale, migrate to react-i18next library

## Alternative: Use Google Translate API

If you want automatic translation, you'd need:
1. Google Cloud account
2. Translation API key
3. Update `languageService.ts` to call the API
4. Cost: ~$20 per 1M characters

But for your current 5 languages with predefined text, the current system works perfectly without any API!
