import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ContentService, ContentItem } from '../../../core/services/content.service';

interface ContentGroup {
  section: string;
  title: string;
  description: string;
  icon: string;
  editFields: string[];
  previewType: string;
  content?: ContentItem;
}

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './content-management.component.html',
  styleUrl: './content-management.component.css'
})
export class ContentManagementComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  editingContent: ContentItem | null = null;
  editForm: FormGroup;
  showPreview = false;
  previewData: any = null;

  // Additional properties for custom fields
  navigationLinks: any[] = [];
  socialLinks: any[] = [];
  footerColumns: any[] = [];
  secondaryLinks: any[] = [];
  howItWorksSteps: any[] = [];

  contentGroups: ContentGroup[] = [
    {
      section: 'header',
      title: 'Header Navigation',
      description: 'Manage the main navigation header, logo, and menu items',
      icon: 'fas fa-bars',
      editFields: ['logoText', 'navigation'],
      previewType: 'header'
    },
    {
      section: 'hero',
      title: 'Dashboard Hero Section',
      description: 'Main banner area with title, subtitle, and search functionality',
      icon: 'fas fa-star',
      editFields: ['title', 'subtitle', 'searchSuggestions', 'ctaButtonText', 'imageUrl', 'imageAlt'],
      previewType: 'hero'
    },
    {
      section: 'welcome',
      title: 'Welcome Section',
      description: 'Welcome message and call-to-action buttons',
      icon: 'fas fa-handshake',
      editFields: ['title', 'content', 'ctaButtonText', 'ctaButtonLink', 'secondaryLinks'],
      previewType: 'welcome'
    },
    {
      section: 'how_it_works',
      title: 'How It Works',
      description: 'Step-by-step process explanation with icons and descriptions',
      icon: 'fas fa-cogs',
      editFields: ['title', 'steps'],
      previewType: 'steps'
    },
    {
      section: 'footer',
      title: 'Footer',
      description: 'Footer links, social media, and contact information',
      icon: 'fas fa-folder',
      editFields: ['logoText', 'contactText', 'socialLinks', 'columns'],
      previewType: 'footer'
    }
  ];

  constructor(
    private contentService: ContentService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      content: [''],
      logoText: [''],
      ctaButtonText: [''],
      searchSuggestions: [''],
      additional_data: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAllContent();
  }

  loadAllContent(): void {
    console.log('=== Loading Content ===');
    this.isLoading = true;
    this.contentService.getAllContent().subscribe({
      next: (response: any) => {
        console.log('Content API Response:', response);
        if (response.success) {
          console.log('Content Data:', response.data);
          // Map content to groups
          this.contentGroups.forEach(group => {
            group.content = response.data.find((item: ContentItem) => item.section === group.section);
            console.log(`Group ${group.section}:`, group.content);
          });
        } else {
          console.error('API Error:', response.error || response.message);
          this.error = response.error || response.message || 'Failed to load content';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading content:', error);
        this.error = 'Failed to load content: ' + (error.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  editContent(group: ContentGroup): void {
    this.editingContent = group.content || {
      section: group.section,
      section_type: group.section,
      title: '',
      content: '',
      additional_data: {},
      is_active: true
    } as ContentItem;

    // Initialize custom field arrays based on section type
    this.initializeCustomFields();

    // Populate form
    this.editForm.patchValue({
      title: this.editingContent.title || '',
      content: this.editingContent.content || '',
      logoText: this.editingContent.additional_data?.logoText || '',
      ctaButtonText: this.editingContent.additional_data?.ctaButtonText || '',
      searchSuggestions: this.editingContent.additional_data?.searchSuggestions || '',
      additional_data: JSON.stringify(this.editingContent.additional_data || {}, null, 2)
    });
  }

  initializeCustomFields(): void {
    if (!this.editingContent) return;

    const additionalData = this.editingContent.additional_data || {};

    switch (this.editingContent.section) {
      case 'header':
        this.navigationLinks = additionalData.navigation || [
          { text: 'Jobs', href: '/jobs' },
          { text: 'Companies', href: '/companies' },
          { text: 'About', href: '/about' }
        ];
        break;

      case 'footer':
        this.socialLinks = additionalData.socialLinks || [
          { platform: 'facebook', url: '' },
          { platform: 'twitter', url: '' },
          { platform: 'linkedin', url: '' }
        ];
        this.footerColumns = additionalData.columns || [
          {
            title: 'About Us',
            links: [
              { text: 'Our Story', href: '/about' },
              { text: 'Careers', href: '/careers' },
              { text: 'Team', href: '/team' }
            ]
          },
          {
            title: 'FAQ',
            links: [
              { text: 'How to apply?', href: '/faq#apply' },
              { text: 'Account help', href: '/faq#account' },
              { text: 'Contact support', href: '/support' }
            ]
          }
        ];
        break;

      case 'welcome':
        this.secondaryLinks = additionalData.secondaryLinks || [
          { text: 'Learn More', href: '/about' },
          { text: 'Get Help', href: '/support' }
        ];
        break;

      case 'how_it_works':
        this.howItWorksSteps = additionalData.steps || [
          {
            title: 'Create Account',
            description: 'Sign up and build your profile',
            icon: 'fas fa-user-plus'
          },
          {
            title: 'Search Jobs',
            description: 'Browse thousands of job opportunities',
            icon: 'fas fa-search'
          },
          {
            title: 'Apply',
            description: 'Submit your application with one click',
            icon: 'fas fa-paper-plane'
          },
          {
            title: 'Get Hired',
            description: 'Connect with employers and start your career',
            icon: 'fas fa-handshake'
          }
        ];
        break;
    }
  }

  saveContent(): void {
    if (!this.editingContent) return;

    const formValue = this.editForm.value;
    let additionalData: any = {};

    // Build additional_data based on section type
    switch (this.editingContent.section) {
      case 'header':
        additionalData = {
          logoText: formValue.logoText,
          navigation: this.navigationLinks
        };
        break;

      case 'footer':
        additionalData = {
          logoText: formValue.logoText,
          socialLinks: this.socialLinks,
          columns: this.footerColumns
        };
        break;

      case 'hero':
        additionalData = {
          ctaButtonText: formValue.ctaButtonText,
          searchSuggestions: formValue.searchSuggestions
        };
        break;

      case 'welcome':
        additionalData = {
          ctaButtonText: formValue.ctaButtonText,
          secondaryLinks: this.secondaryLinks
        };
        break;

      case 'how_it_works':
        additionalData = {
          steps: this.howItWorksSteps
        };
        break;

      default:
        try {
          additionalData = JSON.parse(formValue.additional_data);
        } catch (error) {
          this.error = 'Invalid JSON in additional data';
          return;
        }
    }

    const contentData: ContentItem = {
      ...this.editingContent,
      title: formValue.title,
      content: formValue.content,
      additional_data: additionalData
    };

    this.isLoading = true;

    const saveOperation = contentData.id 
      ? this.contentService.updateContent(contentData.id, contentData)
      : this.contentService.createContent(contentData);

    saveOperation.subscribe({
      next: (response: any) => {
        if (response.success) {
          this.editingContent = null;
          this.loadAllContent();
        } else {
          this.error = response.message || 'Failed to save content';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error saving content:', error);
        this.error = 'Failed to save content';
        this.isLoading = false;
      }
    });
  }

  showContentPreview(group: ContentGroup): void {
    if (!group.content) return;

    this.previewData = {
      type: group.previewType,
      title: group.content.title,
      content: group.content.content,
      additionalData: group.content.additional_data
    };
    this.showPreview = true;
  }

  cancelEdit(): void {
    this.editingContent = null;
    this.editForm.reset();
    this.error = null;
  }

  closePreview(): void {
    this.showPreview = false;
    this.previewData = null;
  }

  getStatusClass(isActive?: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getStatusText(isActive?: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  // Navigation Links Management
  addNavigationLink(): void {
    this.navigationLinks.push({ text: '', href: '' });
  }

  removeNavigationLink(index: number): void {
    this.navigationLinks.splice(index, 1);
  }

  // Social Links Management
  addSocialLink(): void {
    this.socialLinks.push({ platform: 'facebook', url: '' });
  }

  removeSocialLink(index: number): void {
    this.socialLinks.splice(index, 1);
  }

  // Footer Columns Management
  addFooterColumn(): void {
    this.footerColumns.push({
      title: '',
      links: [{ text: '', href: '' }]
    });
  }

  removeFooterColumn(index: number): void {
    this.footerColumns.splice(index, 1);
  }

  addColumnLink(columnIndex: number): void {
    this.footerColumns[columnIndex].links.push({ text: '', href: '' });
  }

  removeColumnLink(columnIndex: number, linkIndex: number): void {
    this.footerColumns[columnIndex].links.splice(linkIndex, 1);
  }

  // Secondary Links Management
  addSecondaryLink(): void {
    this.secondaryLinks.push({ text: '', href: '' });
  }

  removeSecondaryLink(index: number): void {
    this.secondaryLinks.splice(index, 1);
  }

  // How It Works Steps Management
  addStep(): void {
    this.howItWorksSteps.push({
      title: '',
      description: '',
      icon: 'fas fa-star'
    });
  }

  removeStep(index: number): void {
    this.howItWorksSteps.splice(index, 1);
  }
}
