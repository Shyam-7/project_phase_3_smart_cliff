import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message = '';
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { email } = this.form.value;
    this.authService.requestPasswordReset(email).subscribe({
      next: code => {
        this.message = 'Reset code sent! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], { queryParams: { code } });
        }, 1500);
      },
      error: err => {
        this.error = err.message || 'Failed to initiate reset';
      }
    });
  }
}
