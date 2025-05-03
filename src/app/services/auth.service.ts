import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:41433/auth/login';
  private apiUrl2 = 'http://localhost:41433/users';
  private isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());

  isLoggedIn = this.isAuthenticated.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(this.apiUrl, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          this.isAuthenticated.next(true);
        }
      })
    );
  }

  signup(
    name: string,
    surname: string,
    date_of_birth: string,
    gender: string,
    gmail: string,
    password: string
  ): Observable<any> {
    return this.http.post(this.apiUrl2, {
      name,
      surname,
      date_of_birth,
      gender,
      gmail,
      password
    });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.isAuthenticated.next(false);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  checkAuthStatus(): void {
    this.isAuthenticated.next(this.hasToken());
  }
}
