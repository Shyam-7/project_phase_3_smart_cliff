// src/app/shared/components/user/job-card/job-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Job } from '../../../../core/models/job.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../../../pipes/time-ago.pipe';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-job-card',
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css']
})
export class JobCardComponent {
  @Input() job!: Job;

  constructor(private router: Router, public authService: AuthService) { }

  navigateToJobDetails(): void {
    // Navigate to public job details for non-authenticated users, authenticated route for logged-in users
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['user/job-details', this.job.id]);
    } else {
      this.router.navigate(['public/job-details', this.job.id]);
    }
  }

  saveJob(event: Event): void {
    event.stopPropagation();
    // Check if user is logged in before saving
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    // Implement save job functionality
    console.log('Job saved:', this.job.id);
  }

  loginToSave(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/auth/login']);
  }

  getDescriptionText(description: any): string {
    if (!description) return '';
    if (typeof description === 'string') {
      return description.length > 150 ? description.substring(0, 150) + '...' : description;
    }
    if (typeof description === 'object' && description.overview) {
      return description.overview.length > 150 ? description.overview.substring(0, 150) + '...' : description.overview;
    }
    return '';
  }
}