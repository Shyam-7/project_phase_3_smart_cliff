import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { apiConfig } from '../../api.config';
import { Job } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${apiConfig.apiUrl}/jobs`;

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

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  // Get all jobs for admin (including inactive)
  getAllJobsForAdmin(): Observable<Job[]> {
    const timestamp = new Date().getTime();
    return this.http.get<Job[]>(`${this.apiUrl}/admin/all?_t=${timestamp}`, {
      headers: this.getAuthHeaders()
    });
  }

  getJobsWithFilters(params: any): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl, { params });
  }

  getJobById(id: string): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Apply for job methods (both names for compatibility)
  applyForJob(applicationData: any): Observable<any> {
    const applicationApiUrl = `${apiConfig.apiUrl}/applications`;
    return this.http.post(applicationApiUrl, applicationData, {
      headers: this.getAuthHeaders()
    });
  }

  applyToJob(applicationData: any): Observable<any> {
    return this.applyForJob(applicationData);
  }

  // Admin job management methods
  addJob(jobData: any): Observable<any> {
    return this.http.post(this.apiUrl, jobData, {
      headers: this.getAuthHeaders()
    });
  }

  updateJob(jobData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${jobData.id}`, jobData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteJob(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // User application methods
  getUserApplications(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${apiConfig.apiUrl}/applications/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateApplication(applicationId: string, applicationData: any): Observable<any> {
    return this.http.put(`${apiConfig.apiUrl}/applications/${applicationId}`, applicationData, {
      headers: this.getAuthHeaders()
    });
  }

  withdrawApplication(applicationId: string): Observable<any> {
    return this.http.delete(`${apiConfig.apiUrl}/applications/${applicationId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Resume upload method (placeholder)
  uploadResume(resumeData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // For now, just return the resume data as-is
      // In a real implementation, you'd upload to a file storage service
      resolve({
        url: resumeData.data,
        name: resumeData.name
      });
    });
  }
}