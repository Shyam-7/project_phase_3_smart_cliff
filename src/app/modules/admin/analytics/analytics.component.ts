import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('categoriesChart') categoriesChartRef!: ElementRef;
  @ViewChild('monthlyTrendsChart') monthlyTrendsChartRef!: ElementRef;

  ngAfterViewInit() {
    Chart.register(...registerables);
    this.createStatusChart();
    this.createCategoriesChart();
    this.createMonthlyTrendsChart();
  }

  private createStatusChart() {
    new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Under review', 'Approved', 'Interview Scheduled', 'Rejected'],
        datasets: [{
          data: [45.2, 32.1, 15.7, 7.0],
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
        maintainAspectRatio: false, // <-- FIX: Prevents chart from overflowing its container
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
    new Chart(this.categoriesChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Technology', 'Healthcare', 'Finance', 'Marketing', 'Design'],
        datasets: [{
          label: 'Job Count',
          data: [342, 189, 156, 127, 89],
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
        maintainAspectRatio: false, // <-- BEST PRACTICE: Added for consistency
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
    new Chart(this.monthlyTrendsChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Total Users',
            data: [1200, 1500, 1800, 2100, 2400, 2700, 2841],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Active Jobs',
            data: [80, 90, 95, 100, 110, 120, 126],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Applications',
            data: [200, 250, 280, 300, 330, 360, 385],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // <-- BEST PRACTICE: Added for consistency
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
