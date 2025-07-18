// user-management.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface User {
  id: number;
  name: string;
  email: string;
  role: 'Job Seeker' | 'Employer' | 'Admin';
  status: 'Active' | 'Suspended';
  joinDate: string;
  applications: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent {
  users: User[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'Job Seeker',
      status: 'Active',
      joinDate: 'Jan 15, 2024',
      applications: 5
    },
    {
      id: 2,
      name: 'Morgan Wilson',
      email: 'morganwilson@email.com',
      role: 'Job Seeker',
      status: 'Active',
      joinDate: 'Jan 16, 2024',
      applications: 6
    },
    {
      id: 3,
      name: 'Jason Mulberry',
      email: 'jason.mulberry@email.com',
      role: 'Job Seeker',
      status: 'Active',
      joinDate: 'Jan 16, 2024',
      applications: 2
    },
    {
      id: 4,
      name: 'Emily Shorrett',
      email: 'emily.shorrett@email.com',
      role: 'Employer',
      status: 'Active',
      joinDate: 'Jan 18, 2024',
      applications: 3
    },
    {
      id: 5,
      name: 'Bryan Kilgore',
      email: 'bryan.kilgore@email.com',
      role: 'Job Seeker',
      status: 'Active',
      joinDate: 'Jan 19, 2024',
      applications: 3
    },
    {
      id: 6,
      name: 'Laura Dennett',
      email: 'laura.dennett@email.com',
      role: 'Job Seeker',
      status: 'Active',
      joinDate: 'Jan 21, 2024',
      applications: 0
    },
    {
      id: 7,
      name: 'Rachel Tomlin',
      email: 'rachel.tomlin@email.com',
      role: 'Employer',
      status: 'Active',
      joinDate: 'Jan 25, 2024',
      applications: 1
    }
  ];

  filteredUsers: User[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  selectedStatus: string = 'All';
  selectedRole: string = 'All';
  showSuspendDialog: boolean = false;
  userToSuspend: User | null = null;

  // Stats
  totalUsers: number = 0;
  jobSeekers: number = 0;
  employers: number = 0;
  activeUsers: number = 0;

  constructor() {
    this.filteredUsers = [...this.users];
    this.updateStats();
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
    this.updateStats();
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
    user.status = user.status === 'Active' ? 'Suspended' : 'Active';
    this.updateStats();
  }

  deleteUser(id: number): void {
    this.users = this.users.filter(user => user.id !== id);
    this.filterUsers();
  }
  getRoleClass(role: string): string {
    switch (role) {
      case 'Job Seeker':
        return 'px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800';
      case 'Employer':
        return 'px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800';
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