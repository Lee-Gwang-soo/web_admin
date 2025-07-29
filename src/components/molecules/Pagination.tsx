import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  className?: string;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
}

export const Pagination = memo<PaginationProps>(function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 20, 50],
}) {
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  const startItem = useMemo(() => {
    return (currentPage - 1) * itemsPerPage + 1;
  }, [currentPage, itemsPerPage]);

  const endItem = useMemo(() => {
    return Math.min(currentPage * itemsPerPage, totalItems);
  }, [currentPage, itemsPerPage, totalItems]);

  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // 전체 페이지가 5개 이하이면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 더 많은 페이지가 있을 때
      if (currentPage <= 3) {
        // 현재 페이지가 앞쪽에 있을 때
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 현재 페이지가 뒤쪽에 있을 때
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 현재 페이지가 중간에 있을 때
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Items per page selector */}
        {showItemsPerPage && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">페이지당 항목</p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {itemsPerPageOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Current page info */}
        <div className="flex w-24 items-center justify-center text-sm font-medium">
          {totalItems > 0
            ? `${startItem}-${endItem} / ${totalItems}`
            : '0 items'}
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center space-x-2">
        {/* Previous page button */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <span className="sr-only">이전 페이지</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? 'default' : 'outline'}
              className="h-8 w-8 p-0"
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page === 'string'}
            >
              {page}
            </Button>
          ))}
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <span className="sr-only">다음 페이지</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
