import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'posta-gate-security', loadComponent: () => import('./pages/posta-gate/posta-gate.component').then(m => m.PostaGate), title: 'Posta Gate — AI-Powered Email Security | WorldPosta' },
  { path: 'our-story', loadComponent: () => import('./pages/our-story/our-story.component').then(m => m.OurStory), title: 'Our Story | WorldPosta' },
  { path: 'posta-portal', loadComponent: () => import('./pages/posta-portal/posta-portal.component').then(m => m.PostaPortal), title: 'Posta Portal — White-Label Email Administration | WorldPosta' },
  { path: 'cloud-based-soc-solutions', loadComponent: () => import('./pages/wpsys-soc/wpsys-soc.component').then(m => m.WpsysSoc), title: 'WPSYS SOC — Cloud-Based SOC Solutions | WorldPosta' },
  { path: 'it-software-automation-tools', loadComponent: () => import('./pages/it-automation/it-automation.component').then(m => m.ItAutomation), title: 'IT Automation | WorldPosta' },
  { path: 'sap-basis-operations', loadComponent: () => import('./pages/sap-basis-operations/sap-basis-operations.component').then(m => m.SapBasisOperations), title: 'SAP Basis Operations | WorldPosta' },
  { path: 'drive', loadComponent: () => import('./pages/drive/drive.component').then(m => m.Drive), title: 'Posta Drive | WorldPosta' },
  { path: 'wpsys', loadComponent: () => import('./pages/wpsys/wpsys.component').then(m => m.Wpsys), title: 'WPSYS — Managed IT Solutions | WorldPosta' },
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







