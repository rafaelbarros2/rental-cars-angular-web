import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { HomeComponent } from './feature/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent,
        title: 'Home'
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./feature/reports/relatorios/relatorios.component').then(m => m.RelatoriosComponent),
        title: 'Relatórios'
      },
      {
        path: 'alugueis-upload', 
        loadComponent: () => import('./feature/rentals/upload-alugueis/upload-alugueis.component').then(m => m.UploadAlugueisComponent),
        title: 'Upload de Aluguéis'
      }
    ]
  },

  { path: '**', redirectTo: 'home' } 
];