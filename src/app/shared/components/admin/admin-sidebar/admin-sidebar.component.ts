import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {
  showLogoutModal = false; // Modal visibility

  constructor(private authService: AuthService) {}

  logout() {
    this.showLogoutModal = true; // Show the modal
  }

  confirmLogout() {
    this.showLogoutModal = false; // Close the modal
    this.authService.logout();    // Perform logout
  }
}
