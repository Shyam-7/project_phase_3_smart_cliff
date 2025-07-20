import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Job } from '../../../core/models/job.model';
import { JobApplication } from '../../../core/models/job-application.model';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-job-application-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-application-modal.component.html',
  styleUrls: ['./job-application-modal.component.css']
})
export class JobApplicationModalComponent implements OnInit {
  @Input() job!: Job;
  @Output() closeModal = new EventEmitter<void>();
  @Output() applicationSubmitted = new EventEmitter<JobApplication>();

  applicationMode: 'quick' | 'custom' | null = null;
  isSubmitting = false;
  error: string | null = null;
  userProfile: any = null;

  customApplicationData = {
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null
  };

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      this.userProfile = await firstValueFrom(this.userService.getUserProfile());
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.customApplicationData.resume = input.files[0];
    }
  }

  validateCustomForm(): boolean {
    const { fullName, email, phone, coverLetter, resume } = this.customApplicationData;
    
    if (!fullName?.trim()) {
      this.error = 'Full name is required';
      return false;
    }
    
    if (!email?.trim()) {
      this.error = 'Email is required';
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.error = 'Please enter a valid email address';
      return false;
    }
    
    if (!phone?.trim()) {
      this.error = 'Phone number is required';
      return false;
    }
    
    if (!coverLetter?.trim()) {
      this.error = 'Cover letter is required';
      return false;
    }
    
    if (!resume) {
      this.error = 'Resume upload is required';
      return false;
    }
    
    return true;
  }

  async submit() {
    this.isSubmitting = true;
    this.error = null;
    
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.error = 'You must be logged in to apply';
      this.isSubmitting = false;
      return;
    }

    try {
      let application: JobApplication;

      if (this.applicationMode === 'quick') {
        // Use existing user profile for quick apply
        application = {
          jobId: this.job.id,
          userId: user.id,
          applicationDate: new Date().toISOString(),
          status: 'Applied',
          fullName: this.userProfile?.fullName || user.fullName || user.email,
          email: this.userProfile?.email || user.email,
          phone: this.userProfile?.phone || '',
          coverLetter: `I am interested in applying for the ${this.job.title} position at ${this.job.company}. Please consider my application.`,
          resumePath: this.userProfile?.resumePath || null,
          quickApply: true
        };
      } else {
        // Validate custom form
        if (!this.validateCustomForm()) {
          this.isSubmitting = false;
          return;
        }
        
        application = {
          jobId: this.job.id,
          userId: user.id,
          applicationDate: new Date().toISOString(),
          status: 'Applied',
          fullName: this.customApplicationData.fullName,
          email: this.customApplicationData.email,
          phone: this.customApplicationData.phone,
          coverLetter: this.customApplicationData.coverLetter,
          resumePath: this.customApplicationData.resume?.name || 'uploaded-resume.pdf',
          quickApply: false
        };
      }

      const result = await firstValueFrom(this.jobService.applyToJob(application));
      this.applicationSubmitted.emit(result);
      this.closeModal.emit();
    } catch (error) {
      this.error = 'Failed to submit application. Please try again.';
      console.error(error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
