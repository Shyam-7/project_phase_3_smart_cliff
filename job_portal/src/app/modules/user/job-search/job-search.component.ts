import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { Job } from '../../../core/models/job.model';
import { JobCardComponent } from "../../../shared/components/user/job-card/job-card.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserFooterComponent } from "../../../shared/components/user/user-footer/user-footer.component";
import { HeaderComponent } from "../../../shared/components/user/header/header.component";

@Component({
  selector: 'app-job-search',

  templateUrl: './job-search.component.html',
  styleUrls: ['./job-search.component.css'],
  imports: [JobCardComponent, CommonModule, FormsModule, ReactiveFormsModule, UserFooterComponent, HeaderComponent]
})
export class JobSearchComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  searchQuery = '';
  locationQuery = '';
  sortOption = 'relevance';
  originalOrderJobs: Job[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  // Filter options
  experienceOptions = ["0-1 year", "1-2 years", "2-5 years", "5-10 years", "10+ years"];
  locationOptions = ["Bengaluru", "Delhi/NCR", "Mumbai", "Hyderabad", "Pune", "Chennai", "Remote"];
  salaryOptions = ["0-3 LPA", "3-6 LPA", "6-10 LPA", "10-15 LPA", "15-25 LPA", "25+ LPA"];
  companyTypeOptions = ["Startup", "MNC", "Corporate", "Government", "Non-Profit"];

  // Selected filters
  selectedExperience: { [key: string]: boolean } = {};
  selectedLocations: { [key: string]: boolean } = {};
  selectedSalaries: { [key: string]: boolean } = {};
  selectedCompanyTypes: { [key: string]: boolean } = {};

  constructor(
    private jobService: JobService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    // Initialize all filters to false
    this.experienceOptions.forEach(opt => this.selectedExperience[opt] = false);
    this.locationOptions.forEach(opt => this.selectedLocations[opt] = false);
    this.salaryOptions.forEach(opt => this.selectedSalaries[opt] = false);
    this.companyTypeOptions.forEach(opt => this.selectedCompanyTypes[opt] = false);

    // Load jobs first
    this.loadJobs();

    // Then handle query parameters
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.locationQuery = params['l'] || '';
      this.applyFilters();
    });
  }

  loadJobs(): void {
    this.isLoading = true;
    this.error = null;

    // Build filter parameters
    const params: any = {};
    
    // Add search query
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery.trim();
    }
    
    // Add location filter
    if (this.locationQuery.trim()) {
      params.location = this.locationQuery.trim();
    }
    
    // Add checkbox filters
    const activeExpFilters = Object.keys(this.selectedExperience).filter(k => this.selectedExperience[k]);
    if (activeExpFilters.length > 0) {
      params.experience = activeExpFilters[0]; // For simplicity, use first selected
    }
    
    const activeLocationFilters = Object.keys(this.selectedLocations).filter(k => this.selectedLocations[k]);
    if (activeLocationFilters.length > 0) {
      params.location = activeLocationFilters[0];
    }
    
    const activeSalaryFilters = Object.keys(this.selectedSalaries).filter(k => this.selectedSalaries[k]);
    if (activeSalaryFilters.length > 0) {
      // Parse salary range (e.g., "3-6 LPA" -> min: 3, max: 6)
      const salaryRange = activeSalaryFilters[0];
      if (salaryRange.includes('-')) {
        const [min, max] = salaryRange.split('-').map(s => parseInt(s.trim()));
        params.salary_min = min;
        params.salary_max = max;
      }
    }
    
    const activeCompanyTypeFilters = Object.keys(this.selectedCompanyTypes).filter(k => this.selectedCompanyTypes[k]);
    if (activeCompanyTypeFilters.length > 0) {
      params.company_type = activeCompanyTypeFilters[0];
    }
    
    // Add sorting
    params.sort_by = this.getSortField();
    params.sort_order = this.getSortOrder();

    this.jobService.getJobsWithFilters(params).subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.originalOrderJobs = [...jobs];
        this.filteredJobs = [...jobs];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.error = 'Failed to load jobs. Please try again later.';
        this.isLoading = false;
        this.jobs = [];
        this.filteredJobs = [];
      }
    });
  }

  private getSortField(): string {
    switch (this.sortOption) {
      case 'date': return 'created_at';
      case 'salary': return 'salary_max';
      case 'company': return 'company_name';
      case 'title': return 'title';
      default: return 'created_at';
    }
  }

  private getSortOrder(): string {
    return this.sortOption === 'salary' ? 'DESC' : 'DESC'; // Most recent first by default
  }

  applyFilters(): void {
    if (this.jobs.length === 0) return;

    // First apply checkbox filters
    let filtered = [...this.jobs];

    // Experience filter
    const activeExpFilters = Object.keys(this.selectedExperience).filter(k => this.selectedExperience[k]);
    if (activeExpFilters.length > 0) {
      filtered = filtered.filter(job =>
        activeExpFilters.some(exp => this.matchExperience(job.experience, exp)))
    }

    // Location filter
    const activeLocFilters = Object.keys(this.selectedLocations).filter(k => this.selectedLocations[k]);
    if (activeLocFilters.length > 0) {
      filtered = filtered.filter(job =>
        activeLocFilters.some(loc => job.location.includes(loc)))
    }

    // Salary filter
    const activeSalFilters = Object.keys(this.selectedSalaries).filter(k => this.selectedSalaries[k]);
    if (activeSalFilters.length > 0) {
      filtered = filtered.filter(job =>
        activeSalFilters.some(sal => this.matchSalary(job.salary, sal)))
    }

    // Company type filter
    const activeCompFilters = Object.keys(this.selectedCompanyTypes).filter(k => this.selectedCompanyTypes[k]);
    if (activeCompFilters.length > 0) {
      filtered = filtered.filter(job =>
        activeCompFilters.some(comp => job.companyType === comp))
    }

    // Then apply search queries
    if (this.searchQuery || this.locationQuery) {
      filtered = filtered.filter(job => {
        const matchesSearch = this.searchQuery
          ? job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (job.tags && job.tags.some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase())))
          : true;

        const matchesLocation = this.locationQuery
          ? job.location.toLowerCase().includes(this.locationQuery.toLowerCase())
          : true;

        return matchesSearch && matchesLocation;
      });
    }

    this.filteredJobs = filtered;
    this.sortJobs();
  }

  private matchExperience(jobExp: string, filterExp: string): boolean {
    if (!jobExp) return false;

    const jobYears = this.parseExperience(jobExp);
    const filterRange = this.parseExperience(filterExp);

    // Check if job experience falls within filter range
    return (jobYears.min >= filterRange.min && jobYears.min <= filterRange.max) ||
      (jobYears.max >= filterRange.min && jobYears.max <= filterRange.max) ||
      (jobYears.min <= filterRange.min && jobYears.max >= filterRange.max);
  }

  private parseExperience(exp: string): { min: number, max: number } {
    exp = exp.toLowerCase().trim();

    // Handle ranges like "2-5 years"
    const rangeMatch = exp.match(/^(\d+)\s*-\s*(\d+)\s*years?$/);
    if (rangeMatch) {
      return {
        min: parseInt(rangeMatch[1], 10),
        max: parseInt(rangeMatch[2], 10)
      };
    }

    // Handle "X+ years"
    const plusMatch = exp.match(/^(\d+)\s*\+\s*years?$/);
    if (plusMatch) {
      return {
        min: parseInt(plusMatch[1], 10),
        max: Infinity
      };
    }

    // Handle single year "X years"
    const singleMatch = exp.match(/^(\d+)\s*years?$/);
    if (singleMatch) {
      const years = parseInt(singleMatch[1], 10);
      return {
        min: years,
        max: years
      };
    }

    // Handle "fresher" or "entry level"
    if (exp.includes('fresher') || exp.includes('entry')) {
      return {
        min: 0,
        max: 1
      };
    }

    // Default fallback for unknown formats
    return {
      min: 0,
      max: Infinity
    };
  }

  private matchSalary(jobSalary: number | undefined, salaryRange: string): boolean {
    if (jobSalary === undefined || jobSalary === null) return false;

    // Handle "X+ LPA" format
    if (salaryRange.endsWith('+ LPA')) {
      const min = parseFloat(salaryRange.split('+')[0]);
      return jobSalary >= min;
    }

    // Handle "X-Y LPA" format
    const rangeParts = salaryRange.split('-');
    if (rangeParts.length === 2) {
      const min = parseFloat(rangeParts[0]);
      const max = parseFloat(rangeParts[1]);
      return jobSalary >= min && jobSalary <= max;
    }

    return false;
  }

  clearFilters(): void {
    // Reset all filters
    this.experienceOptions.forEach(opt => this.selectedExperience[opt] = false);
    this.locationOptions.forEach(opt => this.selectedLocations[opt] = false);
    this.salaryOptions.forEach(opt => this.selectedSalaries[opt] = false);
    this.companyTypeOptions.forEach(opt => this.selectedCompanyTypes[opt] = false);

    // Reset search queries
    this.searchQuery = '';
    this.locationQuery = '';

    // Apply changes
    this.applyFilters();
  }

  onSearch(): void {
    this.loadJobs(); // Reload jobs with search query
  }

  onFilterChange(): void {
    this.loadJobs(); // Reload jobs with new filters
  }

  onSortChange(): void {
    this.loadJobs(); // Reload jobs with new sorting
  }

  sortJobs(): void {
    // Sorting is now handled by the backend
    // This method kept for compatibility but does nothing
  }
}