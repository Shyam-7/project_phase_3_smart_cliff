import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';

import { JobCardComponent } from './components/user/job-card/job-card.component';
import { JobDetailsComponent } from '../modules/user/job-details/job-details.component';
import { HeaderComponent } from './components/user/header/header.component';
import { UserFooterComponent } from './components/user/user-footer/user-footer.component';

@NgModule({
  declarations: [

  ],
  imports: [
    HeaderComponent,
    UserFooterComponent,
    JobCardComponent,
    JobDetailsComponent,
    CommonModule,
    AdminLayoutComponent,
    RouterModule,
    UserLayoutComponent

  ],
  exports: [
    HeaderComponent,
    JobDetailsComponent,
    UserFooterComponent,
    JobCardComponent,
    CommonModule,
    AdminLayoutComponent,
    RouterModule,
    UserLayoutComponent
  ],
})
export class SharedModule { }
