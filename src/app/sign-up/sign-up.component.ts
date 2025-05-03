import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from "../services/auth.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      date_of_birth: ['', [Validators.required]], // Ensure it's a valid date
      gender: ['', [Validators.required]],
      gmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  passwordsMatch(): boolean {
    return this.signupForm.get('password')?.value === this.signupForm.get('confirmPassword')?.value;
  }

  onSubmit() {
    console.log('Form submitted');
    if (this.signupForm.valid) {
      if (!this.passwordsMatch()) {
        this.errorMessage = 'Passwords do not match!';
        return;
      }

      const { name, surname, date_of_birth, gender, gmail, password } = this.signupForm.value;
      console.log('Form values:', { name, surname, date_of_birth, gender, gmail, password }); // Log the values

      this.authService.signup(name, surname, date_of_birth, gender, gmail, password).subscribe({
        next: (response: any) => {
          console.log('Sign-up successful!', response);
          alert('Sign-up successful! You can now log in.');
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Sign-up error:', err);
          this.errorMessage = err?.error?.message || 'Error during sign-up. Please try again.';
        }
      });

    } else {
      this.errorMessage = 'Please fill out the form correctly.';
    }
  }
}
