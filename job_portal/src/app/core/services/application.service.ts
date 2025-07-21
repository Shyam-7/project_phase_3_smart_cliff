import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { JobApplication } from '../models/job-application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private baseUrl = 'http://localhost:3001/api';
  
  // Track applied job IDs for UI state
  private appliedJobsSubject = new BehaviorSubject<string[]>([]);
  public appliedJobs$ = this.appliedJobsSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadAppliedJobs();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined' 
      ? localStorage.getItem('authToken') 
      : null;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Apply to a job
  applyToJob(jobId: string, applicationData?: Partial<JobApplication>): Observable<any> {
    const application = {
      jobId,
      quickApply: applicationData?.quickApply || false,
      applicationDate: new Date().toISOString(),
      status: 'Applied' as const,
      fullName: applicationData?.fullName || null,
      email: applicationData?.email || null,
      phone: applicationData?.phone || null,
      coverLetter: applicationData?.coverLetter || null,
      resumePath: applicationData?.resumePath || null,
      ...applicationData
    };

    return this.http.post(`${this.baseUrl}/applications`, application, {
      headers: this.getAuthHeaders()
    });
  }

  // Get all applications for current user
  getUserApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.baseUrl}/applications/user`, {
      headers: this.getAuthHeaders()
    });
  }

  // Check if user has already applied to a job
  hasApplied(jobId: string): boolean {
    return this.appliedJobsSubject.value.includes(jobId);
  }

  // Add job to applied list (for UI state)
  addToAppliedJobs(jobId: string): void {
    const currentApplied = this.appliedJobsSubject.value;
    if (!currentApplied.includes(jobId)) {
      this.appliedJobsSubject.next([...currentApplied, jobId]);
      this.saveAppliedJobsToStorage();
    }
  }

  // Remove job from applied list (for UI state)
  removeFromAppliedJobs(jobId: string): void {
    const currentApplied = this.appliedJobsSubject.value;
    const filtered = currentApplied.filter(id => id !== jobId);
    this.appliedJobsSubject.next(filtered);
    this.saveAppliedJobsToStorage();
  }

  // Load applied jobs from storage or API
  private loadAppliedJobs(): void {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      // Load from localStorage first for immediate UI state
      const stored = localStorage.getItem('appliedJobs');
      if (stored) {
        this.appliedJobsSubject.next(JSON.parse(stored));
      }
      
      // Then load from API to sync with database
      this.syncAppliedJobsFromAPI();
    }
  }

  // Sync applied jobs from API
  private syncAppliedJobsFromAPI(): void {
    this.getUserApplications().subscribe({
      next: (applications: any[]) => {
        const appliedJobIds = applications.map(app => app.application?.jobId || app.jobId).filter(Boolean);
        this.appliedJobsSubject.next(appliedJobIds);
        this.saveAppliedJobsToStorage();
      },
      error: (error) => {
        console.error('Error syncing applied jobs from API:', error);
      }
    });
  }

  // Save applied jobs to localStorage
  private saveAppliedJobsToStorage(): void {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      localStorage.setItem('appliedJobs', JSON.stringify(this.appliedJobsSubject.value));
    }
  }

  // Refresh applied jobs from API (call after applying)
  refreshAppliedJobs(): void {
    this.syncAppliedJobsFromAPI();
  }
}
