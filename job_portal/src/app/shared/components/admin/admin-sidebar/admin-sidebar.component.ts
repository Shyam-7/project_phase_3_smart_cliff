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
  showHelpCenter = false; // Help center modal visibility

  constructor(private authService: AuthService) {}

  logout() {
    this.showLogoutModal = true; // Show the modal
  }

  confirmLogout() {
    this.showLogoutModal = false; // Close the modal
    this.authService.logout();    // Perform logout
  }

  openHelpCenter() {
    this.showHelpCenter = true;
  }

  closeHelpCenter() {
    this.showHelpCenter = false;
  }

  // Help center data
  helpSections = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      icon: 'fas fa-tachometer-alt',
      description: 'Get an overview of your job portal metrics and recent activities',
      items: [
        'View total jobs, users, and applications',
        'Monitor recent job postings and user registrations',
        'Track platform growth and engagement',
        'Quick access to all management sections'
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: 'fas fa-chart-bar',
      description: 'Understand your platform performance with detailed analytics',
      items: [
        'Monitor job posting trends and categories',
        'Track user engagement and application rates',
        'View growth metrics and performance indicators',
        'Export data for external reporting'
      ]
    },
    {
      id: 'users',
      title: 'User Management',
      icon: 'fas fa-users',
      description: 'Manage all platform users, roles, and permissions',
      items: [
        'View and search all registered users',
        'Monitor user application counts',
        'Filter users by role (Job Seekers, Employers)',
        'View user profiles and activity history'
      ]
    },
    {
      id: 'jobs',
      title: 'Job Management',
      icon: 'fas fa-briefcase',
      description: 'Create, edit, and manage all job postings on the platform',
      items: [
        'Add new job postings with detailed information',
        'Edit existing job descriptions and requirements',
        'Monitor application counts for each job',
        'Manage job categories and employment types'
      ]
    },
    {
      id: 'content',
      title: 'Content Management',
      icon: 'fas fa-edit',
      description: 'Customize website content, pages, and user-facing information',
      items: [
        'Edit homepage content and hero sections',
        'Manage navigation links and footer content',
        'Update platform policies and FAQs',
        'Customize how-it-works sections and features'
      ]
    },
    {
      id: 'communication',
      title: 'Communication Center',
      icon: 'fas fa-comments',
      description: 'Manage notifications, announcements, and user communications',
      items: [
        'Send platform-wide announcements',
        'Manage email notifications and templates',
        'View user feedback and support requests',
        'Configure automated communication settings'
      ]
    }
  ];

  navigateToSection(sectionId: string) {
    this.closeHelpCenter();
    // Navigate to the appropriate section
    switch(sectionId) {
      case 'dashboard':
        // Already on dashboard, just close help
        break;
      case 'analytics':
        window.location.href = '/admin/analytics';
        break;
      case 'users':
        window.location.href = '/admin/user-management';
        break;
      case 'jobs':
        window.location.href = '/admin/job-management';
        break;
      case 'content':
        window.location.href = '/admin/content-management';
        break;
      case 'communication':
        window.location.href = '/admin/communication';
        break;
    }
  }
}
