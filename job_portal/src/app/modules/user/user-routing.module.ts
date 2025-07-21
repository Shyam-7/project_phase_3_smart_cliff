// src/app/modules/user/user-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobSearchComponent } from './job-search/job-search.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { AppliedJobsComponent } from './applied-jobs/applied-jobs.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SavedJobsComponent } from './saved-jobs/saved-jobs.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'user-dashboard', pathMatch: 'full' },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'job-search', component: JobSearchComponent },
  { path: 'job-details/:id', component: JobDetailsComponent },
  { path: 'applied-jobs', component: AppliedJobsComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'saved-jobs', component: SavedJobsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }