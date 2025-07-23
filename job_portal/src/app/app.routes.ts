import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/auth/role.guard';

import { AdminLayoutComponent } from './shared/layouts/admin-layout/admin-layout.component';
import { UserLayoutComponent } from './shared/layouts/user-layout/user-layout.component';

import { AppliedJobsComponent } from './modules/user/applied-jobs/applied-jobs.component';
import { JobDetailsComponent } from './modules/user/job-details/job-details.component';
import { JobSearchComponent } from './modules/user/job-search/job-search.component';
import { SavedJobsComponent } from './modules/user/saved-jobs/saved-jobs.component';

import { AnalyticsComponent } from './modules/admin/analytics/analytics.component';
import { AdminDashboardComponent } from './modules/admin/admin-dashboard/admin-dashboard.component';
import { CommunicationComponent } from './modules/admin/communication/communication.component';
import { ContentManagementComponent } from './modules/admin/content-management/content-management.component';
import { UserManagementComponent } from './modules/admin/user-management/user-management.component';
import { JobManagementComponent } from './modules/admin/job-management/job-management.component';

import { UserProfileComponent } from './modules/user/user-profile/user-profile.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { SignupComponent } from './modules/auth/signup/signup.component';
import { ForgotPasswordComponent } from './modules/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { UserDashboardComponent } from './modules/user/user-dashboard/user-dashboard.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,

    //temp disabled for testing
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'communication', component: CommunicationComponent },
      { path: 'content-management', component: ContentManagementComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'job-management', component: JobManagementComponent }
    ]
  },
  {
    path: 'user',
    component: UserLayoutComponent,
    //temp disabled for testing
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'job_seeker' }, // Changed from 'user' to 'job_seeker'
    children: [
      { path: 'user-dashboard', component: UserDashboardComponent },
      { path: 'applied-jobs', component: AppliedJobsComponent },
      { path: 'job-details/:id', component: JobDetailsComponent },
      { path: 'job-search', component: JobSearchComponent },
      { path: 'saved-jobs', component: SavedJobsComponent },
      { path: 'user-profile', component: UserProfileComponent },
      { path: '', redirectTo: 'user-dashboard', pathMatch: 'full' } // Fixed redirect
    ]
  },
  
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];