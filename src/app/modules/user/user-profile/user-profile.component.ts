import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { AuthService, User } from '../../../core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserModule } from "../user.module";
import { HeaderComponent } from '../../../shared/components/user/header/header.component';


@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, UserModule,HeaderComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser!: User;
  profileData: any;
  editingSection: string | null = null;
  skillsArray: string[] = [];
  showResumeDropdown = false;
  isLoading = false;
  saveSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.currentUser = user;
    this.loadProfileData();
  }

  initForm(data: any): void {
    this.profileForm = this.fb.group({
      name: [data.name || '', [Validators.required, Validators.minLength(2)]],
      headline: [data.headline || ''],
      email: [data.email || this.currentUser.email, [Validators.required, Validators.email]],
      phone: [data.phone || '', [Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)]],
      location: [data.location || ''],
      about: [data.about || ''],
      experience: [data.experience || ''],
      education: [data.education || ''],
      skills: [data.skills || ''],
      resume: [data.resume || null],
      jobPreferences: this.fb.group({
        title: [data.jobPreferences?.title || ''],
        salary: [data.jobPreferences?.salary || '', [Validators.pattern(/^\$?\d+(,\d{3})*(\.\d{2})?$/)]],
        workType: [data.jobPreferences?.workType || ''],
        availability: [data.jobPreferences?.availability || 'Immediately']
      })
    });

    if (data.skills) {
      this.skillsArray = data.skills
        .split(',')
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill.length > 0);
    }
  }

  loadProfileData(): void {
    this.isLoading = true;
    this.http.get<any[]>(`http://localhost:3000/users?id=${this.currentUser.id}`).subscribe({
      next: (res) => {
        this.profileData = res[0] || {};
        this.initForm(this.profileData);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile data:', err);
        this.isLoading = false;
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  onResumeUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // ✅ Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }

    // ✅ Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resumeData = {
        name: file.name,
        size: this.formatFileSize(file.size),
        data: (reader.result as string).split(',')[1], // Base64 string only
        type: file.type
      };

      // ✅ Patch to form (for later save)
      this.profileForm.patchValue({ resume: resumeData });
      this.profileForm.get('resume')?.markAsDirty(); // Optional
    };

    reader.readAsDataURL(file);
  }


  updateSkillsChips(): void {
    const skillsValue = this.profileForm.get('skills')?.value || '';
    this.skillsArray = skillsValue
      .split(',')
      .map((skill: string) => skill.trim())
      .filter((skill: string) => skill.length > 0);
  }

  viewResume(): void {
    const resume = this.profileForm.value.resume;
    if (resume?.data) {
      const blob = this.base64ToBlob(resume.data, resume.type);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }

  downloadResume(): void {
    const resume = this.profileForm.value.resume;
    if (resume?.data) {
      const blob = this.base64ToBlob(resume.data, resume.type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.name || 'resume';
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  removeResume(): void {
    if (confirm('Are you sure you want to remove the resume?')) {
      this.profileForm.patchValue({ resume: null });
      this.saveProfile(); // Auto-save after removal
    }
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  }

  editSection(section: string): void {
    this.editingSection = section;
    this.saveSuccess = false;
  }

  closeEdit(): void {
    this.editingSection = null;
  }
  saveAndClose(): void {

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const updatedData = this.profileForm.value;


    if (this.skillsArray.length > 0) {
      updatedData.skills = this.skillsArray.join(', ');
    }
    this.closeEdit();
    // Close the modal immediately while continuing the save operation


    this.http.patch(`http://localhost:3000/users/${this.currentUser.id}`, updatedData)
      .subscribe({
        next: () => {
          this.profileData = { ...this.profileData, ...updatedData };
          this.isLoading = false;
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        },
        error: (err) => {
          console.error('Error saving profile:', err);
          this.isLoading = false;
          alert('Failed to save profile. Please try again.');
        }
      });
  }
  // Modify the saveProfile method to only close on successful save
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      // Remove the alert as it's not user-friendly
      return;
    }

    this.isLoading = true;
    const updatedData = this.profileForm.value;

    if (this.skillsArray.length > 0) {
      updatedData.skills = this.skillsArray.join(', ');
    }

    this.http.patch(`http://localhost:3000/users/${this.currentUser.id}`, updatedData)
      .subscribe({
        next: () => {
          this.profileData = { ...this.profileData, ...updatedData };
          this.isLoading = false;
          this.saveSuccess = true;
          setTimeout(() => {
            this.saveSuccess = false;
            this.closeEdit(); // Move closeEdit inside setTimeout
          }, 1000); // Reduce timeout to 1 second
        },
        error: (err) => {
          console.error('Error saving profile:', err);
          this.isLoading = false;
          alert('Failed to save profile. Please try again.');
        }
      });
  }

  // Word count methods
  updateWordCount(field: string, event: Event): void {
    // This method is called on input events to trigger change detection
  }

  getWordCount(field: string): number {
    const value = this.profileForm.get(field)?.value || '';
    if (!value.trim()) return 0;
    return value.trim().split(/\s+/).length;
  }

  getCharCount(field: string): number {
    const value = this.profileForm.get(field)?.value || '';
    return value.length;
  }

  onDone(): void {
    this.router.navigate(['/user/job-search']); // Replace with your desired route
  }
}