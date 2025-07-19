import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UserRoutingModule } from './user-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { JobSearchComponent } from './job-search/job-search.component';
import { JobDetailsComponent } from './job-details/job-details.component';
@NgModule({
  declarations: [],
  imports: [
    JobSearchComponent,
    JobDetailsComponent,
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    UserDashboardComponent
  ],
  exports: [
    UserDashboardComponent,
    JobSearchComponent,
    JobDetailsComponent
  ]
})
export class UserModule { }
  