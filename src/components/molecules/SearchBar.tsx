import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;
  className?: string;
  debounceMs?: number;
}

export const SearchBar = memo<SearchBarProps>(function SearchBar({
  searchValue,
  onSearchChange,
  placeholder = 'Search...',
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = 'All',
  className,
  debounceMs = 1000, // 1초로 증가
}) {
  // 완전히 독립적인 로컬 상태 (외부 상태와 동기화하지 않음)
  const [localValue, setLocalValue] = useState(searchValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // 초기값 설정 (한 번만)
  useEffect(() => {
    if (!isInitializedRef.current) {
      setLocalValue(searchValue);
      isInitializedRef.current = true;
    }
  }, [searchValue]);

  // 완전히 독립적인 debounced 검색
  const performDebouncedSearch = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        console.log('🔍 Debounced search triggered:', value);
        onSearchChange(value);
      }, debounceMs);
    },
    [onSearchChange, debounceMs]
  );

  // cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 입력 핸들러 - 완전히 독립적
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      console.log('🔤 Input change:', newValue);

      // 로컬 상태만 업데이트 (즉시 UI 반영)
      setLocalValue(newValue);

      // debounced 검색 실행
      performDebouncedSearch(newValue);
    },
    [performDebouncedSearch]
  );

  // 엔터키 핸들러 - 즉시 검색 실행
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        console.log('⚡ Enter key pressed - immediate search:', localValue);

        // 기존 debounce 타이머 취소
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }

        // 즉시 검색 실행
        onSearchChange(localValue);
      }
    },
    [localValue, onSearchChange]
  );

  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {/* Filter Dropdown */}
      {filterOptions && onFilterChange && (
        <div className="sm:w-40">
          <Select value={filterValue} onValueChange={onFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder={filterPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Search Input */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={localValue} // 완전히 독립적인 로컬 상태
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
});
