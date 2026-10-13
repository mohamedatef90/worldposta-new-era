import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'link', loadComponent: () => import('./pages/link/link.component').then(m => m.PostaLink), title: 'Posta Link — Team Collaboration | WorldPosta' },
  { path: 'sap', loadComponent: () => import('./pages/sap/sap.component').then(m => m.Sap), title: 'SAP Cloud Operations | WorldPosta' },
  { path: 'seamless-migration', loadComponent: () => import('./pages/seamless-migration/seamless-migration.component').then(m => m.SeamlessMigration), title: 'Seamless Migration | WorldPosta' },
  { path: 'cloudspace', loadComponent: () => import('./pages/cloudspace/cloudspace.component').then(m => m.CloudSpace), title: 'CloudSpace — Collaboration & Productivity | WorldPosta' },
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
  {
    path: 'cloudedge',
    loadComponent: () => import('./pages/cloudedge/cloudedge.component').then((module) => module.CloudEdgeComponent),
    title: 'CloudEdge — Scalable Cloud Infrastructure | WorldPosta',
  },
  { path: '**', redirectTo: '' },
];




