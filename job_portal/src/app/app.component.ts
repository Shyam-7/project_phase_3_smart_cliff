import { Component, OnInit, afterNextRender } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // SAFE window access (runs only in browser)
    afterNextRender(() => {
      window.addEventListener('storage', (event) => {
        if (event.key === 'user_session' && event.newValue === null) {
          this.authService.logout(false);
          this.router.navigate(['/']);
        }
      });

      // Handle browser back/forward navigation
      window.addEventListener('popstate', () => {
        this.handleNavigationGuard();
      });

      // Development helper: Press Ctrl+Shift+C to clear all stored data
      window.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
          this.authService.clearAllStoredData();
          console.log('All stored data cleared. Refreshing page...');
          window.location.reload();
        }
      });
    });
  }

  ngOnInit() {
    // Monitor route changes to enforce role-based navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.handleNavigationGuard();
    });
  }

  private handleNavigationGuard(): void {
    const currentUser = this.authService.getCurrentUser();
    const currentUrl = this.router.url;

    if (currentUser && currentUser.role) {
      // Admin trying to access user areas
      if (currentUser.role === 'admin' && (currentUrl.startsWith('/user') || currentUrl === '/')) {
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 0);
      }
      // Job seeker trying to access admin areas
      else if (currentUser.role === 'job_seeker' && currentUrl.startsWith('/admin')) {
        setTimeout(() => {
          this.router.navigate(['/user/dashboard']);
        }, 0);
      }
    }
  }
}