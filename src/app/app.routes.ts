import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, publicNoAuthGuard, clientGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout').then(m => m.PublicLayout),
    children: [
      { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
      { path: 'login', canActivate: [publicNoAuthGuard], loadComponent: () => import('./pages/login/login').then(m => m.Login) },
      { path: 'forgot-password', canActivate: [publicNoAuthGuard], loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword) },
      { path: 'memberships', loadComponent: () => import('./pages/memberships/memberships').then(m => m.Memberships) },
      { path: 'profile', canActivate: [clientGuard], loadComponent: () => import('./pages/profile/profile').then(m => m.Profile) },
      { path: 'events', loadComponent: () => import('./pages/events/events').then(m => m.Events) },
      { path: 'events/:slug', loadComponent: () => import('./pages/event-details/event-details').then(m => m.EventDetails) },
      { path: 'about', loadComponent: () => import('./pages/about-us/about-us').then(m => m.AboutUs) },
      { path: 'contact', loadComponent: () => import('./pages/contact-us/contact-us').then(m => m.ContactUs) },
    ]
  },
  {
    path: 'admin',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { 
        path: 'login', 
        canActivate: [noAuthGuard],
        loadComponent: () => import('./pages/admin/login/login').then(m => m.AdminLogin) 
      },
      {
        path: '',
        canActivate: [adminGuard],
        loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
        children: [
          { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard) },
          { path: 'members', loadComponent: () => import('./pages/admin/members/members').then(m => m.AdminMembers) },
          { path: 'plans', loadComponent: () => import('./pages/admin/plans/plans').then(m => m.AdminPlans) },
          { path: 'registered-users', loadComponent: () => import('./pages/admin/registered-users/registered-users').then(m => m.AdminRegisteredUsers) },
          { path: 'memberships', redirectTo: 'members', pathMatch: 'full' },
          { path: 'events', loadComponent: () => import('./pages/admin/manage-events/manage-events').then(m => m.ManageEvents) },
        ]
      }
    ]
  }
];
