'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18nStore, useTranslation, type Locale } from '@/store/i18n-store';
import { Check, Globe } from 'lucide-react';
import { memo, useState } from 'react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

const LanguageSelector = memo(function LanguageSelector({
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
}: LanguageSelectorProps) {
  const { locale, toggleLocale, isLoading } = useI18nStore();
  const { t } = useTranslation();

  // 현재 언어 정보
  const getLanguageInfo = (currentLocale: Locale) => {
    switch (currentLocale) {
      case 'ko':
        return {
          label: '한국어',
          flag: '🇰🇷',
          short: 'KO',
        };
      case 'en':
        return {
          label: 'English',
          flag: '🇺🇸',
          short: 'EN',
        };
      default:
        return {
          label: '한국어',
          flag: '🇰🇷',
          short: 'KO',
        };
    }
  };

  const currentLang = getLanguageInfo(locale);

  const handleToggle = () => {
    console.log(`🔄 Language toggle requested`);
    toggleLocale();
  };

  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={cn('transition-opacity opacity-50', className)}
      >
        <Globe className="h-4 w-4 animate-spin" />
        {showLabel && <span className="ml-2">{t('common.loading')}</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        'transition-all duration-200 hover:scale-105 active:scale-95',
        className
      )}
      title={t('language.current', { language: currentLang.label })}
    >
      <span className="text-sm mr-1">{currentLang.flag}</span>
      <span className="text-xs font-medium">{currentLang.short}</span>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">{currentLang.label}</span>
      )}
    </Button>
  );
});

// 드롭다운 방식의 언어 선택기
interface LanguageDropdownProps {
  className?: string;
}

export const LanguageDropdown = memo(function LanguageDropdown({
  className,
}: LanguageDropdownProps) {
  const { locale, setLocale, isLoading } = useI18nStore();
  const { t } = useTranslation();
  const [changingTo, setChangingTo] = useState<Locale | null>(null);

  const languages = [
    {
      value: 'ko' as const,
      label: '한국어',
      flag: '🇰🇷',
      nativeLabel: '한국어',
    },
    {
      value: 'en' as const,
      label: 'English',
      flag: '🇺🇸',
      nativeLabel: 'English',
    },
  ];

  const handleLanguageChange = async (newLocale: Locale) => {
    if (locale === newLocale) return;

    console.log(`🔄 Language dropdown change: ${locale} -> ${newLocale}`);
    setChangingTo(newLocale);
    setLocale(newLocale);
  };

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      {languages.map(({ value, label, flag, nativeLabel }) => {
        const isActive = locale === value;
        const isChangingToThis = changingTo === value;
        const isLoadingThis = isLoading && isChangingToThis;

        return (
          <Button
            key={value}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLanguageChange(value)}
            disabled={isLoading}
            className={cn(
              'justify-start transition-all duration-200',
              isLoadingThis && 'opacity-50'
            )}
          >
            <span className="mr-2">{flag}</span>
            <span>{nativeLabel}</span>
            {isActive && <Check className="ml-auto h-4 w-4" />}
            {isLoadingThis && (
              <Globe className="ml-auto h-4 w-4 animate-spin" />
            )}
          </Button>
        );
      })}
    </div>
  );
});

export default LanguageSelector;
