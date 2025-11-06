'use client';

import { EmptyState } from '@/components/atoms/EmptyState';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { Pagination } from '@/components/molecules/Pagination';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckSquare,
  LucideIcon,
  Square,
} from 'lucide-react';
import { memo, ReactNode, useCallback, useMemo, useRef } from 'react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  sortable?: boolean;
  width?: string;
  cell: (item: T) => ReactNode;
  mobileCell?: (item: T) => ReactNode;
}

interface SortConfig {
  field: string;
  order: 'asc' | 'desc' | null;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string | null;
  sortConfig?: SortConfig;
  onSort?: (field: string) => void;
  // Selection
  selectedItems?: string[];
  onItemSelect?: (id: string) => void;
  onSelectAll?: () => void;
  getItemId?: (item: T) => string;
  // Pagination
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showPagination?: boolean;
  // Empty state
  emptyStateIcon?: LucideIcon;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: ReactNode;
  className?: string;
}

// Optimized SelectAll Button Component
interface SelectAllButtonProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
}

const SelectAllButton = memo<SelectAllButtonProps>(function SelectAllButton({
  selectedCount,
  totalCount,
  onSelectAll,
}) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSelectAll}
      className="h-4 w-4 p-0"
      aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
    >
      {isAllSelected ? (
        <CheckSquare className="h-4 w-4" />
      ) : isPartiallySelected ? (
        <div className="h-4 w-4 border-2 border-primary bg-primary/50 rounded-sm flex items-center justify-center">
          <div className="w-2 h-0.5 bg-white"></div>
        </div>
      ) : (
        <Square className="h-4 w-4" />
      )}
    </Button>
  );
});

// Optimized Row Selection Component
interface RowSelectionProps {
  itemId: string;
  isSelected: boolean;
  onItemSelect: (id: string) => void;
}

const RowSelection = memo<RowSelectionProps>(function RowSelection({
  itemId,
  isSelected,
  onItemSelect,
}) {
  const handleSelect = useCallback(() => {
    onItemSelect(itemId);
  }, [onItemSelect, itemId]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSelect}
      className="h-4 w-4 p-0"
      aria-label={isSelected ? 'Deselect item' : 'Select item'}
    >
      {isSelected ? (
        <CheckSquare className="h-4 w-4" />
      ) : (
        <Square className="h-4 w-4" />
      )}
    </Button>
  );
});

// 개별 Cell Component - 완전히 독립적
interface TableCellComponentProps {
  content: ReactNode;
  columnId: string;
}

const TableCellComponent = memo<TableCellComponentProps>(
  function TableCellComponent({ content, columnId }) {
    return <TableCell key={columnId}>{content}</TableCell>;
  }
);

// Table Header Component - 완전히 분리하여 selection 변경시 리렌더링 방지
interface TableHeaderComponentProps<T> {
  columns: ColumnDef<T>[];
  sortConfig?: SortConfig;
  onSort?: (field: string) => void;
  hasSelection: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll?: () => void;
}

