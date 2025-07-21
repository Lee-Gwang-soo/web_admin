import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type Locale = 'ko' | 'en';

interface I18nState {
  locale: Locale;
  isLoading: boolean;
  translations: Record<string, string>;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: Record<string, string>) => string;
  initialize: () => Promise<void>;
}

// 로컬스토리지에서 언어 설정 가져오기
const getStoredLocale = (): Locale => {
  if (typeof window === 'undefined') return 'ko';
  try {
    const stored = localStorage.getItem('locale') as Locale;
    return stored && ['ko', 'en'].includes(stored) ? stored : 'ko';
  } catch {
    return 'ko';
  }
};

// 중첩된 객체를 평면화하는 함수 (dot notation)
const flattenObject = (
  obj: Record<string, any>,
  prefix = ''
): Record<string, string> => {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 중첩된 객체인 경우 재귀적으로 처리
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      // 문자열 값인 경우 직접 할당
      flattened[newKey] = String(value);
    }
  }

  return flattened;
};

// 번역 파일 동적 로딩
const loadTranslations = async (
  locale: Locale
): Promise<Record<string, string>> => {
  try {
    console.log(`🌐 Loading translations for locale: ${locale}`);
    const translations = await import(`../locales/${locale}.json`);
    const translationData = translations.default || translations;

    // 중첩된 구조를 평면화
    const flattened = flattenObject(translationData);

    console.log(
      `✅ Translations loaded for ${locale}:`,
      Object.keys(flattened).length,
      'keys'
    );
    return flattened;
  } catch (error) {
    console.warn(`⚠️ Failed to load translations for locale: ${locale}`, error);
    // 한국어 fallback
    if (locale !== 'ko') {
      try {
        console.log('🔄 Falling back to Korean translations');
        const fallback = await import('../locales/ko.json');
        const fallbackData = fallback.default || fallback;
        return flattenObject(fallbackData);
      } catch {
        console.error('❌ Failed to load fallback translations');
        return {};
      }
    }
    return {};
  }
};

// 번역 함수 (매개변수 치환 지원)
const translateText = (
  translations: Record<string, string>,
  key: string,
  params?: Record<string, string>
): string => {
  let text = translations[key] || key;

  // 매개변수 치환
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
    });
  }

  return text;
};

export const useI18nStore = create<I18nState>()(
  subscribeWithSelector((set, get) => ({
    locale: 'ko',
    isLoading: true,
    translations: {},

    setLocale: async (locale: Locale) => {
      const currentState = get();

      // 이미 같은 언어면 스킵
      if (currentState.locale === locale && !currentState.isLoading) {
        console.log(`🔄 Locale ${locale} is already active`);
        return;
      }

      console.log(`🌐 Setting locale to: ${locale}`);
      set({ isLoading: true });

      try {
        // 로컬스토리지에 저장
        localStorage.setItem('locale', locale);
        console.log(`💾 Locale saved to localStorage: ${locale}`);

        // 번역 파일 로딩
        const translations = await loadTranslations(locale);

        // 상태 업데이트 (강제 리렌더링을 위해 새 객체 생성)
        set({
          locale,
          translations: { ...translations }, // 새 객체 생성으로 참조 변경 보장
          isLoading: false,
        });

        console.log(`✅ Locale successfully changed to: ${locale}`);

        // 상태 변경 확인 로그
        const newState = get();
        console.log('📊 New i18n state:', {
          locale: newState.locale,
          translationsCount: Object.keys(newState.translations).length,
          isLoading: newState.isLoading,
        });
      } catch (error) {
        console.error(`❌ Failed to set locale to ${locale}:`, error);
        set({ isLoading: false });
      }
    },

    toggleLocale: () => {
      const { locale, setLocale } = get();
      const newLocale: Locale = locale === 'ko' ? 'en' : 'ko';
      console.log(`🔄 Toggling locale from ${locale} to ${newLocale}`);
      setLocale(newLocale);
    },

    t: (key: string, params?: Record<string, string>) => {
      const { translations, locale } = get();
      const result = translateText(translations, key, params);

      // 번역 누락 체크 (개발환경에서만)
      if (result === key && process.env.NODE_ENV === 'development') {
        console.warn(
          `🔍 Translation missing for key: "${key}" in locale: ${locale}`
        );
      }

      return result;
    },

    initialize: async () => {
      if (typeof window === 'undefined') {
        set({ isLoading: false });
        return;
      }

      console.log('🚀 Initializing i18n store');
      const storedLocale = getStoredLocale();
      console.log(`💾 Stored locale: ${storedLocale}`);

      await get().setLocale(storedLocale);
      console.log('✅ i18n store initialized');
    },
  }))
);

// 상태 변경 구독 (디버깅용)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  useI18nStore.subscribe(
    (state) => state.locale,
    (locale) => {
      console.log(`🔔 Locale changed notification: ${locale}`);
    }
  );
}

// 초기화 헬퍼 함수 (SSR 지원)
export const initializeI18n = async () => {
  if (typeof window !== 'undefined') {
    await useI18nStore.getState().initialize();
  }
};

// 번역 훅 (컴포넌트에서 사용)
export const useTranslation = () => {
  const { t, locale, isLoading } = useI18nStore();
  return { t, locale, isLoading };
};
