/**
 * Data formatting utility functions
 * 데이터 포맷팅 유틸리티 함수들
 */

/**
 * 통화 형식으로 숫자를 포맷팅합니다
 * @param value - 포맷팅할 숫자
 * @param currency - 통화 코드 (기본값: 'KRW')
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 포맷팅된 통화 문자열
 */
export const formatCurrency = (
  value: number,
  currency: string = 'KRW',
  locale: string = 'ko-KR'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    console.warn('Currency formatting error:', error);
    return `₩${formatNumber(value)}`;
  }
};

/**
 * 백분율 형식으로 숫자를 포맷팅합니다
 * @param value - 포맷팅할 숫자 (0.1 = 10%)
 * @param decimals - 소수점 자릿수 (기본값: 1)
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 포맷팅된 백분율 문자열
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
  locale: string = 'ko-KR'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  } catch (error) {
    console.warn('Percentage formatting error:', error);
    return `${value.toFixed(decimals)}%`;
  }
};

/**
 * 숫자를 천 단위 구분자와 함께 포맷팅합니다
 * @param value - 포맷팅할 숫자
 * @param decimals - 소수점 자릿수 (기본값: 0)
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 포맷팅된 숫자 문자열
 */
export const formatNumber = (
  value: number,
  decimals: number = 0,
  locale: string = 'ko-KR'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    console.warn('Number formatting error:', error);
    return value.toFixed(decimals);
  }
};

/**
 * 날짜와 시간을 포맷팅합니다
 * @param date - 포맷팅할 Date 객체
 * @param options - Intl.DateTimeFormat 옵션
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 포맷팅된 날짜/시간 문자열
 */
export const formatDateTime = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
  locale: string = 'ko-KR'
): string => {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.warn('DateTime formatting error:', error);
    return date.toLocaleString(locale);
  }
};

/**
 * 날짜만 포맷팅합니다
 * @param date - 포맷팅할 Date 객체
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDate = (date: Date, locale: string = 'ko-KR'): string => {
  return formatDateTime(
    date,
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    locale
  );
};

/**
 * 시간만 포맷팅합니다
 * @param date - 포맷팅할 Date 객체
 * @param includeSeconds - 초 포함 여부 (기본값: true)
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 포맷팅된 시간 문자열
 */
export const formatTime = (
  date: Date,
  includeSeconds: boolean = true,
  locale: string = 'ko-KR'
): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  return formatDateTime(date, options, locale);
};

/**
 * 상대적 시간을 포맷팅합니다 (예: "2분 전", "1시간 전")
 * @param date - 기준 Date 객체
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 상대적 시간 문자열
 */
export const formatRelativeTime = (
  date: Date,
  locale: string = 'ko-KR'
): string => {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(diffInSeconds, 'second');
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (Math.abs(diffInMinutes) < 60) {
      return rtf.format(diffInMinutes, 'minute');
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (Math.abs(diffInHours) < 24) {
      return rtf.format(diffInHours, 'hour');
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return rtf.format(diffInDays, 'day');
  } catch (error) {
    console.warn('Relative time formatting error:', error);
    return formatDateTime(date);
  }
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 포맷팅합니다
 * @param bytes - 바이트 단위 크기
 * @param decimals - 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 파일 크기 문자열
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 큰 숫자를 축약된 형식으로 포맷팅합니다 (예: 1.2K, 3.4M)
 * @param value - 포맷팅할 숫자
 * @param decimals - 소수점 자릿수 (기본값: 1)
 * @returns 축약된 숫자 문자열
 */
export const formatCompactNumber = (
  value: number,
  decimals: number = 1
): string => {
  try {
    return new Intl.NumberFormat('ko-KR', {
      notation: 'compact',
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    console.warn('Compact number formatting error:', error);

    // Fallback for older browsers
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const suffixNum = Math.floor(Math.log10(Math.abs(value)) / 3);
    const shortValue = value / Math.pow(1000, suffixNum);

    if (suffixNum === 0) return value.toString();

    return shortValue.toFixed(decimals) + suffixes[suffixNum];
  }
};

/**
 * 전화번호를 포맷팅합니다
 * @param phoneNumber - 포맷팅할 전화번호
 * @returns 포맷팅된 전화번호 문자열
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 11) {
    // 010-1234-5678 형식
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    // 02-123-4567 형식 (서울 지역번호)
    return cleaned.replace(/(\d{2})(\d{3,4})(\d{4})/, '$1-$2-$3');
  }

  return phoneNumber;
};

/**
 * 값의 타입에 따라 자동으로 포맷팅합니다
 * @param value - 포맷팅할 값
 * @param type - 포맷 타입
 * @returns 포맷팅된 문자열
 */
export const formatValue = (
  value: number,
  type: 'currency' | 'percentage' | 'number' | 'compact'
): string => {
  switch (type) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    case 'number':
      return formatNumber(value);
    case 'compact':
      return formatCompactNumber(value);
    default:
      return value.toString();
  }
};

/**
 * 트렌드 변화율을 포맷팅합니다
 * @param change - 변화율 (백분율)
 * @param showSign - 부호 표시 여부 (기본값: true)
 * @returns 포맷팅된 변화율 문자열
 */
export const formatTrendChange = (
  change: number,
  showSign: boolean = true
): string => {
  const sign = showSign && change > 0 ? '+' : '';
  return `${sign}${formatPercentage(change)}`;
};
