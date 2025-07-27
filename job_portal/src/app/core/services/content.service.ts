import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ContentItem {
  id?: number;
  section: string;
  section_type: string;
  title: string;
  content?: string;
  image_url?: string;
  image_alt?: string;
  additional_data?: any;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserDashboardContent {
  hero: {
    title: string;
    subtitle: string;
    searchSuggestions: string;
    ctaButtonText: string;
  };
  welcome: {
    title: string;
    content: string;
    ctaButtonText: string;
    secondaryLinks: Array<{url: string, text: string}>;
  };
  howItWorks: {
    title: string;
    steps: Array<{
      icon: string;
      title: string;
      number: number;
      description: string;
    }>;
  };
  heroImage: {
    url: string;
    alt: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = 'http://localhost:3001/api/content';
  private dashboardContentSubject = new BehaviorSubject<UserDashboardContent | null>(null);
  public dashboardContent$ = this.dashboardContentSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Public methods for user pages
  getUserDashboardContent(): Observable<UserDashboardContent> {
    return this.http.get<ApiResponse<UserDashboardContent>>(`${this.apiUrl}/public/user-dashboard`)
      .pipe(
        map(response => {
          this.dashboardContentSubject.next(response.data);
          return response.data;
        }),
        catchError(error => {
          console.error('Error fetching dashboard content:', error);
          // Return fallback content
          const fallbackContent: UserDashboardContent = {
            hero: {
              title: 'Find a job that suits your interest & skills.',
              subtitle: 'Explore thousands of job opportunities that match your skills and passions.',
              searchSuggestions: 'Designer, Programming, Digital Marketing, Video, Animation',
              ctaButtonText: 'Find Job'
            },
            welcome: {
              title: 'Welcome to Skillhunt',
              content: 'Create an account or sign in to see jobs that fit your requirements',
              ctaButtonText: 'Get Started',
              secondaryLinks: [
                { url: '/user/user-profile', text: 'Post your resume' },
                { url: '#', text: 'Post a job' }
              ]
            },
            howItWorks: {
              title: 'How Skillhunt Works',
              steps: [
                {
                  icon: 'fas fa-user-plus',
                  title: 'Create account',
                  number: 1,
                  description: 'Fill in all your details for setting up your profile visible to recruiters.'
                },
                {
                  icon: 'fas fa-upload',
                  title: 'Upload Resume',
                  number: 2,
                  description: 'Showcase your skills and experience with a standout CV.'
                },
                {
                  icon: 'fas fa-search',
                  title: 'Find suitable job',
                  number: 3,
                  description: 'Use smart filters to discover jobs tailored for you.'
                },
                {
                  icon: 'fas fa-paper-plane',
                  title: 'Apply Easily',
                  number: 4,
                  description: 'Send applications in one click and track your progress.'
                }
              ]
            },
            heroImage: {
              url: '/assets/person_searching_job.png',
              alt: 'Person searching job'
            }
          };
          this.dashboardContentSubject.next(fallbackContent);
          return of(fallbackContent);
        })
      );
  }

  getContentBySection(section: string): Observable<ContentItem> {
    return this.http.get<ApiResponse<ContentItem>>(`${this.apiUrl}/public/section/${section}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching content by section:', error);
          return of({
            section,
            section_type: 'hero',
            title: 'Content not available',
            content: 'This content is currently being updated.'
          } as ContentItem);
        })
      );
  }

  getContentBySectionType(sectionType: string): Observable<ContentItem[]> {
    return this.http.get<ApiResponse<ContentItem[]>>(`${this.apiUrl}/public/section-type/${sectionType}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching content by section type:', error);
          return of([]);
        })
      );
  }

  // Admin methods (require authentication)
  getAllContent(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/admin`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching all content:', error);
          // If unauthorized, return error with specific message
          if (error.status === 401) {
            return of({
              success: false,
              error: 'Authentication required. Please log in as admin.',
              data: []
            });
          }
          return of({
            success: false,
            error: error.message || 'Failed to load content',
            data: []
          });
        })
      );
  }

  createContent(content: Partial<ContentItem>): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/admin`, content, { headers })
      .pipe(
        catchError(error => {
          console.error('Error creating content:', error);
          return of({
            success: false,
            error: error.message
          });
        })
      );
  }

  updateContent(id: number, content: Partial<ContentItem>): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.apiUrl}/admin/${id}`, content, { headers })
      .pipe(
        catchError(error => {
          console.error('Error updating content:', error);
          return of({
            success: false,
            error: error.message
          });
        })
      );
  }

  deleteContent(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/admin/${id}`, { headers })
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Error deleting content:', error);
          throw error;
        })
      );
  }

  // Helper method to refresh dashboard content cache
  refreshDashboardContent(): void {
    this.getUserDashboardContent().subscribe();
  }
}
