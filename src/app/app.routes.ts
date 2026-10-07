import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((module) => module.Home),
    title: 'WorldPosta | Scalable Cloud Infrastructure',
  },
  {
    path: 'posta',
    loadComponent: () => import('./pages/posta/posta.component').then((module) => module.PostaComponent),
    title: 'Posta — Secure Business Email | WorldPosta',
  },
  { path: '**', redirectTo: '' },
];
