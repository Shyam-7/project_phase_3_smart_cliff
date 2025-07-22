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
  userApplicationId: string | null = null;

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
          const userApplication = applications.find(app => {
            const appJobId = app.application?.jobId || app.jobId;
            const appStatus = app.application?.status || app.status;
            return appJobId === jobId && appStatus !== 'Withdrawn';
          });
          
          if (userApplication) {
            this.hasApplied = true;
            this.userApplicationId = userApplication.application?.id || userApplication.id;
            
            // Update the ApplicationService state
            this.applicationService.addToAppliedJobs(jobId);
          } else {
            this.hasApplied = false;
            this.userApplicationId = null;
          }
        },
        error: (error) => {
          console.error('Error checking application status:', error);
        }
      });
    }
  }

  getCompanyInitials(): string {
    const company = this.job?.company || this.job?.company_name || '';
    return company.charAt(0) || '?';
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

    const user = this.authService.getCurrentUser();
    const quickApplicationData = {
      jobId: this.job.id,
      fullName: user?.name || user?.email || '',
      email: user?.email || '',
      phone: '', // Default empty since user profile might not have phone
      coverLetter: `I am interested in applying for the ${this.job.title} position at ${this.job.company}. Please consider my application based on my profile and experience.`,
      resumePath: null,
      quickApply: true
    };

    this.jobService.applyToJob(quickApplicationData).subscribe({
      next: (response) => {
        console.log('Quick application submitted successfully:', response);
        this.hasApplied = true;
        this.applicationService.addToAppliedJobs(this.job!.id);
        alert('Application submitted successfully!');
      },
      error: (error) => {
        console.error('Error submitting quick application:', error);
        alert('Failed to submit application. Please try again.');
      }
    });
  }

  handleApplicationSubmit(applicationResponse: any): void {
    console.log('Application submitted from modal:', applicationResponse);
    console.log('Response structure:', JSON.stringify(applicationResponse, null, 2));
    
    // The application has already been submitted by the modal component
    // Extract the application ID from the response for future withdrawal
    let extractedId = null;
    
    // Try different possible response structures
    if (applicationResponse && applicationResponse.application && applicationResponse.application.id) {
      extractedId = applicationResponse.application.id;
      console.log('Found ID in applicationResponse.application.id:', extractedId);
    } else if (applicationResponse && applicationResponse.id) {
      extractedId = applicationResponse.id;
      console.log('Found ID in applicationResponse.id:', extractedId);
    } else if (applicationResponse && typeof applicationResponse === 'string') {
      extractedId = applicationResponse;
      console.log('Found ID as direct string:', extractedId);
    }
    
    if (extractedId) {
      this.userApplicationId = extractedId;
      console.log('Set userApplicationId to:', this.userApplicationId, 'type:', typeof this.userApplicationId);
    } else {
      console.error('Could not extract application ID from response:', applicationResponse);
      console.error('Available properties:', Object.keys(applicationResponse || {}));
    }
    
    // Update the UI state
    this.hasApplied = true;
    if (this.job?.id) {
      this.applicationService.addToAppliedJobs(this.job.id);
      this.applicationService.refreshAppliedJobs(); // Refresh from API
    }
    this.showApplicationModal = false;
    
    // No need to make another API call here since the modal already submitted it
  }

  withdrawApplication(): void {
    console.log('withdrawApplication called, userApplicationId:', this.userApplicationId);
    
    if (!this.userApplicationId) {
      console.error('Application ID not found');
      alert('Cannot withdraw: Application ID not found. Please refresh the page and try again.');
      return;
    }

    // Show confirmation dialog
    const confirmWithdraw = confirm('Are you sure you want to withdraw this application? This action cannot be undone.');
    
    if (!confirmWithdraw) {
      console.log('Withdrawal cancelled by user');
      return;
    }

    console.log('Proceeding with withdrawal for application ID:', this.userApplicationId);

    this.jobService.withdrawApplication(this.userApplicationId).subscribe({
      next: (response) => {
        console.log('Application withdrawn successfully:', response);
        this.hasApplied = false;
        this.userApplicationId = null;
        
        // Remove from applied jobs in ApplicationService
        if (this.job?.id) {
          this.applicationService.removeFromAppliedJobs(this.job.id);
        }
        
        alert('Application withdrawn successfully!');
      },
      error: (error) => {
        console.error('Error withdrawing application:', error);
        alert('Failed to withdraw application. Please try again.');
      }
    });
  }
}