const TableHeaderComponent = memo(function TableHeaderComponent<T>({
  columns,
  sortConfig,
  onSort,
  hasSelection,
  selectedCount,
  totalCount,
  onSelectAll,
}: TableHeaderComponentProps<T>) {
  const getSortIcon = useCallback(
    (columnId: string) => {
      if (!sortConfig || sortConfig.field !== columnId) {
        return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
      }

      if (sortConfig.order === 'asc') {
        return <ArrowUp className="h-4 w-4 text-blue-600" />;
      } else if (sortConfig.order === 'desc') {
        return <ArrowDown className="h-4 w-4 text-blue-600" />;
      } else {
        return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
      }
    },
    [sortConfig]
  );

  return (
    <TableHeader>
      <TableRow>
        {/* Selection column */}
        {hasSelection && (
          <TableHead className="w-12">
            {onSelectAll && (
              <SelectAllButton
                selectedCount={selectedCount}
                totalCount={totalCount}
                onSelectAll={onSelectAll}
              />
            )}
          </TableHead>
        )}

        {/* Column headers */}
        {columns.map((column) => (
          <TableHead key={column.id} style={{ width: column.width }}>
            {column.sortable && onSort ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort(column.id)}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                {column.header}
                {getSortIcon(column.id)}
              </Button>
            ) : (
              column.header
            )}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}) as <T>(props: TableHeaderComponentProps<T>) => React.ReactElement;

// 완전히 최적화된 Table Row Component - pre-rendered cells 사용
interface TableRowComponentProps {
  itemId: string;
  isSelected: boolean;
  hasSelection: boolean;
  onItemSelect?: (id: string) => void;
  renderedCells: ReactNode[]; // 이미 렌더링된 cell들
}

const TableRowComponent = memo<TableRowComponentProps>(
  function TableRowComponent({
    itemId,
    isSelected,
    hasSelection,
    onItemSelect,
    renderedCells,
  }) {
    return (
      <TableRow className={isSelected ? 'bg-muted/50' : ''}>
        {/* Selection checkbox */}
        {hasSelection && onItemSelect && (
          <TableCell>
            <RowSelection
              itemId={itemId}
              isSelected={isSelected}
              onItemSelect={onItemSelect}
            />
          </TableCell>
        )}

        {/* Pre-rendered cells */}
        {renderedCells}
      </TableRow>
    );
  }
);

// Table Body Component - 각 row가 완전히 독립적
interface TableBodyComponentProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  selectedItemsSet: Set<string>; // Set 전달로 변경
  onItemSelect?: (id: string) => void;
  getItemId: (item: T) => string;
}

// 완전히 독립적인 Row Component - 오직 자신의 selection 상태만 받음
interface IndependentRowProps<T> {
  item: T;
  itemId: string;
  columns: ColumnDef<T>[];
  isSelected: boolean; // 오직 boolean 값만 받음
  onItemSelect?: (id: string) => void;
}

const IndependentRow = memo(function IndependentRow<T>({
  item,
  itemId,
  columns,
  isSelected,
  onItemSelect,
}: IndependentRowProps<T>) {
  // Pre-render all cells for this specific row (item과 columns만 의존)
  const renderedCells = useMemo(() => {
    return columns.map((column) => (
      <TableCellComponent
        key={column.id}
        columnId={column.id}
        content={column.cell(item)}
      />
    ));
  }, [columns, item]); // 이 row의 item과 columns만 의존

  return (
    <TableRowComponent
      itemId={itemId}
      isSelected={isSelected}
      hasSelection={!!onItemSelect}
      onItemSelect={onItemSelect}
      renderedCells={renderedCells}
    />
  );
}) as <T>(props: IndependentRowProps<T>) => React.ReactElement;

const TableBodyComponent = memo(function TableBodyComponent<T>({
  data,
  columns,
  selectedItemsSet,
  onItemSelect,
  getItemId,
}: TableBodyComponentProps<T>) {
  return (
    <TableBody>
      {data.map((item) => {
        const itemId = getItemId(item);
        const isSelected = selectedItemsSet.has(itemId); // O(1) lookup

        return (
          <IndependentRow
            key={itemId}
            item={item}
            itemId={itemId}
            columns={columns}
            isSelected={isSelected} // 오직 boolean만 전달
            onItemSelect={onItemSelect}
          />
        );
      })}
    </TableBody>
  );
}) as <T>(props: TableBodyComponentProps<T>) => React.ReactElement;

// Mobile Cards Container - 각 카드가 완전히 독립적
interface MobileCardsContainerProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  selectedItemsSet: Set<string>; // Set 전달로 변경
  onItemSelect?: (id: string) => void;
  getItemId: (item: T) => string;
}

// 완전히 독립적인 Mobile Card Component
interface IndependentMobileCardProps<T> {
  item: T;
  itemId: string;
  columns: ColumnDef<T>[];
  isSelected: boolean;
  onItemSelect?: (id: string) => void;
}

const IndependentMobileCard = memo(function IndependentMobileCard<T>({
  item,
  itemId,
  columns,
  isSelected,
  onItemSelect,
}: IndependentMobileCardProps<T>) {
  return (
    <div
      className={cn(
        'border rounded-lg p-4 space-y-3',
        isSelected && 'bg-muted/50 border-primary'
      )}
    >
      {/* Selection for mobile */}
      {onItemSelect && (
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onItemSelect(itemId)}
            className="h-auto p-0"
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 mr-2" />
            ) : (
              <Square className="h-4 w-4 mr-2" />
            )}
            Select
          </Button>
        </div>
      )}

      {/* Mobile content */}
      {columns.map((column) => (
        <div key={column.id} className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground">
            {column.header}
          </div>
          <div>
            {column.mobileCell ? column.mobileCell(item) : column.cell(item)}
          </div>
        </div>
      ))}
    </div>
  );
}) as <T>(props: IndependentMobileCardProps<T>) => React.ReactElement;

