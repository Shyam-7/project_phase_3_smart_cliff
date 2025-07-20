// login.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: user => {
        const isAdmin = user.role === 'admin';
        const redirectPath = isAdmin
          ? '/admin'
          : sessionStorage.getItem('lastVisited') || '/user/user-dashboard';

        this.router.navigate([redirectPath]);
      },
      error: err => {
        console.error('Login error:', err);
        // Extract error message from HTTP error response
        this.error = err.error?.message || err.message || 'Invalid username or password';
      }
    });
  }
}
