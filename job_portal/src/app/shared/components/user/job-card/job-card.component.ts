// src/app/shared/components/user/job-card/job-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Job } from '../../../../core/models/job.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-card',
  imports: [CommonModule],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css']
})
export class JobCardComponent {
  @Input() job!: Job;
  @Input() isApplied: boolean = false; // New input to show if already applied
  @Output() apply = new EventEmitter<number>();

  constructor(private router: Router) { }

  navigateToJobDetails(): void {
    this.router.navigate(['user/job-details', this.job.id]);
  }

  saveJob(event: Event): void {
    event.stopPropagation();
    // Implement save job functionality
    console.log('Job saved:', this.job.id);
  }

  applyToJob(event: Event): void {
    event.stopPropagation();
    this.apply.emit(this.job.id);
  }

  onApply(event: Event): void {
    event.stopPropagation();
    this.apply.emit(this.job.id);
  }
}