const MobileCardsContainer = memo(function MobileCardsContainer<T>({
  data,
  columns,
  selectedItemsSet,
  onItemSelect,
  getItemId,
}: MobileCardsContainerProps<T>) {
  return (
    <div className="space-y-3 p-4">
      {data.map((item) => {
        const itemId = getItemId(item);
        const isSelected = selectedItemsSet.has(itemId);

        return (
          <IndependentMobileCard
            key={itemId}
            item={item}
            itemId={itemId}
            columns={columns}
            isSelected={isSelected}
            onItemSelect={onItemSelect}
          />
        );
      })}
    </div>
  );
}) as <T>(props: MobileCardsContainerProps<T>) => React.ReactElement;

export const DataTable = memo(function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  sortConfig,
  onSort,
  selectedItems = [],
  onItemSelect,
  onSelectAll,
  getItemId = (item: any) => item?.id?.toString() || Math.random().toString(),
  // Pagination props
  currentPage = 1,
  itemsPerPage = 10,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  showPagination = false,
  // Empty state props
  emptyStateIcon,
  emptyStateTitle = 'No data found',
  emptyStateDescription = 'Try adjusting your filters or search terms.',
  emptyStateAction,
  className,
}: DataTableProps<T>) {
  // Stable reference for handlers using ref
  const onItemSelectRef = useRef(onItemSelect);
  const onSelectAllRef = useRef(onSelectAll);
  const onSortRef = useRef(onSort);
  const getItemIdRef = useRef(getItemId);

  // Update refs when handlers change
  onItemSelectRef.current = onItemSelect;
  onSelectAllRef.current = onSelectAll;
  onSortRef.current = onSort;
  getItemIdRef.current = getItemId;

  // Stable handlers that don't change
  const stableOnItemSelect = useCallback((id: string) => {
    onItemSelectRef.current?.(id);
  }, []);

  const stableOnSelectAll = useCallback(() => {
    onSelectAllRef.current?.();
  }, []);

  const stableOnSort = useCallback((field: string) => {
    onSortRef.current?.(field);
  }, []);

  const stableGetItemId = useCallback((item: T) => {
    return getItemIdRef.current(item);
  }, []);

  // 🔥 핵심 최적화: selectedItems를 Set으로 변환 (메인 컴포넌트에서)
  const selectedItemsSet = useMemo(
    () => new Set(selectedItems),
    [selectedItems]
  );

  // Pagination logic - 클라이언트 사이드 pagination
  const paginatedData = useMemo(() => {
    if (!showPagination) return data;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage, showPagination]);

  // Calculate total items (use provided totalItems or data length)
  const actualTotalItems = totalItems ?? data.length;

  // Show loading state
  if (loading) {
    return (
      <div className={cn('border rounded-lg', className)}>
        <div className="p-8 text-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={cn('border rounded-lg p-8 text-center', className)}>
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <div className={cn('border rounded-lg', className)}>
        <EmptyState
          icon={emptyStateIcon || Square}
          title={emptyStateTitle}
          description={emptyStateDescription}
          action={emptyStateAction}
        />
      </div>
    );
  }

  const hasSelection = !!onItemSelect;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table - max height with scroll */}
      <div className="border rounded-lg max-h-[600px] overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block max-h-[600px] overflow-auto">
          <Table>
            <TableHeaderComponent
              columns={columns}
              sortConfig={sortConfig}
              onSort={stableOnSort}
              hasSelection={hasSelection}
              selectedCount={selectedItems.length}
              totalCount={showPagination ? paginatedData.length : data.length}
              onSelectAll={onSelectAll ? stableOnSelectAll : undefined}
            />
            <TableBodyComponent
              data={paginatedData}
              columns={columns}
              selectedItemsSet={selectedItemsSet}
              onItemSelect={hasSelection ? stableOnItemSelect : undefined}
              getItemId={stableGetItemId}
            />
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden max-h-[600px] overflow-auto">
          <MobileCardsContainer
            data={paginatedData}
            columns={columns}
            selectedItemsSet={selectedItemsSet}
            onItemSelect={hasSelection ? stableOnItemSelect : undefined}
            getItemId={stableGetItemId}
          />
        </div>
      </div>

      {/* Pagination */}
      {showPagination && onPageChange && onItemsPerPageChange && (
        <Pagination
          currentPage={currentPage}
          totalItems={actualTotalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
}) as <T>(props: DataTableProps<T>) => React.ReactElement;
