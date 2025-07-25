import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  pendingApplications: number;
  scheduledInterviews: number;
  activeJobs: number;
}

export interface RecentJob {
  id: string;
  title: string;
  company_name: string;
  applicationCount: number;
  status: string;
  created_at: string;
}

export interface RecentActivity {
  id: string;
  type: 'application' | 'job_posted' | 'user_registered';
  message: string;
  user_name: string;
  user_initials: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/admin/dashboard/stats`, { headers })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Dashboard stats API error:', error);
          // Return default stats if API fails
          return of({
            totalUsers: 0,
            totalJobs: 0,
            totalApplications: 0,
            pendingApplications: 0,
            scheduledInterviews: 0,
            activeJobs: 0
          });
        })
      );
  }

  getRecentJobs(limit: number = 5): Observable<RecentJob[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<RecentJob[]>>(`${this.apiUrl}/admin/dashboard/recent-jobs?limit=${limit}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Recent jobs API error:', error);
          return of([]);
        })
      );
  }

  getRecentActivity(limit: number = 5): Observable<RecentActivity[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<RecentActivity[]>>(`${this.apiUrl}/admin/dashboard/recent-activity?limit=${limit}`, { headers })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Recent activity API error:', error);
          return of([]);
        })
      );
  }
}
