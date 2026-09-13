import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((module) => module.Home),
    title: 'WorldPosta | Scalable Cloud Infrastructure',
  },
  { path: '**', redirectTo: '' },
];
