import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { HomeComponent } from './feature/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    // canActivate: [AuthGuard], // Descomente se o AuthGuard estiver ativo
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
        path: 'relatorios', // Nova rota para o componente de relatórios
        loadComponent: () => import('./feature/reports/relatorios/relatorios.component').then(m => m.RelatoriosComponent),
        title: 'Relatórios'
      }
    ]
  },
  // Adicione outras rotas de nível superior aqui, como login, etc.
  // { path: 'login', loadComponent: () => import('./feature/login/login.component').then(m => m.LoginComponent) },
  { path: '**', redirectTo: 'home' } // Rota curinga para redirecionar para home
];