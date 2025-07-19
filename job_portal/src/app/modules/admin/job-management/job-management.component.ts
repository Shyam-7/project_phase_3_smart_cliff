import { Component } from '@angular/core';
import { JobService } from '../../../core/services/job.service';
import { Job } from '../../../core/models/job.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css']
})
export class JobManagementComponent {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  selectedJob: Job | null = null;
  isEditing = false;
  searchQuery = '';
  tagsInput = '';
  isSaving = false;

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getJobs().subscribe(jobs => {
      this.jobs = jobs;
      this.filteredJobs = [...jobs];
    });
  }

  filterJobs(): void {
    if (!this.searchQuery) {
      this.filteredJobs = [...this.jobs];
      return;
    }
    const query = this.searchQuery.toLowerCase();
    this.filteredJobs = this.jobs.filter(job => 
      job.title.toLowerCase().includes(query) || 
      job.company.toLowerCase().includes(query) ||
      (job.tags && job.tags.some(tag => tag.toLowerCase().includes(query))))
  }

  editJob(job: Job): void {
    this.selectedJob = { ...job };
    this.tagsInput = this.selectedJob.tags?.join(', ') || '';
    this.isEditing = true;
  }

  deleteJob(id: number): void {
    if (confirm('Are you sure you want to delete this job?')) {
      this.jobService.deleteJob(id).subscribe({
        next: () => {
          this.jobs = this.jobs.filter(job => job.id !== id);
          this.filteredJobs = this.filteredJobs.filter(job => job.id !== id);
        },
        error: (err) => {
          console.error('Error deleting job:', err);
          alert('Failed to delete job. Please try again.');
        }
      });
    }
  }

  saveJob(): void {
    if (!this.selectedJob) return;
    
    // Basic validation
    if (!this.selectedJob.title || !this.selectedJob.company) {
      alert('Title and Company are required fields');
      return;
    }

    if (this.isSaving) return;
    this.isSaving = true;

    // Convert tags input back to array
    this.selectedJob.tags = this.tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    const operation = this.isEditing 
      ? this.jobService.updateJob(this.selectedJob)
      : this.jobService.addJob(this.selectedJob);

    operation.subscribe({
      next: (savedJob) => {
        if (this.isEditing) {
          this.jobs = this.jobs.map(job => 
            job.id === savedJob.id ? savedJob : job
          );
        } else {
          this.jobs.unshift(savedJob);
        }
        this.filteredJobs = [...this.jobs];
        this.cancelEdit();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving job:', err);
        this.isSaving = false;
        alert('Failed to save job. Please try again.');
      }
    });
  }

  cancelEdit(): void {
    this.selectedJob = null;
    this.tagsInput = '';
    this.isEditing = false;
  }

  addNewJob(): void {
    this.selectedJob = {
      id: 0, // Will be assigned by server
      title: '',
      company: '',
      rating: 0,
      reviews: 0,
      location: '',
      experience: '',
      salary: 0,
      postedDate: new Date().toISOString(),
      summary: '',
      companyType: '',
      tags: [],
      posted: 'Just now',
      logo: null,
      logoText: '',
      color: 'bg-gray-500',
      description: {
        overview: '',
        responsibilities: [],
        qualifications: [],
        meta: {
          role: '',
          industry: '',
          department: '',
          employment: '',
          category: '',
          education: {
            UG: '',
            PG: ''
          }
        },
        skills: []
      }
    };
    this.tagsInput = '';
    this.isEditing = false;
  }
}