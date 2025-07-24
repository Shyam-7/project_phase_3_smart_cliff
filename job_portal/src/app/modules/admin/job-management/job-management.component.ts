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
      job.title?.toLowerCase().includes(query) || 
      (job.company || job.company_name || '')?.toLowerCase().includes(query) ||
      (job.tags && job.tags.some(tag => tag.toLowerCase().includes(query))))
  }

  editJob(job: Job): void {
    this.selectedJob = { ...job };
    
    // Ensure backward compatibility for company field
    if (job.company && !this.selectedJob.company_name) {
      this.selectedJob.company_name = job.company;
    }
    if (job.company_name && !this.selectedJob.company) {
      this.selectedJob.company = job.company_name;
    }
    
    // Handle tags for display
    this.tagsInput = this.selectedJob.tags?.join(', ') || '';
    
    // Convert date format if needed
    if (this.selectedJob.expires_at) {
      const date = new Date(this.selectedJob.expires_at);
      if (!isNaN(date.getTime())) {
        this.selectedJob.expires_at = date.toISOString().split('T')[0];
      }
    }
    
    this.isEditing = true;
  }

  deleteJob(id: string): void {
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
    if (!this.selectedJob.title || (!this.selectedJob.company_name && !this.selectedJob.company) || !this.selectedJob.location) {
      alert('Title, Company Name, and Location are required fields');
      return;
    }

    if (this.isSaving) return;
    this.isSaving = true;

    // Ensure company_name is set for backend compatibility
    if (!this.selectedJob.company_name && this.selectedJob.company) {
      this.selectedJob.company_name = this.selectedJob.company;
    }

    // Convert tags input back to array for backward compatibility
    if (this.tagsInput) {
      this.selectedJob.tags = this.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    }

    // Ensure salary ranges are properly set
    if (this.selectedJob.salary_min && this.selectedJob.salary_max) {
      if (this.selectedJob.salary_min > this.selectedJob.salary_max) {
        alert('Minimum salary cannot be greater than maximum salary');
        this.isSaving = false;
        return;
      }
    }

    const operation = this.isEditing 
      ? this.jobService.updateJob(this.selectedJob)
      : this.jobService.addJob(this.selectedJob);

    operation.subscribe({
      next: (response) => {
        // Extract the job from the response (backend returns { message: '...', job: {...} })
        const savedJob = response.job || response;
        
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
      id: '', // Will be assigned by server
      title: '',
      company_name: '',
      company: '', // For backward compatibility
      location: '',
      employment_type: 'Full-time',
      experience_level: '',
      category: '',
      status: 'active',
      description: '',
      requirements: '',
      skills_required: '',
      benefits: '',
      company_type: 'Corporate',
      company_size: '',
      company_rating: 0,
      company_reviews_count: 0,
      salary_min: 0,
      salary_max: 0,
      salary_currency: 'INR',
      remote_allowed: false,
      expires_at: '',
      summary: '',
      // Legacy fields for backward compatibility
      rating: 0,
      reviews: 0,
      salary: 0,
      postedDate: new Date().toISOString(),
      companyType: 'Corporate',
      tags: [],
      posted: 'Just now',
      logo: null,
      logoText: '',
      color: 'bg-gray-500',
      views: 0
    };
    this.tagsInput = '';
    this.isEditing = false;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  }
}