import { useUIStore } from '../store/uiStore';
import { t as getTranslation } from '../i18n';

export function useI18n() {
  const { language } = useUIStore();
  const translations = getTranslation(language);

  const t = (key: string): string => {
    const keys = key.split('.');
    let val: any = translations;
    for (const k of keys) {
      if (val === undefined || val === null) return key;
      val = val[k];
    }
    return (val as string) || key;
  };

  return { t, language };
}
