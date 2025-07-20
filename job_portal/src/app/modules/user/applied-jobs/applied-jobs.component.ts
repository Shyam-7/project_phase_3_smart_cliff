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
        this.applications = data;
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

  viewJobDetails(jobId: number): void {
    this.router.navigate(['/user/job-details', jobId]);
  }

  withdrawApplication(applicationId: number): void {
    if (confirm('Are you sure you want to withdraw this application?')) {
      this.jobService.withdrawApplication(applicationId.toString()).subscribe({
        next: () => {
          this.loadApplications(); // Reload the applications
          alert('Application withdrawn successfully');
        },
        error: (error) => {
          console.error('Error withdrawing application:', error);
          alert('Failed to withdraw application');
        }
      });
    }
  }

  editApplication(application: JobApplication): void {
    this.editingApplication = application;
    this.editForm = {
      fullName: application.fullName || '',
      email: application.email || '',
      phone: application.phone || '',
      coverLetter: application.coverLetter || ''
    };
    this.showEditModal = true;
  }

  saveEditedApplication(): void {
    if (this.editingApplication) {
      const updatedApplication = {
        ...this.editingApplication,
        ...this.editForm
      };

      // Here you would call a service method to update the application
      // For now, we'll just update the local data
      const index = this.applications.findIndex(item => 
        item.application.id === this.editingApplication?.id
      );
      if (index !== -1) {
        this.applications[index].application = updatedApplication;
        this.filteredApplications = [...this.applications];
      }

      this.closeEditModal();
      alert('Application updated successfully');
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingApplication = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Applied': return 'status-applied';
      case 'Under Review': return 'status-review';
      case 'Interview': return 'status-interview';
      case 'Accepted': return 'status-accepted';
      case 'Rejected': return 'status-rejected';
      case 'Withdrawn': return 'status-withdrawn';
      default: return 'status-default';
    }
  }

  canWithdraw(status: string): boolean {
    return ['Applied', 'Under Review'].includes(status);
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

  private handleError(message: string): void {
    this.error = message;
    this.isLoading = false;
  }
}