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
  scheduledAnnouncements: Announcement[] = [];
  draftAnnouncements: Announcement[] = [];
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
  showAnnouncementHistory = true; // Changed to true by default
  showCreateForm = false;
  showScheduledAnnouncements = false;
  showDraftAnnouncements = false;
  editingAnnouncement: Announcement | null = null;

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
    this.loadScheduledAnnouncements();
    this.loadDraftAnnouncements();
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

      const operation = this.editingAnnouncement 
        ? this.communicationService.updateAnnouncement(this.editingAnnouncement.id!, announcementData)
        : this.communicationService.createAnnouncement(announcementData);

      operation.subscribe(response => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = scheduledAt ? 'Announcement scheduled successfully!' : 'Announcement sent successfully!';
          this.resetForm();
          this.closeCreateForm();
          this.refreshAllData();
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
      this.isSubmitting = true;
      this.error = null;

      const formValue = this.announcementForm.value;
      const announcementData: Partial<Announcement> = {
        title: formValue.title,
        message: formValue.message,
        type: formValue.type,
        target_audience: formValue.target_audience,
        send_methods: formValue.send_methods,
        status: 'draft'
      };

      const operation = this.editingAnnouncement 
        ? this.communicationService.updateAnnouncement(this.editingAnnouncement.id!, announcementData)
        : this.communicationService.createAnnouncement(announcementData);

      operation.subscribe(response => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = 'Draft saved successfully!';
          this.closeCreateForm();
          this.refreshAllData();
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

  // Edit scheduled announcement
  editScheduledAnnouncement(announcement: Announcement): void {
    this.editingAnnouncement = announcement;
    this.populateFormWithAnnouncement(announcement);
    this.showCreateForm = true;
    this.showScheduledAnnouncements = false;
  }

  // Edit draft announcement
  editDraftAnnouncement(announcement: Announcement): void {
    this.editingAnnouncement = announcement;
    this.populateFormWithAnnouncement(announcement);
    this.showCreateForm = true;
    this.showDraftAnnouncements = false;
  }

  // Helper method to populate form with announcement data
  populateFormWithAnnouncement(announcement: Announcement): void {
    const scheduledDate = announcement.scheduled_at ? new Date(announcement.scheduled_at) : null;
    
    this.announcementForm.patchValue({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      target_audience: announcement.target_audience,
      send_methods: announcement.send_methods,
      scheduled_at: scheduledDate ? scheduledDate.toISOString().split('T')[0] : '',
      schedule_time: scheduledDate ? scheduledDate.toTimeString().split(' ')[0].substring(0, 5) : ''
    });
  }

  // Cancel scheduled announcement
  cancelScheduledAnnouncement(announcementId: string): void {
    if (confirm('Are you sure you want to cancel this scheduled announcement?')) {
      this.communicationService.cancelScheduledAnnouncement(announcementId).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Scheduled announcement cancelled successfully';
            this.refreshAllData();
          }
        },
        error: (error) => {
          this.error = 'Failed to cancel scheduled announcement';
        }
      });
    }
  }

  // Delete draft announcement
  deleteDraftAnnouncement(announcementId: string): void {
    if (confirm('Are you sure you want to delete this draft?')) {
      // We can reuse the cancel endpoint or create a specific delete endpoint
      this.communicationService.cancelScheduledAnnouncement(announcementId).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Draft deleted successfully';
            this.refreshAllData();
          }
        },
        error: (error) => {
          this.error = 'Failed to delete draft';
        }
      });
    }
  }

  // Load draft announcements
  loadDraftAnnouncements(): void {
    this.communicationService.getDraftAnnouncements().subscribe({
      next: (response) => {
        if (response.success) {
          this.draftAnnouncements = response.announcements;
        }
      },
      error: (error) => {
        console.error('Error loading draft announcements:', error);
      }
    });
  }

  // Load scheduled announcements
  loadScheduledAnnouncements(): void {
    this.communicationService.getScheduledAnnouncements().subscribe({
      next: (response) => {
        if (response.success) {
          this.scheduledAnnouncements = response.announcements;
        }
      },
      error: (error) => {
        console.error('Error loading scheduled announcements:', error);
      }
    });
  }

  // Refresh all data
  refreshAllData(): void {
    this.loadStats();
    this.loadAnnouncements();
    this.loadScheduledAnnouncements();
    this.loadDraftAnnouncements();
  }

  // Reset form
  resetForm(): void {
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
    this.editingAnnouncement = null;
  }

  // Close create form
  closeCreateForm(): void {
    this.showCreateForm = false;
    this.resetForm();
  }

  // Toggle drafts section
  toggleDraftAnnouncements(): void {
    this.showDraftAnnouncements = !this.showDraftAnnouncements;
    if (this.showDraftAnnouncements) {
      this.loadDraftAnnouncements();
    }
  }
}
