import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiConfig } from '../../api.config'; // <-- CORRECTED IMPORT
import { Job } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${apiConfig.apiUrl}/jobs`; // <-- CORRECTED USAGE

  constructor(private http: HttpClient) { }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getJobById(id: string): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  applyForJob(applicationData: any): Observable<any> {
    const applicationApiUrl = `${apiConfig.apiUrl}/applications`;
    return this.http.post(applicationApiUrl, applicationData);
  }
}