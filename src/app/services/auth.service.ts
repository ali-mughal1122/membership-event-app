import { Injectable, signal } from '@angular/core';
import { HttpRequest } from '../core/http-request.service';
import { AuthEndpointsMapping } from '../core/endpoints/auth.endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Reactive profile image for the currently logged-in user (zoneless-safe). */
  readonly profileImage = signal(this.resolveProfileImage());

  constructor(private http: HttpRequest) {}

  login(credentials: any) {
    return this.http.post(AuthEndpointsMapping.Login, credentials);
  }

  register(userData: any) {
    return this.http.post(AuthEndpointsMapping.Register, userData);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('access_token', token);
      // Drop the legacy shared key so a previous account's photo is never reused.
      localStorage.removeItem('profileImage');
      this.profileImage.set(this.resolveProfileImage());
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('profileImage');
      this.profileImage.set(this.defaultAvatar('User'));
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      return null;
    }
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email;
    } catch (e) {
      return null;
    }
  }

  getUserType(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.type;
    } catch (e) {
      return null;
    }
  }

  getProfileImage(): string {
    return this.profileImage();
  }

  setProfileImage(url: string | null | undefined) {
    if (typeof window === 'undefined') return;

    const userId = this.getUserId();
    localStorage.removeItem('profileImage');

    if (!userId) {
      this.profileImage.set(this.defaultAvatar(this.getUserEmail() || 'User'));
      return;
    }

    const key = this.profileImageKey(userId);
    if (url) {
      localStorage.setItem(key, url);
      this.profileImage.set(url);
    } else {
      localStorage.removeItem(key);
      this.profileImage.set(this.defaultAvatar(this.getUserEmail() || 'User'));
    }
  }

  changePassword(data: any) {
    return this.http.post(AuthEndpointsMapping.ChangePassword, data);
  }

  getMe() {
    return this.http.get<any>(AuthEndpointsMapping.GetMe);
  }

  updateProfile(data: any) {
    return this.http.post<any>(AuthEndpointsMapping.UpdateProfile, data);
  }

  private profileImageKey(userId: string) {
    return `profileImage:${userId}`;
  }

  private defaultAvatar(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`;
  }

  private resolveProfileImage(): string {
    if (typeof window === 'undefined') {
      return this.defaultAvatar('User');
    }

    const email = this.getUserEmail() || 'User';
    const userId = this.getUserId();
    if (!userId) {
      return this.defaultAvatar(email);
    }

    return localStorage.getItem(this.profileImageKey(userId)) || this.defaultAvatar(email);
  }
}
