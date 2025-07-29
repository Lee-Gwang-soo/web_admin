/**
 * Excel Export Service
 * Excel 내보내기 서비스 모듈
 */

import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from '@/lib/utils/format.utils';
import type {
  ChartData,
  ExcelExportOptions,
  ExcelWorksheetData,
  KPIData,
} from '@/types/dashboard.types';

/**
 * Excel 내보내기 서비스 클래스
 */
export class ExcelExportService {
  /**
   * 대시보드 데이터를 Excel 파일로 내보냅니다
   * @param kpiData - KPI 데이터
   * @param chartData - 차트 데이터
   * @param translations - 번역 객체
   * @param options - 내보내기 옵션
   */
  static async exportDashboardData(
    kpiData: KPIData,
    chartData: ChartData,
    translations: Record<string, string>,
    options: ExcelExportOptions = {}
  ): Promise<void> {
    try {
      // 동적으로 xlsx 라이브러리 로드
      const XLSX = await import('xlsx');

      // 워크북 생성
      const workbook = XLSX.utils.book_new();

      // 각 시트 데이터 생성
      const kpiSheetData = this.createKPISheetData(kpiData, translations);
      const hourlyRevenueSheetData = this.createHourlyRevenueSheetData(
        chartData.hourlyRevenue,
        translations
      );
      const orderStatusSheetData = this.createOrderStatusSheetData(
        chartData.orderStatusDistribution,
        translations
      );
      const categoryRevenueSheetData = this.createCategoryRevenueSheetData(
        chartData.categoryRevenue,
        translations
      );

      // 워크시트 생성 및 추가
      this.addWorksheet(
        XLSX,
        workbook,
        kpiSheetData,
        translations['dashboard.kpi.title'] || 'KPI',
        { kpi: 20, value: 15 }
      );

      this.addWorksheet(
        XLSX,
        workbook,
        hourlyRevenueSheetData,
        translations['dashboard.charts.hourlyRevenue'] || 'Hourly Revenue',
        { time: 10, revenue: 15 }
      );

      this.addWorksheet(
        XLSX,
        workbook,
        orderStatusSheetData,
        translations['orders.status'] || 'Order Status',
        { status: 15, count: 10 }
      );

      this.addWorksheet(
        XLSX,
        workbook,
        categoryRevenueSheetData,
        translations['dashboard.charts.categoryRevenue'] || 'Category Revenue',
        { category: 20, revenue: 15 }
      );

      // 파일명 생성
      const fileName = this.generateFileName(options);

      // Excel 파일 생성 및 다운로드
      XLSX.writeFile(workbook, fileName);

      console.log('✅ Dashboard data exported to Excel successfully');
    } catch (error) {
      console.error('❌ Error exporting dashboard data:', error);
      throw new Error('Excel 내보내기 중 오류가 발생했습니다.');
    }
  }

  /**
   * KPI 데이터 시트를 생성합니다
   * @param kpiData - KPI 데이터
   * @param translations - 번역 객체
   * @returns Excel 워크시트 데이터
   */
  private static createKPISheetData(
    kpiData: KPIData,
    translations: Record<string, string>
  ): ExcelWorksheetData {
    return [
      [
        translations['common.metrics'] || '지표',
        translations['common.value'] || '값',
      ],
      [
        translations['dashboard.kpi.todayRevenue'] || '오늘 매출',
        formatCurrency(kpiData.todayRevenue),
      ],
      [
        translations['dashboard.kpi.todayOrders'] || '오늘 주문',
        formatNumber(kpiData.todayOrders),
      ],
      [
        translations['dashboard.kpi.activeUsers'] || '활성 사용자',
        formatNumber(kpiData.activeUsers),
      ],
      [
        translations['dashboard.kpi.conversionRate'] || '전환율',
        `${kpiData.conversionRate.toFixed(1)}%`,
      ],
    ];
  }

  /**
   * 시간별 매출 데이터 시트를 생성합니다
   * @param hourlyRevenue - 시간별 매출 데이터
   * @param translations - 번역 객체
   * @returns Excel 워크시트 데이터
   */
  private static createHourlyRevenueSheetData(
    hourlyRevenue: Array<{ hour: string; revenue: number }>,
    translations: Record<string, string>
  ): ExcelWorksheetData {
    const headers = [
      translations['common.time'] || '시간',
      translations['common.revenue'] || '매출',
    ];

    const data = hourlyRevenue.map((item) => [
      item.hour,
      formatCurrency(item.revenue),
    ]);

    return [headers, ...data];
  }

  /**
   * 주문 상태 분포 데이터 시트를 생성합니다
   * @param orderStatusDistribution - 주문 상태 분포 데이터
   * @param translations - 번역 객체
   * @returns Excel 워크시트 데이터
   */
  private static createOrderStatusSheetData(
    orderStatusDistribution: Array<{
      status: string;
      count: number;
      color: string;
    }>,
    translations: Record<string, string>
  ): ExcelWorksheetData {
    const headers = [
      translations['orders.status'] || '주문 상태',
      translations['common.count'] || '개수',
    ];

    const data = orderStatusDistribution.map((item) => [
      item.status,
      formatNumber(item.count),
    ]);

    return [headers, ...data];
  }

