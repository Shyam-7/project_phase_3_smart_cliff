import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDashboardService, DashboardStats, RecentJob, RecentActivity } from '../../../core/services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  dashboardStats: DashboardStats | null = null;
  recentJobs: RecentJob[] = [];
  recentActivity: RecentActivity[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // Load dashboard stats
    this.adminDashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.error = 'Failed to load dashboard statistics';
        this.isLoading = false;
      }
    });

    // Load recent jobs
    this.adminDashboardService.getRecentJobs(5).subscribe({
      next: (jobs) => {
        this.recentJobs = jobs;
      },
      error: (error) => {
        console.error('Error loading recent jobs:', error);
      }
    });

    // Load recent activity
    this.adminDashboardService.getRecentActivity(5).subscribe({
      next: (activity) => {
        this.recentActivity = activity;
      },
      error: (error) => {
        console.error('Error loading recent activity:', error);
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800';
      case 'draft':
        return 'px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800';
      case 'closed':
        return 'px-2 py-1 rounded-full text-xs bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800';
    }
  }
}
