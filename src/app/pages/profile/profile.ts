import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { DataService } from '../../services/data.service';
import { createApiState } from '../../core/api-state';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);
  dataService = inject(DataService);

  email: string = '';
  profileImage: string = '';
  newImageUrl: string = '';

  isUploadingPhoto = false;

  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

  membershipState = createApiState<any>();

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.email = this.authService.getUserEmail() || 'User';
    this.profileImage = this.authService.getProfileImage();
    this.newImageUrl = this.profileImage;

    this.authService.getMe().subscribe({
      next: (user: any) => {
        this.authService.setProfileImage(user?.profileImage || null);
        this.profileImage = this.authService.getProfileImage();
        this.newImageUrl = this.profileImage;
        if (user?.email) this.email = user.email;
      },
      error: () => {}
    });

    this.membershipState.execute(this.dataService.getMyMembership());
  }

  // File Upload Logic
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      this.toastService.error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      this.toastService.error('Image size must be less than 2MB.');
      return;
    }

    this.isUploadingPhoto = true;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.newImageUrl = e.target.result;
      this.saveProfile();
      this.isUploadingPhoto = false;
    };
    reader.onerror = () => {
      this.toastService.error('Failed to read file.');
      this.isUploadingPhoto = false;
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.newImageUrl = `https://ui-avatars.com/api/?name=${this.email}&background=10b981&color=fff`;
    this.saveProfile();
  }

  saveProfile() {
    if (this.newImageUrl) {
      this.isUploadingPhoto = true;
      this.authService.updateProfile({ profileImage: this.newImageUrl }).subscribe({
        next: (user: any) => {
          this.isUploadingPhoto = false;
          // Cache the new image string returned from the backend in localStorage as a fallback,
          // though we will be fetching it live in layouts soon.
          this.authService.setProfileImage(user?.profileImage || this.newImageUrl || null);
          this.profileImage = this.authService.getProfileImage();
          this.newImageUrl = this.profileImage;
          this.toastService.success('Profile photo updated successfully');
          
          setTimeout(() => {
            if (typeof window !== 'undefined') window.location.reload();
          }, 500);
        },
        error: (err: any) => {
          this.isUploadingPhoto = false;
          this.toastService.error(err.error?.message || 'Failed to save profile photo');
        }
      });
    }
  }

  // Password Logic
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isSubmittingPassword = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  get passwordValidations() {
    return {
      length: this.newPassword.length >= 8,
      uppercase: /[A-Z]/.test(this.newPassword),
      lowercase: /[a-z]/.test(this.newPassword),
      number: /\d/.test(this.newPassword),
      special: /[@$!%*?&#^]/.test(this.newPassword),
      noSpaces: this.newPassword.length > 0 && !this.newPassword.startsWith(' ') && !this.newPassword.endsWith(' '),
      notSame: this.newPassword.length > 0 && this.newPassword !== this.currentPassword,
      match: this.newPassword.length > 0 && this.newPassword === this.confirmPassword,
      allValid: false
    };
  }

  get isPasswordFormValid(): boolean {
    const v = this.passwordValidations;
    return v.length && v.uppercase && v.lowercase && v.number && v.special && v.noSpaces && v.notSame && v.match && !!this.currentPassword;
  }

  submitChangePassword() {
    if (!this.isPasswordFormValid) {
      return;
    }

    this.isSubmittingPassword = true;
    this.authService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.isSubmittingPassword = false;
        this.toastService.success('Password changed successfully');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err: any) => {
        this.isSubmittingPassword = false;
        const msg = err?.error?.message || 'Failed to change password.';
        this.toastService.error(Array.isArray(msg) ? msg[0] : msg);
      }
    });
  }

  logout() {
    if (confirm('Are you sure you want to sign out?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}
