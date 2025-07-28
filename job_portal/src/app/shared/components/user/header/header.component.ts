import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../../core/auth/auth.service';
import { CommunicationService, Notification } from '../../../../core/services/communication.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user$!: Observable<User | null>;
  isDropdownOpen = false;
  showLogoutModal = false;
  isNotificationDropdownOpen = false;
  showNotificationModal = false;
  
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoadingNotifications = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService
  ) {
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Subscribe to unread count
    const unreadSub = this.communicationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.push(unreadSub);

    // Subscribe to user changes to load notifications
    const userSub = this.user$.subscribe(user => {
      if (user) {
        this.loadNotifications();
      }
    });
    this.subscriptions.push(userSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications(): void {
    this.isLoadingNotifications = true;
    this.communicationService.getUserNotifications(1, 10).subscribe(response => {
      this.isLoadingNotifications = false;
      if (response.success) {
        this.notifications = response.notifications;
        this.unreadCount = response.unread;
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.isNotificationDropdownOpen = false; // Close notification dropdown
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  toggleNotificationDropdown() {
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    this.isDropdownOpen = false; // Close user dropdown
    
    if (this.isNotificationDropdownOpen) {
      this.loadNotifications();
    }
  }

  closeNotificationDropdown() {
    this.isNotificationDropdownOpen = false;
  }

  showAllNotifications() {
    this.showNotificationModal = true;
    this.closeNotificationDropdown();
    this.loadNotifications();
  }

  closeNotificationModal() {
    this.showNotificationModal = false;
  }

  markAsRead(notification: Notification) {
    if (!notification.is_read) {
      this.communicationService.markNotificationAsRead(notification.id).subscribe(response => {
        if (response.success) {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.communicationService.loadUnreadCount();
        }
      });
    }
  }

  markAllAsRead() {
    this.communicationService.markAllNotificationsAsRead().subscribe(response => {
      if (response.success) {
        this.notifications.forEach(notification => {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
        });
        this.unreadCount = 0;
      }
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low':
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'announcement':
        return 'fas fa-bullhorn';
      case 'job_alert':
        return 'fas fa-briefcase';
      case 'application_update':
        return 'fas fa-file-alt';
      case 'system':
        return 'fas fa-cog';
      default:
        return 'fas fa-bell';
    }
  }

  formatNotificationTime(timestamp: string): string {
    return this.communicationService.formatNotificationTime(timestamp);
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
