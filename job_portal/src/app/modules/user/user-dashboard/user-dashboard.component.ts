import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../../../shared/shared.module";
import { ContentService, UserDashboardContent } from '../../../core/services/content.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  searchForm: FormGroup;
  dashboardContent: UserDashboardContent | null = null;
  isLoading = true;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private contentService: ContentService
  ) {
    this.searchForm = this.fb.group({
      query: [''],
      location: ['']
    });
  }

  ngOnInit(): void {
    this.loadDashboardContent();
  }

  loadDashboardContent(): void {
    this.contentService.getUserDashboardContent().subscribe({
      next: (content) => {
        this.dashboardContent = content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard content:', error);
        this.isLoading = false;
        // Fallback content will be set by the service
        this.contentService.dashboardContent$.subscribe(content => {
          this.dashboardContent = content;
        });
      }
    });
  }

  onSearch() {
    const { query, location } = this.searchForm.value;
    this.router.navigate(['/user/job-search'], {
      queryParams: { 
        q: query || null, 
        l: location || null 
      },
      queryParamsHandling: 'merge'
    });
  }
}