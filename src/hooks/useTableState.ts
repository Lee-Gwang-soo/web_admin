import { useCallback, useMemo } from 'react';

/**
 * 테이블의 공통 상태 관리를 위한 훅
 * 정렬, 선택, 페이지네이션 로직을 통합
 */

export interface UseTableStateProps<T> {
  data: T[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc' | 'none';
  currentPage?: number;
  itemsPerPage?: number;
  selectedItems?: string[];
  getItemId: (item: T) => string;
}

export interface UseTableStateReturn<T> {
  // 정렬된 데이터
  sortedData: T[];
  // 현재 페이지의 데이터 (페이지네이션이 활성화된 경우)
  currentPageData: T[];
  // 전체 아이템 수
  totalItems: number;
  // 선택 관련
  selectedItemsSet: Set<string>;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  // 유틸리티
  getCurrentPageIds: () => string[];
}

export function useTableState<T>({
  data,
  sortField,
  sortOrder,
  currentPage = 1,
  itemsPerPage = 10,
  selectedItems = [],
  getItemId,
}: UseTableStateProps<T>): UseTableStateReturn<T> {
  // 정렬된 데이터 (안정적인 정렬 & 메모이제이션)
  const sortedData = useMemo(() => {
    if (!sortField || sortOrder === 'none') return data;

    // 원본 데이터의 인덱스를 유지하면서 정렬 (안정적인 정렬)
    return [...data]
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const aValue = (a.item as any)[sortField];
        const bValue = (b.item as any)[sortField];

        // 숫자 비교
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const diff = aValue - bValue;
          if (diff !== 0) return sortOrder === 'asc' ? diff : -diff;
          return a.index - b.index; // 안정적인 정렬
        }

        // 날짜 비교
        if (aValue instanceof Date || bValue instanceof Date) {
          const aTime = new Date(aValue).getTime();
          const bTime = new Date(bValue).getTime();
          const diff = aTime - bTime;
          if (diff !== 0) return sortOrder === 'asc' ? diff : -diff;
          return a.index - b.index;
        }

        // 문자열 비교
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr !== bStr) {
          return sortOrder === 'asc'
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        }
        return a.index - b.index;
      })
      .map(({ item }) => item);
  }, [data, sortField, sortOrder]);

  // 현재 페이지의 데이터
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  // 선택된 아이템 Set (O(1) lookup)
  const selectedItemsSet = useMemo(
    () => new Set(selectedItems),
    [selectedItems]
  );

  // 전체 선택 여부
  const isAllSelected = useMemo(() => {
    if (currentPageData.length === 0) return false;
    return currentPageData.every((item) =>
      selectedItemsSet.has(getItemId(item))
    );
  }, [currentPageData, selectedItemsSet, getItemId]);

  // 부분 선택 여부
  const isPartiallySelected = useMemo(() => {
    if (currentPageData.length === 0) return false;
    const selectedCount = currentPageData.filter((item) =>
      selectedItemsSet.has(getItemId(item))
    ).length;
    return selectedCount > 0 && selectedCount < currentPageData.length;
  }, [currentPageData, selectedItemsSet, getItemId]);

  // 현재 페이지의 아이템 ID 목록
  const getCurrentPageIds = useCallback(() => {
    return currentPageData.map(getItemId);
  }, [currentPageData, getItemId]);

  return {
    sortedData,
    currentPageData,
    totalItems: sortedData.length,
    selectedItemsSet,
    isAllSelected,
    isPartiallySelected,
    getCurrentPageIds,
  };
}
