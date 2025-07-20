import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Job } from '../../../core/models/job.model';
import { JobApplication } from '../../../core/models/job-application.model';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-job-application-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-application-modal.component.html',
  styleUrls: ['./job-application-modal.component.css']
})
export class JobApplicationModalComponent {
  @Input() job!: Job;
  @Output() closeModal = new EventEmitter<void>();
  @Output() applicationSubmitted = new EventEmitter<JobApplication>();

  applicationMode: 'quick' | 'custom' | null = null;
  isSubmitting = false;
  error: string | null = null;

  customApplicationData = {
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null
  };

  constructor(
    private jobService: JobService,
    private authService: AuthService
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.customApplicationData.resume = input.files[0];
    }
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
        application = {
          jobId: this.job.id,
          userId: user.id,
          applicationDate: new Date().toISOString(),
          status: 'Applied',
          quickApply: true
        };
      } else {
        let resumePath = '';
        if (this.customApplicationData.resume) {
          const uploadResult = await this.jobService.uploadResume(this.customApplicationData.resume);
          resumePath = uploadResult && uploadResult.path ? uploadResult.path : '';
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
          resumePath,
          quickApply: false
        };
      }

      const result = await this.jobService.applyToJob(application).toPromise();
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
