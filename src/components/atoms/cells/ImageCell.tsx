import { Package, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';

interface ImageCellProps {
  src: string | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

// 이미지 로딩 상태 캐시 (메모리 캐시)
const imageLoadStateCache = new Map<
  string,
  { loading: boolean; error: boolean }
>();

export const ImageCell = memo<ImageCellProps>(
  function ImageCell({
    src,
    alt,
    width = 40,
    height = 40,
    className = '',
    onClick,
  }) {
    // 캐시에서 초기 상태 가져오기
    const cachedState = src ? imageLoadStateCache.get(src) : null;
    const [isLoading, setIsLoading] = useState(
      cachedState ? cachedState.loading : !!src
    );
    const [hasError, setHasError] = useState(
      cachedState ? cachedState.error : false
    );

    const handleError = useCallback(() => {
      setHasError(true);
      setIsLoading(false);
      if (src) {
        imageLoadStateCache.set(src, { loading: false, error: true });
      }
    }, [src]);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
      setHasError(false);
      if (src) {
        imageLoadStateCache.set(src, { loading: false, error: false });
      }
    }, [src]);

    if (!src || hasError) {
      return (
        <div
          className={`${className} bg-gray-200 flex items-center justify-center rounded-md cursor-pointer hover:bg-gray-300 transition-colors`}
          style={{ width, height }}
          onClick={onClick}
          title={hasError ? `Image load failed: ${alt}` : `No image: ${alt}`}
        >
          <Package className="h-6 w-6 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="relative" onClick={onClick}>
        {isLoading && (
          <div
            className={`${className} bg-gray-200 animate-pulse flex items-center justify-center absolute inset-0 z-10 rounded-md`}
          >
            <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onError={handleError}
          onLoad={handleLoad}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQACAQIHAQAAAAAAAAAAAAABAgADBAUREiExYVFxkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT4Q6BnFoTg=="
          priority={width > 40} // 큰 이미지만 우선 로드
        />
      </div>
    );
  },
  // 커스텀 비교 함수: src가 같으면 리렌더링 방지
  (prevProps, nextProps) => {
    return (
      prevProps.src === nextProps.src &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height
    );
  }
);
