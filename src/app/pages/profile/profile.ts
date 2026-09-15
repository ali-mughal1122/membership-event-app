import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Category, CategoryUrgency, DataService, SupportConversation } from '../../services/data.service';
import { createApiState } from '../../core/api-state';
import { ModalComponent } from '../../components/modal/modal';
import { PaginationComponent } from '../../components/pagination/pagination';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ModalComponent, PaginationComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dataService = inject(DataService);

  email: string = '';
  profileImage: string = '';
  newImageUrl: string = '';

  isUploadingPhoto = false;

  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

  membershipState = createApiState<any>();

  conversations = signal<SupportConversation[]>([]);
  supportLoading = signal(false);
  supportPage = signal(1);
  supportLimit = signal(10);
  supportTotal = signal(0);
  supportTotalPages = signal(1);

  isAskOpen = signal(false);
  isSavingRequest = signal(false);
  categories = signal<Category[]>([]);
  newRequest = { categoryId: '', subject: '', message: '' };

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
    this.fetchSupport();
    this.dataService.getCategoryOptions().subscribe({
      next: (categories) => this.categories.set(categories || []),
      error: () => {}
    });
    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'help') {
        setTimeout(() => this.scrollToHelp(), 80);
      }
    });
  }

  private scrollToHelp() {
    document.getElementById('help')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  fetchSupport() {
    this.supportLoading.set(true);
    this.dataService.getMySupportConversations({
      page: this.supportPage(),
      limit: this.supportLimit(),
    }).subscribe({
      next: (res) => {
        this.conversations.set(res.data || []);
        this.supportTotal.set(res.total);
        this.supportTotalPages.set(res.totalPages);
        this.supportPage.set(res.page);
        this.supportLoading.set(false);
      },
      error: () => this.supportLoading.set(false)
    });
  }

  openAskModal() {
    this.newRequest = { categoryId: this.categories()[0]?.id || '', subject: '', message: '' };
    this.isAskOpen.set(true);
  }

  selectedCategory() {
    return this.categories().find(category => category.id === this.newRequest.categoryId);
  }

  submitSupportRequest() {
    const categoryId = this.newRequest.categoryId;
    const subject = this.newRequest.subject.trim();
    const message = this.newRequest.message.trim();
    if (!categoryId || !subject || !message) {
      this.toastService.error('Category, subject, and message are required.');
      return;
    }
    this.isSavingRequest.set(true);
    this.dataService.createSupportConversation({ categoryId, subject, message }).subscribe({
      next: (conversation) => {
        this.isSavingRequest.set(false);
        this.isAskOpen.set(false);
        this.toastService.success('Support request sent.');
        this.router.navigate(['/profile/support', conversation.id]);
      },
      error: (err) => {
        this.isSavingRequest.set(false);
        this.toastService.error(err.error?.message || 'Failed to create support request.');
      }
    });
  }

  onSupportPageChange(page: number) {
    this.supportPage.set(page);
    this.fetchSupport();
  }

  onSupportLimitChange(limit: number) {
    this.supportLimit.set(limit);
    this.supportPage.set(1);
    this.fetchSupport();
  }

  urgencyLabel(urgency?: string) {
    switch (urgency) {
      case 'CRITICAL': return 'Critical';
      case 'HIGH': return 'High';
      case 'MEDIUM': return 'Medium';
      case 'LOW': return 'Low';
      default: return urgency || '';
    }
  }

  urgencyHint(urgency?: CategoryUrgency) {
    switch (urgency) {
      case 'CRITICAL': return 'Handled first';
      case 'HIGH': return 'Handled quickly';
      case 'MEDIUM': return 'Normal priority';
      case 'LOW': return 'Can wait';
      default: return '';
    }
  }

  formatDateTime(value?: string) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
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
