// src/app/modules/user/user-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobSearchComponent } from './job-search/job-search.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { AppliedJobsComponent } from './applied-jobs/applied-jobs.component';

const routes: Routes = [
  { path: 'job-search', component: JobSearchComponent },
  { path: 'job-details/:id', component: JobDetailsComponent },
  { path: 'applied-jobs', component: AppliedJobsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }