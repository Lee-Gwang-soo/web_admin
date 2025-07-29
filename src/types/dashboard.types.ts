/**
 * Dashboard TypeScript interfaces and types
 * 대시보드 관련 TypeScript 인터페이스 및 타입 정의
 */

// KPI 데이터 인터페이스
export interface KPIData {
  todayRevenue: number;
  todayOrders: number;
  activeUsers: number;
  conversionRate: number;
}

// 차트 데이터 인터페이스
export interface ChartData {
  hourlyRevenue: HourlyRevenueData[];
  orderStatusDistribution: OrderStatusData[];
  categoryRevenue: CategoryRevenueData[];
}

// 시간별 매출 데이터
export interface HourlyRevenueData {
  hour: string;
  revenue: number;
}

// 주문 상태 분포 데이터
export interface OrderStatusData {
  status: string;
  count: number;
  color: string;
}

// 카테고리별 매출 데이터
export interface CategoryRevenueData {
  category: string;
  revenue: number;
}

// 메타 데이터 인터페이스
export interface MetaData {
  lastUpdated: Date | null;
  isRealTimeActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'loading';
}

// 전체 대시보드 데이터 인터페이스
export interface DashboardData {
  kpi: KPIData;
  charts: ChartData;
  meta: MetaData;
}

// 날짜 필터 타입
export type DateFilter = 'today' | 'yesterday' | 'week';

// 트렌드 방향 타입
export type TrendDirection = 'up' | 'down' | 'neutral';

// 연결 상태 타입
export type ConnectionStatus = 'connected' | 'disconnected' | 'loading';

// 포맷 타입
export type FormatType = 'currency' | 'percentage' | 'number';

// KPI 메트릭 프로퍼티 인터페이스
export interface KPIMetricProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: TrendDirection;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  loading?: boolean;
  formatType?: FormatType;
}

// 날짜 필터 프로퍼티 인터페이스
export interface DateFilterProps {
  value: DateFilter;
  onChange: (value: DateFilter) => void;
  disabled?: boolean;
}

// 내보내기 버튼 프로퍼티 인터페이스
export interface ExportButtonProps {
  onExport: () => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

// 차트 컨테이너 프로퍼티 인터페이스
export interface ChartContainerProps {
  title: string;
  description?: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

// 대시보드 헤더 프로퍼티 인터페이스
export interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  lastUpdated: Date | null;
  isRealTimeActive: boolean;
}

// 대시보드 컨트롤 프로퍼티 인터페이스
export interface DashboardControlsProps {
  dateFilter: DateFilter;
  onDateFilterChange: (value: DateFilter) => void;
  onRefresh: () => void;
  onExport: () => Promise<void>;
  loading: boolean;
}

// KPI 섹션 프로퍼티 인터페이스
export interface KPISectionProps {
  data: KPIData;
  dateFilter: DateFilter;
  loading: boolean;
}

// 차트 섹션 프로퍼티 인터페이스
export interface ChartsSectionProps {
  chartData: ChartData;
  loading: boolean;
}

// 시스템 정보 섹션 프로퍼티 인터페이스
export interface SystemInfoSectionProps {
  autoRefreshInterval: string;
  dataSource: string;
  connectionStatus: ConnectionStatus;
}

// 대시보드 템플릿 프로퍼티 인터페이스
export interface DashboardTemplateProps {
  header: React.ReactNode;
  controls: React.ReactNode;
  kpiSection: React.ReactNode;
  chartsSection: React.ReactNode;
  systemInfo: React.ReactNode;
}

// 스켈레톤 카드 프로퍼티 인터페이스
export interface SkeletonCardProps {
  height?: string;
  className?: string;
}

// 트렌드 배지 프로퍼티 인터페이스
export interface TrendBadgeProps {
  value: number;
  trend: TrendDirection;
  label?: string;
}

// 상태 인디케이터 프로퍼티 인터페이스
export interface StatusIndicatorProps {
  status: ConnectionStatus;
  label: string;
}

// Excel 내보내기 데이터 인터페이스
export interface ExcelExportData {
  kpiData: KPIData;
  chartData: ChartData;
  translations: Record<string, string>;
}

// Excel 워크시트 데이터 타입
export type ExcelWorksheetData = (string | number)[][];

// Excel 내보내기 옵션 인터페이스
export interface ExcelExportOptions {
  fileName?: string;
  includeTimestamp?: boolean;
  columnWidths?: { [key: string]: number };
}
