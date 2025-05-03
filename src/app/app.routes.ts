import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./sign-up/sign-up.component').then(m => m.SignupComponent)
  },
  {
    path: 'app-find-events',
    loadComponent: () => import('./find-events/event.component').then(m => m.EventComponent)
  },
  {
    path: 'app-create-find-events',
    loadComponent: () => import('./create-event/create-event.component').then(m => m.CreateEventComponent)
  },
  {
    path: 'app-find-events/:id',
    loadComponent: () => import('./event-page/event-page.component').then(m => m.EventPageComponent)
  },
  {
    path: 'app-edit-events',
    loadComponent: () => import('./edit-events/edit-events.component').then(m => m.EditEventsComponent)
  },
];
