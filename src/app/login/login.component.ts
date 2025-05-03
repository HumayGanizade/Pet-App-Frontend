import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {CommonModule} from "@angular/common";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response: any) => {
          console.log('Login successful!', response);
          localStorage.setItem('token', response.token); // Save token for authentication
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          console.error('Login error:', err);

          // Handle 401 Unauthorized error specifically
          if (err.status === 401) {
            this.errorMessage = 'Invalid email or password!';
          } else {
            this.errorMessage = 'An error occurred. Please try again later.';
          }
        }
      });
    }
  }
}
