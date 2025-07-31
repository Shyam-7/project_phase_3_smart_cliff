import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { CommunicationService } from '../../../../core/services/communication.service';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { UserService } from '../../../../core/services/user.service';
import { Subject, takeUntil, interval } from 'rxjs';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  // Dropdown states
  showNotifications = false;
  showProfile = false;
  showProfileModal = false;
  
  // Notifications
  notifications: Notification[] = [];
  unreadNotifications = 0;
  
  // Admin Profile
  adminProfile: any = null;
  isLoadingProfile = false;
  
  // UI states
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  get user() {
    return this.authService.getCurrentUser();
  }
  
  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
    this.setupNotificationPolling();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load notifications from the communication service
  loadNotifications() {
    this.isLoading = true;
    this.communicationService.getUserNotifications(1, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.notifications = response.notifications;
            this.unreadNotifications = response.unread || 0;
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading notifications:', error);
          this.isLoading = false;
        }
      });
  }

  // Setup polling for real-time notifications
  setupNotificationPolling() {
    interval(30000) // Poll every 30 seconds
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
      });
  }

  // Notification methods
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false;
  }

  markAsRead(notificationId: number) {
    this.communicationService.markNotificationAsRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Update local notification
            const notification = this.notifications.find((n: any) => n.id === notificationId);
            if (notification && !notification.is_read) {
              notification.is_read = true;
              this.unreadNotifications = Math.max(0, this.unreadNotifications - 1);
            }
          }
        },
        error: (error: any) => {
          console.error('Error marking notification as read:', error);
        }
      });
  }

  markAllAsRead() {
    this.communicationService.markAllNotificationsAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Update all notifications to read
            this.notifications.forEach((n: any) => n.is_read = true);
            this.unreadNotifications = 0;
          }
        },
        error: (error: any) => {
          console.error('Error marking all notifications as read:', error);
        }
      });
  }

  viewAllNotifications() {
    this.router.navigate(['/admin/communication']);
    this.closeAllDropdowns();
  }

  // Profile methods
  toggleProfile() {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
  }

  getInitials(): string {
    const user = this.user;
    if (user?.name) {
      return user.name.split(' ')
        .map((part: string) => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return 'AD';
  }

  // Create custom popup to view admin profile
  viewProfile() {
    this.showProfileModal = true;
    this.showProfile = false;
    // Load fresh admin data from database
    this.loadAdminProfile();
  }

  loadAdminProfile() {
    // This method will fetch fresh admin data from the database
    // to ensure profile is in sync with the DB
    this.isLoadingProfile = true;
    
    this.userService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.adminProfile = response.user;
          } else {
            console.error('Failed to load admin profile:', response.message);
            // Fallback to current user data
            this.adminProfile = this.authService.getCurrentUser();
          }
          this.isLoadingProfile = false;
        },
        error: (error: any) => {
          console.error('Error loading admin profile:', error);
          // Fallback to current user data
          this.adminProfile = this.authService.getCurrentUser();
          this.isLoadingProfile = false;
        }
      });
  }

  // Utility methods
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  }

  closeAllDropdowns() {
    this.showNotifications = false;
    this.showProfile = false;
    this.showProfileModal = false;
  }

  logout() {
    if (confirm('Are you sure you want to log out?')) {
      this.authService.logout();
    }
    this.closeAllDropdowns();
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const headerElement = target.closest('header');
    
    if (!headerElement) {
      this.closeAllDropdowns();
    }
  }

  // Keyboard navigation
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.closeAllDropdowns();
  }
}