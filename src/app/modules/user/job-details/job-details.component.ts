import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { Job } from '../../../core/models/job.model';
import { JobApplication } from '../../../core/models/job-application.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from "../../../shared/shared.module";
import { JobApplicationModalComponent } from '../job-application-modal/job-application-modal.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, JobApplicationModalComponent],
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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.loadJobDetails(+jobId);
    } else {
      this.error = 'No job ID provided';
      this.loading = false;
    }
  }

  private loadJobDetails(jobId: number): void {
    this.jobService.getJobById(jobId).subscribe({
      next: (job) => {
        this.job = job;
        this.loading = false;
        // Check if user has already applied to this job
        this.checkApplicationStatus(jobId);
      },
      error: (err) => {
        this.error = 'Failed to load job details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private checkApplicationStatus(jobId: number): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.jobService.getUserApplications(currentUser.id).subscribe({
        next: (applications) => {
          this.hasApplied = applications.some(app => 
            Number(app.application.jobId) === jobId && 
            app.application.status !== 'Withdrawn'
          );
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

  handleApplicationSubmit(applicationData: JobApplication): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id || !this.job?.id) {
      console.error('Missing user or job information');
      return;
    }

    const application: JobApplication = {
      ...applicationData,
      jobId: this.job.id,
      userId: currentUser.id,
      applicationDate: new Date().toISOString(),
      status: 'Applied'
    };

    this.jobService.applyToJob(application).subscribe({
      next: (response) => {
        console.log('Application submitted successfully:', response);
        this.hasApplied = true; // Update the button status
        this.showApplicationModal = false;
        // Show success message
        alert('Application submitted successfully!');
      },
      error: (error) => {
        console.error('Error submitting application:', error);
        alert('Failed to submit application. Please try again.');
      }
    });
  }
}