  /**
   * 카테고리별 매출 데이터 시트를 생성합니다
   * @param categoryRevenue - 카테고리별 매출 데이터
   * @param translations - 번역 객체
   * @returns Excel 워크시트 데이터
   */
  private static createCategoryRevenueSheetData(
    categoryRevenue: Array<{ category: string; revenue: number }>,
    translations: Record<string, string>
  ): ExcelWorksheetData {
    const headers = [
      translations['products.category'] || '카테고리',
      translations['common.revenue'] || '매출',
    ];

    const data = categoryRevenue.map((item) => [
      item.category,
      formatCurrency(item.revenue),
    ]);

    return [headers, ...data];
  }

  /**
   * 워크시트를 워크북에 추가합니다
   * @param XLSX - XLSX 라이브러리 객체
   * @param workbook - 워크북 객체
   * @param data - 워크시트 데이터
   * @param sheetName - 시트 이름
   * @param columnWidths - 컬럼 너비 설정
   */
  private static addWorksheet(
    XLSX: any,
    workbook: any,
    data: ExcelWorksheetData,
    sheetName: string,
    columnWidths: Record<string, number> = {}
  ): void {
    // 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // 컬럼 너비 설정
    const colWidths = Object.values(columnWidths).map((width) => ({
      wch: width,
    }));
    if (colWidths.length > 0) {
      worksheet['!cols'] = colWidths;
    }

    // 헤더 스타일링 (첫 번째 행)
    if (data.length > 0) {
      const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'E2E8F0' } },
          };
        }
      }
    }

    // 워크북에 시트 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  /**
   * 파일명을 생성합니다
   * @param options - 내보내기 옵션
   * @returns 생성된 파일명
   */
  private static generateFileName(options: ExcelExportOptions): string {
    const { fileName, includeTimestamp = true } = options;

    if (fileName) {
      return fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    }

    const baseFileName = 'dashboard_data';

    if (includeTimestamp) {
      const timestamp = formatDateTime(new Date(), {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/[^\d]/g, '');

      return `${baseFileName}_${timestamp}.xlsx`;
    }

    return `${baseFileName}.xlsx`;
  }

  /**
   * 특정 차트 데이터만 Excel로 내보냅니다
   * @param chartType - 차트 타입
   * @param data - 차트 데이터
   * @param translations - 번역 객체
   * @param options - 내보내기 옵션
   */
  static async exportChartData(
    chartType: 'hourlyRevenue' | 'orderStatus' | 'categoryRevenue',
    data: any[],
    translations: Record<string, string>,
    options: ExcelExportOptions = {}
  ): Promise<void> {
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();

      let sheetData: ExcelWorksheetData;
      let sheetName: string;
      let columnWidths: Record<string, number>;

      switch (chartType) {
        case 'hourlyRevenue':
          sheetData = this.createHourlyRevenueSheetData(data, translations);
          sheetName =
            translations['dashboard.charts.hourlyRevenue'] || 'Hourly Revenue';
          columnWidths = { time: 10, revenue: 15 };
          break;
        case 'orderStatus':
          sheetData = this.createOrderStatusSheetData(data, translations);
          sheetName = translations['orders.status'] || 'Order Status';
          columnWidths = { status: 15, count: 10 };
          break;
        case 'categoryRevenue':
          sheetData = this.createCategoryRevenueSheetData(data, translations);
          sheetName =
            translations['dashboard.charts.categoryRevenue'] ||
            'Category Revenue';
          columnWidths = { category: 20, revenue: 15 };
          break;
        default:
          throw new Error(`Unsupported chart type: ${chartType}`);
      }

      this.addWorksheet(XLSX, workbook, sheetData, sheetName, columnWidths);

      const fileName =
        options.fileName ||
        `${chartType}_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      console.log(`✅ ${chartType} data exported to Excel successfully`);
    } catch (error) {
      console.error(`❌ Error exporting ${chartType} data:`, error);
      throw new Error(`${chartType} 데이터 내보내기 중 오류가 발생했습니다.`);
    }
  }

  /**
   * CSV 형식으로 데이터를 내보냅니다
   * @param data - 내보낼 데이터
   * @param fileName - 파일명
   */
  static exportToCSV(data: ExcelWorksheetData, fileName: string): void {
    try {
      const csvContent = data
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        fileName.endsWith('.csv') ? fileName : `${fileName}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ Data exported to CSV successfully');
    } catch (error) {
      console.error('❌ Error exporting to CSV:', error);
      throw new Error('CSV 내보내기 중 오류가 발생했습니다.');
    }
  }
}
