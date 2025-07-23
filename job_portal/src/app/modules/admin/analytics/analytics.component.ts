import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AnalyticsService, AnalyticsData } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('categoriesChart') categoriesChartRef!: ElementRef;
  @ViewChild('monthlyTrendsChart') monthlyTrendsChartRef!: ElementRef;

  analyticsData: AnalyticsData | null = null;
  loading = true;
  error: string | null = null;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadAnalyticsData();
  }

  ngAfterViewInit() {
    Chart.register(...registerables);
    // Charts will be created after data is loaded
  }

  public loadAnalyticsData() {
    this.loading = true;
    this.error = null;
    
    this.analyticsService.getAnalyticsData().subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.loading = false;
        
        // Create charts after data is loaded
        setTimeout(() => {
          this.createStatusChart();
          this.createCategoriesChart();
          this.createMonthlyTrendsChart();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading analytics data:', error);
        this.error = 'Failed to load analytics data';
        this.loading = false;
      }
    });
  }

  private createStatusChart() {
    if (!this.analyticsData || !this.statusChartRef) return;

    const statusData = this.analyticsData.applicationStatuses;
    const labels = statusData.map(item => item.status);
    const data = statusData.map(item => item.percentage);

    new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#3B82F6', // blue-500
            '#10B981', // green-500
            '#F59E0B', // yellow-500
            '#EF4444'  // red-500
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  }

  private createCategoriesChart() {
    if (!this.analyticsData || !this.categoriesChartRef) return;

    const categoriesData = this.analyticsData.jobCategories;
    const labels = categoriesData.map(item => item.name);
    const data = categoriesData.map(item => item.count);

    new Chart(this.categoriesChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Job Count',
          data: data,
          backgroundColor: [
            '#3B82F6', // blue-500
            '#10B981', // green-500
            '#F59E0B', // yellow-500
            '#8B5CF6', // purple-500
            '#EF4444'  // red-500
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  private createMonthlyTrendsChart() {
    if (!this.analyticsData || !this.monthlyTrendsChartRef) return;

    const trendsData = this.analyticsData.monthlyTrends;

    new Chart(this.monthlyTrendsChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: trendsData.labels,
        datasets: [
          {
            label: 'Total Users',
            data: trendsData.users,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Active Jobs',
            data: trendsData.jobs,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Applications',
            data: trendsData.applications,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.3,
            fill: true
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
            beginAtZero: true
          }
        }
      }
    });
  }
}
