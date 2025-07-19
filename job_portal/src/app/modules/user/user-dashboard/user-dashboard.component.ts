import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from "../../../shared/shared.module";


@Component({
  selector: 'app-user-dashboard',
  imports: [ReactiveFormsModule, SharedModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  searchForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      query: [''],
      location: ['']
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