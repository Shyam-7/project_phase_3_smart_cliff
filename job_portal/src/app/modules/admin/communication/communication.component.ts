import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommunicationService, Announcement, AnnouncementStats } from '../../../core/services/communication.service';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.css'
})
export class CommunicationComponent implements OnInit {
  announcementForm: FormGroup;
  announcements: Announcement[] = [];
  stats: AnnouncementStats = {
    total_announcements: 0,
    sent_announcements: 0,
    scheduled_announcements: 0,
    draft_announcements: 0,
    active_notifications: 0
  };
  
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;
  successMessage: string | null = null;
  showAnnouncementHistory = false;

  constructor(
    private fb: FormBuilder,
    private communicationService: CommunicationService
  ) {
    this.announcementForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      message: ['', [Validators.required]],
      type: ['general', [Validators.required]],
      target_audience: ['all', [Validators.required]],
      send_methods: this.fb.group({
        email: [false],
        in_app: [true],
        push: [false]
      }),
      scheduled_at: [''],
      schedule_time: ['']
    });
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadAnnouncements();
  }

  loadStats(): void {
    this.communicationService.getAnnouncementStats().subscribe(response => {
      if (response.success) {
        this.stats = response.stats;
      }
    });
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.communicationService.getAnnouncements(1, 10).subscribe(response => {
      this.isLoading = false;
      if (response.success) {
        this.announcements = response.announcements;
      }
    });
  }

  onSubmit(): void {
    if (this.announcementForm.valid) {
      this.isSubmitting = true;
      this.error = null;
      this.successMessage = null;

      const formValue = this.announcementForm.value;
      let scheduledAt = null;

      // Combine date and time if scheduling
      if (formValue.scheduled_at && formValue.schedule_time) {
        scheduledAt = `${formValue.scheduled_at}T${formValue.schedule_time}:00`;
      }

      const announcementData: Partial<Announcement> = {
        title: formValue.title,
        message: formValue.message,
        type: formValue.type,
        target_audience: formValue.target_audience,
        send_methods: formValue.send_methods,
        ...(scheduledAt && { scheduled_at: scheduledAt })
      };

      this.communicationService.createAnnouncement(announcementData).subscribe(response => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = scheduledAt ? 'Announcement scheduled successfully!' : 'Announcement sent successfully!';
          this.announcementForm.reset();
          this.announcementForm.patchValue({
            type: 'general',
            target_audience: 'all',
            send_methods: {
              email: false,
              in_app: true,
              push: false
            }
          });
          this.loadStats();
          this.loadAnnouncements();
        } else {
          this.error = response.message || 'Failed to create announcement';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  saveDraft(): void {
    if (this.announcementForm.get('title')?.value && this.announcementForm.get('message')?.value) {
      // For draft, we'll just save the announcement without scheduling or sending
      this.isSubmitting = true;
      this.error = null;

      const formValue = this.announcementForm.value;
      const announcementData: Partial<Announcement> = {
        title: formValue.title,
        message: formValue.message,
        type: formValue.type,
        target_audience: formValue.target_audience,
        send_methods: formValue.send_methods
      };

      this.communicationService.createAnnouncement(announcementData).subscribe(response => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = 'Draft saved successfully!';
          this.loadStats();
          this.loadAnnouncements();
        } else {
          this.error = response.message || 'Failed to save draft';
        }
      });
    }
  }

  toggleAnnouncementHistory(): void {
    this.showAnnouncementHistory = !this.showAnnouncementHistory;
    if (this.showAnnouncementHistory) {
      this.loadAnnouncements();
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'feature':
        return 'bg-blue-100 text-blue-800';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.announcementForm.controls).forEach(key => {
      const control = this.announcementForm.get(key);
      control?.markAsTouched();
    });
  }

  closeAlert(): void {
    this.error = null;
    this.successMessage = null;
  }
}
