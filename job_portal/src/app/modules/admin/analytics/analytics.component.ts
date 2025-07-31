import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AnalyticsService, AnalyticsData, JobCategoryData, ApplicationStatusData, MonthlyTrend, ConversionData, TopJob } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('categoriesChart') categoriesChartRef!: ElementRef;
  @ViewChild('monthlyTrendsChart') monthlyTrendsChartRef!: ElementRef;

  // Data properties
  analyticsData: AnalyticsData | null = null;
  jobCategories: JobCategoryData[] = [];
  applicationStatus: ApplicationStatusData[] = [];
  monthlyTrends: MonthlyTrend[] = [];
  conversionData: ConversionData | null = null;
  topJobs: TopJob[] = [];
  isLoading = true;
  error: string | null = null;

  // Auto-refresh properties
  private refreshInterval: any;
  private readonly REFRESH_INTERVAL_MS = 30000; // 30 seconds
  
  // Chart instances
  private statusChart: Chart | null = null;
  private categoriesChart: Chart | null = null;
  private monthlyTrendsChart: Chart | null = null;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
    this.startAutoRefresh();
  }

  ngAfterViewInit(): void {
    Chart.register(...registerables);
    // Charts will be created after data is loaded
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
    // Clean up charts
    if (this.statusChart) this.statusChart.destroy();
    if (this.categoriesChart) this.categoriesChart.destroy();
    if (this.monthlyTrendsChart) this.monthlyTrendsChart.destroy();
  }

  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      console.log('Auto-refreshing analytics data...');
      this.loadAnalyticsData();
    }, this.REFRESH_INTERVAL_MS);
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private loadAnalyticsData(): void {
    this.isLoading = true;
    this.error = null;

    // Load all analytics data
    Promise.all([
      this.analyticsService.getAnalyticsOverview().toPromise(),
      this.analyticsService.getJobCategoriesData().toPromise(),
      this.analyticsService.getApplicationStatusData().toPromise(),
      this.analyticsService.getMonthlyTrends().toPromise(),
      this.analyticsService.getConversionData().toPromise(),
      this.analyticsService.getTopJobs(5).toPromise()
    ]).then(([
      analytics,
      categories,
      status,
      trends,
      conversion,
      jobs
    ]) => {
      this.analyticsData = analytics!;
      this.jobCategories = categories!;
      this.applicationStatus = status!;
      this.monthlyTrends = trends!;
      this.conversionData = conversion!;
      this.topJobs = jobs!;
      this.isLoading = false;

      // Create charts after data is loaded
      setTimeout(() => {
        this.createAllCharts();
      }, 100);

    }).catch(error => {
      console.error('Error loading analytics data:', error);
      this.error = 'Failed to load analytics data from database. Please check your connection and try again.';
      this.isLoading = false;
    });
  }

  private createAllCharts(): void {
    if (this.statusChartRef && this.applicationStatus.length > 0) {
      this.createStatusChart();
    }
    if (this.categoriesChartRef && this.jobCategories.length > 0) {
      this.createCategoriesChart();
    }
    if (this.monthlyTrendsChartRef && this.monthlyTrends.length > 0) {
      this.createMonthlyTrendsChart();
    }
  }

  private createStatusChart(): void {
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const labels = this.applicationStatus.map(item => item.status);
    const data = this.applicationStatus.map(item => item.percentage);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    this.statusChart = new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const count = this.applicationStatus[context.dataIndex]?.count || 0;
                return `${label}: ${value}% (${count} applications)`;
              }
            }
          }
        }
      }
    });
  }

  private createCategoriesChart(): void {
    if (this.categoriesChart) {
      this.categoriesChart.destroy();
    }

    const labels = this.jobCategories.map(item => item.category);
    const data = this.jobCategories.map(item => item.count);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

    this.categoriesChart = new Chart(this.categoriesChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Job Count',
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const percentage = this.jobCategories[context.dataIndex]?.percentage || 0;
                return `${context.label}: ${value} jobs (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private createMonthlyTrendsChart(): void {
    if (this.monthlyTrendsChart) {
      this.monthlyTrendsChart.destroy();
    }

    const labels = this.monthlyTrends.map(item => item.month);
    const usersData = this.monthlyTrends.map(item => item.users);
    const jobsData = this.monthlyTrends.map(item => item.jobs);
    const applicationsData = this.monthlyTrends.map(item => item.applications);

    this.monthlyTrendsChart = new Chart(this.monthlyTrendsChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Users',
            data: usersData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          },
          {
            label: 'Active Jobs',
            data: jobsData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          },
          {
            label: 'Applications',
            data: applicationsData,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#F59E0B',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  refreshData(): void {
    console.log('Manual refresh triggered...');
    this.stopAutoRefresh(); // Stop auto-refresh temporarily
    this.loadAnalyticsData();
    // Restart auto-refresh after manual refresh
    setTimeout(() => this.startAutoRefresh(), 1000);
  }

  exportReport(type: 'pdf' | 'excel' = 'pdf'): void {
    console.log(`Exporting ${type} report...`);
    this.analyticsService.exportReport(type).subscribe({
      next: (response) => {
        if (response.message) {
          alert(response.message);
        }
        if (response.downloadUrl) {
          // In a real implementation, you would handle the download URL
          console.log('Download URL:', response.downloadUrl);
          alert(`${type.toUpperCase()} report generated successfully! Download would start from: ${response.downloadUrl}`);
        }
      },
      error: (error) => {
        console.error('Error exporting report:', error);
        alert('Failed to export report. Please try again.');
      }
    });
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? '↗️' : '↘️';
  }

  getGrowthClass(growth: number): string {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  }
}
