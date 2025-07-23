import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { apiConfig } from '../../api.config';

export interface AnalyticsData {
  totalUsers: number;
  activeJobs: number;
  totalApplications: number;
  activeUsers: number;
  jobCategories: { name: string, count: number }[];
  applicationStatuses: { status: string, count: number, percentage: number }[];
  monthlyTrends: {
    labels: string[];
    users: number[];
    jobs: number[];
    applications: number[];
  };
  conversionFunnel: {
    visits: number;
    applications: number;
    interviews: number;
    hires: number;
  };
  userGrowth: number;
  jobGrowth: number;
  applicationGrowth: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${apiConfig.apiUrl}/analytics`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined' 
      ? localStorage.getItem('authToken') 
      : null;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAnalyticsData(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`, {
      headers: this.getAuthHeaders()
    });
  }
}
