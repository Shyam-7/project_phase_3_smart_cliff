// user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';


interface User {
  id: string;
  name: string;
  email: string;
  role: 'job_seeker' | 'employer' | 'admin';
  status: 'Active' | 'Suspended';
  created_at: string;
  application_count: number;
  address?: string; // Added address field
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  selectedStatus: string = 'All';
  selectedRole: string = 'All';
  showSuspendDialog: boolean = false;
  userToSuspend: User | null = null;
  showUserModal: boolean = false;
  selectedUser: User | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  // Stats
  totalUsers: number = 0;
  jobSeekers: number = 0;
  employers: number = 0;
  activeUsers: number = 0;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        console.log('Raw users from API:', users);
        this.users = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: this.mapRole(user.role),
          status: this.normalizeStatus(user.status),
          created_at: user.created_at,
          application_count: user.application_count || 0
        }));
        this.filteredUsers = [...this.users];
        this.updateStats();
        this.isLoading = false;
        console.log('Processed users:', this.users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapRole(role: string): 'job_seeker' | 'employer' | 'admin' {
    switch (role.toLowerCase()) {
      case 'job_seeker':
        return 'job_seeker';
      case 'employer':
        return 'employer';
      case 'admin':
        return 'admin';
      default:
        return 'job_seeker';
    }
  }

  private normalizeStatus(status: string): 'Active' | 'Suspended' {
    return status.toLowerCase() === 'active' ? 'Active' : 'Suspended';
  }

  // Add this method to your UserManagementComponent class
  openSuspendDialog(user: User): void {
    this.userToSuspend = user;
    this.showSuspendDialog = true;
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  ceil(num: number): number {
    return Math.ceil(num);
  }

  updateStats(): void {
    this.totalUsers = this.users.length;
    this.jobSeekers = this.users.filter(user => user.role === 'job_seeker').length;
    this.employers = this.users.filter(user => user.role === 'employer').length;
    this.activeUsers = this.users.filter(user => user.status === 'Active').length;
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'All' || user.status === this.selectedStatus;
      const matchesRole = this.selectedRole === 'All' || this.getRoleDisplayName(user.role) === this.selectedRole;

      return matchesSearch && matchesStatus && matchesRole;
    });
    this.currentPage = 1;
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  toggleStatus(user: User): void {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: (response) => {
        console.log('Status updated:', response);
        user.status = newStatus;
        this.updateStats();
        this.showSuspendDialog = false;
        this.userToSuspend = null;
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        alert('Failed to update user status. Please try again.');
      }
    });
  }

  confirmStatusChange(): void {
    if (this.userToSuspend) {
      this.toggleStatus(this.userToSuspend);
    }
  }

  cancelStatusChange(): void {
    this.showSuspendDialog = false;
    this.userToSuspend = null;
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.deleteUser(id).subscribe({
        next: (response) => {
          console.log('User deleted:', response);
          this.users = this.users.filter(user => user.id !== id);
          this.filterUsers();
          this.updateStats();
          alert('User deleted successfully.');
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  viewUser(user: User): void {
    this.selectedUser = user;
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'job_seeker':
        return 'Job Seeker';
      case 'employer':
        return 'Employer';
      case 'admin':
        return 'Admin';
      default:
        return 'Unknown';
    }
  }

  getRoleClass(role: string): string {
    const displayRole = this.getRoleDisplayName(role);
    switch (displayRole) {
      case 'Job Seeker':
        return 'px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800';
      case 'Employer':
        return 'px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800';
      case 'Admin':
        return 'px-2 py-1 rounded-full text-xs bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(status: string): string {
    return status === 'Active'
      ? 'px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'
      : 'px-2 py-1 rounded-full text-xs bg-red-100 text-red-800';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = endPage - maxVisiblePages + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }
}