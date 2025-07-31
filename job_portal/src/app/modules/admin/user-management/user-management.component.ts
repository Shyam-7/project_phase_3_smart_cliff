// user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  applications?: number;
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
  showViewDialog: boolean = false;
  showDeleteDialog: boolean = false;
  selectedUser: User | null = null;
  userToDelete: User | null = null;
  isLoading: boolean = false;

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
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Use the real applications count from backend
        this.users = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: this.normalizeRole(user.role),
          status: this.normalizeStatus(user.status),
          created_at: user.created_at,
          applications: user.applications !== undefined ? user.applications : 0
        }));
        this.filteredUsers = [...this.users];
        this.filterUsers();
        this.updateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        alert('Failed to load users. Please try again.');
      }
    });
  }

  normalizeRole(role: string): string {
    switch (role?.toLowerCase()) {
      case 'job_seeker':
        return 'Job Seeker';
      case 'employer':
        return 'Employer';
      case 'admin':
        return 'Admin';
      default:
        return role || 'Unknown';
    }
  }

  normalizeStatus(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'inactive':
      case 'suspended':
        return 'Suspended';
      default:
        return status || 'Unknown';
    }
  }

  updateStats(): void {
    this.totalUsers = this.users.length;
    this.jobSeekers = this.users.filter(user => user.role === 'Job Seeker').length;
    this.employers = this.users.filter(user => user.role === 'Employer').length;
    this.activeUsers = this.users.filter(user => user.status === 'Active').length;
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'All' || user.status === this.selectedStatus;
      const matchesRole = this.selectedRole === 'All' || user.role === this.selectedRole;

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

  // View user details
  viewUser(user: User): void {
    this.selectedUser = user;
    this.showViewDialog = true;
  }

  closeViewDialog(): void {
    this.showViewDialog = false;
    this.selectedUser = null;
  }

  // Delete user functionality
  openDeleteDialog(user: User): void {
    // Don't allow deleting admin users
    if (user.role === 'Admin') {
      alert('Cannot delete admin users.');
      return;
    }
    this.userToDelete = user;
    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: (response) => {
        console.log('User deleted successfully:', response);
        // Remove user from local array
        this.users = this.users.filter(user => user.id !== this.userToDelete!.id);
        this.filterUsers();
        this.updateStats();
        this.closeDeleteDialog();
        alert('User deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    });
  }

  // Toggle user status
  toggleStatus(user: User): void {
    const newStatus = user.status === 'Active' ? 'inactive' : 'active';
    
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: (response) => {
        console.log('User status updated:', response);
        // Update local user status
        user.status = this.normalizeStatus(newStatus);
        this.updateStats();
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        alert('Failed to update user status. Please try again.');
      }
    });
  }

  // Utility methods
  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  ceil(num: number): number {
    return Math.ceil(num);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'Job Seeker':
        return 'px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800';
      case 'Employer':
        return 'px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800';
      case 'Admin':
        return 'px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800';
      default:
        return 'px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(status: string): string {
    return status === 'Active'
      ? 'px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'
      : 'px-2 py-1 rounded-full text-xs bg-red-100 text-red-800';
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