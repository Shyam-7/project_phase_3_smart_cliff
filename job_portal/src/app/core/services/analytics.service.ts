import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface AnalyticsData {
  totalUsers: number;
  activeJobs: number;
  totalApplications: number;
  userVisits: number;
  userGrowth: number;
  jobGrowth: number;
  applicationGrowth: number;
  visitGrowth: number;
}

export interface JobCategoryData {
  category: string;
  count: number;
  percentage: number;
}

export interface ApplicationStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  users: number;
  jobs: number;
  applications: number;
}

export interface ConversionData {
  totalVisits: number;
  totalApplications: number;
  totalInterviews: number;
  totalHires: number;
  visitToApplicationRate: number;
  applicationToInterviewRate: number;
  interviewToHireRate: number;
}

export interface TopJob {
  id: string;
  title: string;
  company: string;
  applications: number;
  views: number;
}

export interface UserActivity {
  date: string;
  registrations: number;
  logins: number;
  applications: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  getAnalyticsOverview(): Observable<AnalyticsData> {
    return this.http.get<ApiResponse<AnalyticsData>>(`${this.apiUrl}/analytics/overview`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Analytics overview API error:', error);
          // Return mock data as fallback
          return of({
            totalUsers: 0,
            activeJobs: 0,
            totalApplications: 0,
            userVisits: 0,
            userGrowth: 0,
            jobGrowth: 0,
            applicationGrowth: 0,
            visitGrowth: 0
          });
        })
      );
  }

  getJobCategoriesData(): Observable<JobCategoryData[]> {
    return this.http.get<ApiResponse<JobCategoryData[]>>(`${this.apiUrl}/analytics/job-categories`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Job categories API error:', error);
          return of([]);
        })
      );
  }

  getApplicationStatusData(): Observable<ApplicationStatusData[]> {
    return this.http.get<ApiResponse<ApplicationStatusData[]>>(`${this.apiUrl}/analytics/application-status`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Application status API error:', error);
          return of([]);
        })
      );
  }

  getMonthlyTrends(months: number = 6): Observable<MonthlyTrend[]> {
    return this.http.get<ApiResponse<MonthlyTrend[]>>(`${this.apiUrl}/analytics/monthly-trends?months=${months}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Monthly trends API error:', error);
          return of([]);
        })
      );
  }

  getConversionData(): Observable<ConversionData> {
    return this.http.get<ApiResponse<ConversionData>>(`${this.apiUrl}/analytics/conversion`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Conversion data API error:', error);
          return of({
            totalVisits: 0,
            totalApplications: 0,
            totalInterviews: 0,
            totalHires: 0,
            visitToApplicationRate: 0,
            applicationToInterviewRate: 0,
            interviewToHireRate: 0
          });
        })
      );
  }

  getTopJobs(limit: number = 10): Observable<TopJob[]> {
    return this.http.get<ApiResponse<TopJob[]>>(`${this.apiUrl}/analytics/top-jobs?limit=${limit}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Top jobs API error:', error);
          return of([]);
        })
      );
  }

  getUserActivity(days: number = 30): Observable<UserActivity[]> {
    return this.http.get<ApiResponse<UserActivity[]>>(`${this.apiUrl}/analytics/user-activity?days=${days}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('User activity API error:', error);
          return of([]);
        })
      );
  }

  exportReport(type: 'pdf' | 'excel' = 'pdf'): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/analytics/export/${type}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Export report API error:', error);
          return of({ message: 'Export failed. Please try again.' });
        })
      );
  }

  refreshData(): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/analytics/refresh`, {})
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Refresh data API error:', error);
          return of({ message: 'Refresh failed. Please try again.' });
        })
      );
  }
}
