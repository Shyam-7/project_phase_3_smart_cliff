import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { Job } from '../../../core/models/job.model';
import { JobApplication } from '../../../core/models/job-application.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from "../../../shared/shared.module";
import { JobApplicationModalComponent } from '../job-application-modal/job-application-modal.component';
import { AuthService } from '../../../core/auth/auth.service';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, JobApplicationModalComponent, TimeAgoPipe],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {
  job: Job | undefined;
  loading = true;
  error: string | null = null;
  isSaved = false;
  hasApplied = false;
  showApplicationModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    console.log('Route job ID:', jobId);
    if (jobId) {
      this.loadJobDetails(jobId);
    } else {
      this.error = 'No job ID provided';
      this.loading = false;
    }
  }

  private loadJobDetails(jobId: string): void {
    console.log('Loading job details for ID:', jobId);
    this.jobService.getJobById(jobId).subscribe({
      next: (job) => {
        this.job = job;
        this.loading = false;
        // Check if user has already applied to this job
        this.checkApplicationStatus(jobId);
      },
      error: (err) => {
        console.error('Job details error:', err);
        this.error = err.error?.message || 'Failed to load job details';
        this.loading = false;
      }
    });
  }

  private checkApplicationStatus(jobId: string): void {
    // Check from ApplicationService first (for immediate UI feedback)
    this.hasApplied = this.applicationService.hasApplied(jobId);
    
    // Then check from API for accuracy
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.applicationService.getUserApplications().subscribe({
        next: (applications: any[]) => {
          const hasAppliedToJob = applications.some(app => {
            const appJobId = app.application?.jobId || app.jobId;
            const appStatus = app.application?.status || app.status;
            return appJobId === jobId && appStatus !== 'Withdrawn';
          });
          this.hasApplied = hasAppliedToJob;
          
          // Update the ApplicationService state
          if (hasAppliedToJob) {
            this.applicationService.addToAppliedJobs(jobId);
          }
        },
        error: (error) => {
          console.error('Error checking application status:', error);
        }
      });
    }
  }

  getCompanyInitials(): string {
    return this.job?.company.charAt(0) || '?';
  }

  navigateBack(): void {
    this.router.navigate(['user/job-search']);
  }
  openApplicationModal() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.showApplicationModal = true;
  }

  // Quick apply function
  quickApply(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.job?.id) {
      console.error('Job ID not found');
      return;
    }

    this.applicationService.applyToJob(this.job.id, { quickApply: true }).subscribe({
      next: (response) => {
        console.log('Quick application submitted successfully:', response);
        this.hasApplied = true;
        alert('Application submitted successfully!');
      },
      error: (error) => {
        console.error('Error submitting quick application:', error);
        alert('Failed to submit application. Please try again.');
      }
    });
  }

  handleApplicationSubmit(applicationData: JobApplication): void {
    if (!this.job?.id) {
      console.error('Job ID not found');
      return;
    }

    this.applicationService.applyToJob(this.job.id, applicationData).subscribe({
      next: (response) => {
        console.log('Application submitted successfully:', response);
        this.hasApplied = true;
        this.applicationService.addToAppliedJobs(this.job!.id);
        this.applicationService.refreshAppliedJobs(); // Refresh from API
        this.showApplicationModal = false;
        alert('Application submitted successfully!');
      },
      error: (error) => {
        console.error('Error submitting application:', error);
        alert('Failed to submit application. Please try again.');
      }
    });
  }
}
