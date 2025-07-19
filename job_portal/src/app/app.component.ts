import { Component, OnInit, afterNextRender } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';

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
          this.router.navigate(['/auth/login']);
        }
      });
    });
  }

  ngOnInit() {}
}