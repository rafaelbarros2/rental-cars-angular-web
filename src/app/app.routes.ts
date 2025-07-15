import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { HomeComponent } from './feature/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'relatorios',
        loadComponent: () => import('./feature/reports/relatorios/relatorios.component').then(m => m.RelatoriosComponent),
        title: 'Relatórios',
        data: { breadcrumb: 'Relatórios' } 
      },
      {
        path: 'alugueis-upload',
        loadComponent: () => import('./feature/rentals/upload-alugueis/upload-alugueis.component').then(m => m.UploadAlugueisComponent),
        title: 'Upload de Aluguéis',
        data: { breadcrumb: 'Aluguéis' } 
      },
      {
        path: 'home',
        component: HomeComponent,
        title: 'Home',
        data: { breadcrumb: 'Início' }
      }
    ]
  },

  { path: '**', redirectTo: 'home' } 
];