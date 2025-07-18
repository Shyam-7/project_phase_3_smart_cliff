import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../core/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  user$!: Observable<User | null>;
  isDropdownOpen = false;
  showLogoutModal = false;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.currentUser$;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  showLogoutConfirmation() {
    this.closeDropdown();
    this.showLogoutModal = true;
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    this.authService.logout();
  }

  logout() {
    this.closeDropdown();
    this.authService.logout();
  }
}
