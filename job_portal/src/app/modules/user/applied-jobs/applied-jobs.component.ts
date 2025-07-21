import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';
import { JobApplication } from '../../../core/models/job-application.model';
import { Job } from '../../../core/models/job.model';
import { HeaderComponent } from '../../../shared/components/user/header/header.component';

@Component({
  selector: 'app-applied-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FormsModule],
  templateUrl: './applied-jobs.component.html',
  styleUrls: ['./applied-jobs.component.css']
})
export class AppliedJobsComponent implements OnInit {
  applications: { application: JobApplication; job: Job }[] = [];
  filteredApplications: { application: JobApplication; job: Job }[] = [];
  isLoading = true;
  error: string | null = null;
  currentSort = 'newest';
  selectedStatus = 'all';

  // Application editing properties
  showEditModal = false;
  editingApplication: JobApplication | null = null;
  editForm = {
    fullName: '',
    email: '',
    phone: '',
    coverLetter: ''
  };

  // Application details modal properties
  showDetailsModal = false;
  selectedApplication: JobApplication | null = null;
  selectedJob: Job | null = null;

  // Edit confirmation modal
  showEditConfirmModal = false;
  pendingEditApplication: JobApplication | null = null;

  // Custom withdrawal warning modal
  showWithdrawModal = false;
  pendingWithdrawApplicationId: string | null = null;

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.jobService.getUserApplications(currentUser.id).subscribe({
      next: (data: { application: JobApplication; job: Job }[]) => {
        // Filter out withdrawn applications - they should not be visible
        this.applications = data.filter(item => item.application.status !== 'Withdrawn');
        console.log('Loaded applications:', this.applications);
        this.applications.forEach((item, index) => {
          console.log(`Application ${index + 1}: Status = "${item.application.status}"`);
        });
        this.filteredApplications = [...this.applications];
        this.sortApplications({ target: { value: this.currentSort } } as any);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.handleError('Failed to load applied jobs. Please try again later.');
      }
    });
  }

  sortApplications(event: any): void {
    const sortValue = event.target.value;
    this.currentSort = sortValue;

    this.filteredApplications.sort((a, b) => {
      switch (sortValue) {
        case 'newest':
          return new Date(b.application.applicationDate).getTime() - new Date(a.application.applicationDate).getTime();
        case 'oldest':
          return new Date(a.application.applicationDate).getTime() - new Date(b.application.applicationDate).getTime();
        case 'status':
          return a.application.status.localeCompare(b.application.status);
        default:
          return 0;
      }
    });
  }

  filterByStatus(event: any): void {
    const status = event.target.value;
    this.selectedStatus = status;
    
    if (status === 'all') {
      this.filteredApplications = [...this.applications];
    } else {
      this.filteredApplications = this.applications.filter(item => 
        item.application.status === status
      );
    }
    this.sortApplications({ target: { value: this.currentSort } } as any);
  }

  viewJobDetails(jobId: number | string): void {
    this.router.navigate(['/user/job-details', jobId]);
  }

  withdrawApplication(applicationId: string): void {
    console.log('withdrawApplication called with ID:', applicationId, 'type:', typeof applicationId);
    // Show custom Tailwind warning modal instead of browser confirm
    this.pendingWithdrawApplicationId = applicationId;
    this.showWithdrawModal = true;
    console.log('Modal shown, pendingWithdrawApplicationId set to:', this.pendingWithdrawApplicationId);
  }

  confirmWithdraw(): void {
    console.log('confirmWithdraw called, pendingWithdrawApplicationId:', this.pendingWithdrawApplicationId);
    
    if (this.pendingWithdrawApplicationId) {
      const applicationId = this.pendingWithdrawApplicationId;
      console.log('Proceeding with withdrawal for application ID:', applicationId);
      this.closeWithdrawModal(); // Close modal first
      
      this.jobService.withdrawApplication(applicationId).subscribe({
        next: (response) => {
          console.log('Withdrawal successful:', response);
          this.loadApplications(); // Reload the applications
          alert('✅ Application withdrawn successfully');
        },
        error: (error) => {
          console.error('Error withdrawing application:', error);
          alert('❌ Failed to withdraw application. Please try again.');
        }
      });
    } else {
      console.error('No pending withdrawal application ID found');
    }
  }

  closeWithdrawModal(): void {
    this.showWithdrawModal = false;
    this.pendingWithdrawApplicationId = null;
  }

  updateApplicationStatus(application: JobApplication, event: any): void {
    const newStatus = event.target.value;
    console.log('Updating status from', application.status, 'to', newStatus);
    
    if (newStatus === application.status) {
      return; // No change needed
    }
    
    const applicationData = { status: newStatus };
    
    this.jobService.updateApplication(application.id!.toString(), applicationData).subscribe({
      next: () => {
        // Update local data
        const index = this.applications.findIndex(item => 
          item.application.id === application.id
        );
        if (index !== -1) {
          this.applications[index].application.status = newStatus;
          this.filterByStatus({ target: { value: this.selectedStatus } } as any);
        }
        console.log('Application status updated successfully');
      },
      error: (error) => {
        console.error('Error updating application status:', error);
        alert('Failed to update application status');
        // Reset the select to original value
        event.target.value = application.status;
      }
    });
  }

  editApplication(application: JobApplication): void {
    // Show confirmation modal first
    this.pendingEditApplication = application;
    this.showEditConfirmModal = true;
  }

  confirmEdit(): void {
    if (this.pendingEditApplication) {
      this.editingApplication = this.pendingEditApplication;
      this.editForm = {
        fullName: this.pendingEditApplication.fullName || '',
        email: this.pendingEditApplication.email || '',
        phone: this.pendingEditApplication.phone || '',
        coverLetter: this.pendingEditApplication.coverLetter || ''
      };
      this.showEditModal = true;
    }
    this.closeEditConfirmModal();
  }

  closeEditConfirmModal(): void {
    this.showEditConfirmModal = false;
    this.pendingEditApplication = null;
  }

  saveEditedApplication(): void {
    if (this.editingApplication) {
      const applicationData = {
        fullName: this.editForm.fullName,
        email: this.editForm.email,
        phone: this.editForm.phone,
        coverLetter: this.editForm.coverLetter
      };

      this.jobService.updateApplication(this.editingApplication.id!.toString(), applicationData).subscribe({
        next: () => {
          // Update local data
          const index = this.applications.findIndex(item => 
            item.application.id === this.editingApplication?.id
          );
          if (index !== -1) {
            this.applications[index].application = {
              ...this.applications[index].application,
              ...applicationData
            };
            this.filteredApplications = [...this.applications];
          }
          this.closeEditModal();
          alert('Application updated successfully');
        },
        error: (error) => {
          console.error('Error updating application:', error);
          alert('Failed to update application');
        }
      });
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingApplication = null;
  }

  canWithdraw(status: string): boolean {
    return ['Applied', 'Under Review', 'Interview'].includes(status);
  }

  canEdit(status: string): boolean {
    return ['Applied', 'Under Review'].includes(status);
  }

  getApplicationsByStatus(status: string): { application: JobApplication; job: Job }[] {
    return this.applications.filter(item => item.application.status === status);
  }

  getCompanyInitials(companyName: string): string {
    return companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Word count methods for cover letter
  updateCoverLetterCount(): void {
    // This method is called on input events to trigger change detection
  }

  getCoverLetterWordCount(): number {
    const coverLetter = this.editForm.coverLetter || '';
    if (!coverLetter.trim()) return 0;
    return coverLetter.trim().split(/\s+/).length;
  }

  getCoverLetterCharCount(): number {
    return (this.editForm.coverLetter || '').length;
  }

  viewApplicationDetails(application: JobApplication): void {
    this.selectedApplication = application;
    // Find the corresponding job
    const applicationItem = this.applications.find(item => item.application.id === application.id);
    this.selectedJob = applicationItem ? applicationItem.job : null;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedApplication = null;
    this.selectedJob = null;
  }

  private handleError(message: string): void {
    this.error = message;
    this.isLoading = false;
  }
}