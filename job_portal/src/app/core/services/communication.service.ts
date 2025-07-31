import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Announcement {
  id?: number;
  title: string;
  message: string;
  type: 'general' | 'maintenance' | 'feature' | 'urgent';
  target_audience: 'all' | 'job-seekers' | 'employers' | 'premium';
  send_methods: {
    email: boolean;
    in_app: boolean;
    push: boolean;
  };
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'announcement' | 'job_alert' | 'application_update' | 'system' | 'custom';
  announcement_id?: number;
  is_read: boolean;
  read_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id?: number;
  user_id: number;
  email_announcements: boolean;
  email_job_alerts: boolean;
  email_application_updates: boolean;
  in_app_announcements: boolean;
  in_app_job_alerts: boolean;
  in_app_application_updates: boolean;
  push_announcements: boolean;
  push_job_alerts: boolean;
  push_application_updates: boolean;
}

export interface AnnouncementStats {
  total_announcements: number;
  sent_announcements: number;
  scheduled_announcements: number;
  draft_announcements: number;
  active_notifications: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private baseUrl = 'http://localhost:3001/api/communication';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Admin - Announcement Management
  createAnnouncement(announcement: Partial<Announcement>): Observable<any> {
    return this.http.post(`${this.baseUrl}/announcements`, announcement, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating announcement:', error);
        return of({ success: false, message: 'Failed to create announcement' });
      })
    );
  }

  getAnnouncements(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/announcements?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching announcements:', error);
        return of({ success: false, announcements: [], total: 0 });
      })
    );
  }

  getAnnouncementStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/announcements/stats`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching announcement stats:', error);
        return of({ 
          success: false, 
          stats: {
            total_announcements: 0,
            sent_announcements: 0,
            scheduled_announcements: 0,
            draft_announcements: 0,
            active_notifications: 0
          }
        });
      })
    );
  }

  // User - Notification Management
  getUserNotifications(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        if (response.success) {
          this.unreadCountSubject.next(response.unread);
        }
        return response;
      }),
      catchError(error => {
        console.error('Error fetching notifications:', error);
        return of({ success: false, notifications: [], total: 0, unread: 0 });
      })
    );
  }

  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/${notificationId}/read`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        if (response.success) {
          this.loadUnreadCount();
        }
        return response;
      }),
      catchError(error => {
        console.error('Error marking notification as read:', error);
        return of({ success: false, message: 'Failed to mark notification as read' });
      })
    );
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/read-all`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response: any) => {
        if (response.success) {
          this.unreadCountSubject.next(0);
        }
        return response;
      }),
      catchError(error => {
        console.error('Error marking all notifications as read:', error);
        return of({ success: false, message: 'Failed to mark all notifications as read' });
      })
    );
  }

  // Load unread count
  loadUnreadCount(): void {
    this.getUserNotifications(1, 1).subscribe(response => {
      if (response.success) {
        this.unreadCountSubject.next(response.unread);
      }
    });
  }

  // Notification Preferences
  getNotificationPreferences(): Observable<any> {
    return this.http.get(`${this.baseUrl}/preferences`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching notification preferences:', error);
        return of({ success: false, preferences: null });
      })
    );
  }

  updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Observable<any> {
    return this.http.put(`${this.baseUrl}/preferences`, preferences, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating notification preferences:', error);
        return of({ success: false, message: 'Failed to update preferences' });
      })
    );
  }

  // Admin - Send Custom Notification
  sendCustomNotification(notification: {
    user_id: number;
    title: string;
    message: string;
    type?: string;
    priority?: string;
    action_url?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/send`, notification, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error sending custom notification:', error);
        return of({ success: false, message: 'Failed to send notification' });
      })
    );
  }

  // Utility method to format notification time
  formatNotificationTime(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now.getTime() - notificationTime.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  }

  // Get scheduled announcements
  getScheduledAnnouncements(): Observable<any> {
    return this.http.get(`${this.baseUrl}/announcements/scheduled`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching scheduled announcements:', error);
        return of({ success: false, message: 'Failed to fetch scheduled announcements', announcements: [] });
      })
    );
  }

  // Get draft announcements
  getDraftAnnouncements(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/announcements/drafts?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching draft announcements:', error);
        return of({ success: false, announcements: [], total: 0 });
      })
    );
  }

  // Update announcement
  updateAnnouncement(id: number, announcement: Partial<Announcement>): Observable<any> {
    return this.http.put(`${this.baseUrl}/announcements/${id}`, announcement, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating announcement:', error);
        return of({ success: false, message: 'Failed to update announcement' });
      })
    );
  }

  // Cancel scheduled announcement
  cancelScheduledAnnouncement(announcementId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/announcements/${announcementId}/cancel`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error cancelling scheduled announcement:', error);
        return of({ success: false, message: 'Failed to cancel scheduled announcement' });
      })
    );
  }
}
