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
    path: 'app-find-rescue-events',
    loadComponent: () => import('./find-rescue-events/find-rescue-events.component').then(m => m.FindRescueEventsComponent)
  },
  {
    path: 'app-find-lost-animal-events',
    loadComponent: () => import('./find-lost-animal-events/find-lost-animal-events.component').then(m => m.FindLostAnimalEventsComponent)
  },
  {
    path: 'app-create-all-events',
    loadComponent: () => import('./create-all-events/create-all-events.component').then(m => m.CreateAllEventsComponent)
  },
  {
    path: 'app-find-events/:id',
    loadComponent: () => import('./event-page/event-page.component').then(m => m.EventPageComponent)
  },
  {
    path: 'app-find-rescue-events/:id',
    loadComponent: () => import('./rescue-event-page/rescue-event-page.component').then(m => m.RescueEventPageComponent)
  },
  {
    path: 'app-find-lost-animal-events/:id',
    loadComponent: () => import('./lost-animal-event-page/lost-animal-event-page.component').then(m => m.LostAnimalEventPageComponent)
  },
  {
    path: 'app-edit-all-events',
    loadComponent: () => import('./edit-all-events/edit-all-events.component').then(m => m.EditAllEventsComponent)
  },
  {
    path: 'app-edit-events',
    loadComponent: () => import('./edit-events/edit-events.component').then(m => m.EditEventsComponent)
  },
  {
    path: 'app-edit-general-event-page/:id',
    loadComponent: () => import('./edit-general-event-page/edit-general-event-page.component').then(m => m.EditGeneralEventPageComponent)
  },
];
