interface KPIData {
  todayRevenue: number;
  todayOrders: number;
  activeUsers: number;
  conversionRate: number;
}

interface ChartData {
  hourlyRevenue: Array<{ hour: string; revenue: number }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  categoryRevenue: Array<{ category: string; revenue: number }>;
}

interface TranslationFunction {
  (key: string): string;
}

export class DashboardExportService {
  static async exportToExcel(
    kpiData: KPIData,
    chartData: ChartData,
    t: TranslationFunction
  ): Promise<void> {
    try {
      const XLSX = await import('xlsx');

      // KPI 데이터 시트
      const kpiData_sheet = [
        [t('common.metrics'), t('common.value')],
        [t('dashboard.kpi.todayRevenue'), kpiData.todayRevenue],
        [t('dashboard.kpi.todayOrders'), kpiData.todayOrders],
        [t('dashboard.kpi.activeUsers'), kpiData.activeUsers],
        [t('dashboard.kpi.conversionRate'), kpiData.conversionRate],
      ];

      // 시간별 매출 데이터 시트
      const hourlyRevenueData = [
        [t('common.time'), t('common.revenue')],
        ...chartData.hourlyRevenue.map((item) => [item.hour, item.revenue]),
      ];

      // 주문 상태 분포 데이터 시트
      const orderStatusData = [
        [t('orders.status'), t('common.count')],
        ...chartData.orderStatusDistribution.map((item) => [
          item.status,
          item.count,
        ]),
      ];

      // 카테고리별 매출 데이터 시트
      const categoryRevenueData = [
        [t('products.category'), t('common.revenue')],
        ...chartData.categoryRevenue.map((item) => [
          item.category,
          item.revenue,
        ]),
      ];

      // 워크북 생성
      const workbook = XLSX.utils.book_new();

      // KPI 워크시트 생성 및 추가
      const kpiWorksheet = XLSX.utils.aoa_to_sheet(kpiData_sheet);
      kpiWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(
        workbook,
        kpiWorksheet,
        t('dashboard.kpi.title')
      );

      // 시간별 매출 워크시트 생성 및 추가
      const hourlyWorksheet = XLSX.utils.aoa_to_sheet(hourlyRevenueData);
      hourlyWorksheet['!cols'] = [{ wch: 10 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(
        workbook,
        hourlyWorksheet,
        t('dashboard.charts.hourlyRevenue')
      );

      // 주문 상태 워크시트 생성 및 추가
      const statusWorksheet = XLSX.utils.aoa_to_sheet(orderStatusData);
      statusWorksheet['!cols'] = [{ wch: 15 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(
        workbook,
        statusWorksheet,
        t('orders.status')
      );

      // 카테고리별 매출 워크시트 생성 및 추가
      const categoryWorksheet = XLSX.utils.aoa_to_sheet(categoryRevenueData);
      categoryWorksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(
        workbook,
        categoryWorksheet,
        t('dashboard.charts.categoryRevenue')
      );

      // Excel 파일 생성 및 다운로드
      const fileName = `dashboard_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      console.log('✅ Dashboard data exported to Excel successfully');
    } catch (error) {
      console.error('❌ Error exporting dashboard data:', error);
      throw new Error('Failed to export dashboard data');
    }
  }
}
