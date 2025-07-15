import { Router, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TOOGLE_SIDEBAR } from './layout.animation';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../template/header/header.component';
import { SideMenuComponent } from '../template/side-menu/side-menu.component';
import { FooterComponent } from '../template/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    HeaderComponent,
    SideMenuComponent,
    FooterComponent,
    RouterOutlet,
    ToastModule,
    ConfirmDialogModule,
    BreadcrumbModule,
  ],
  providers: [MessageService, ConfirmationService],
  animations: [TOOGLE_SIDEBAR],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  items!: MenuItem[];

  breadcumbs: MenuItem[] = [];

  breadcumbsHome: MenuItem = { icon: 'pi pi-home', label: 'Início' };

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'Home',
        icon: 'fa fa-home fa-lg',
        routerLink: '/home'
      },
      {
        label: 'Aluguéis',
        icon: 'fa fa-file-text-o',
        routerLink: '/alugueis-upload'
      },
      {
        label: 'Relatórios',
        icon: 'fa fa-bar-chart',
        routerLink: '/relatorios'
      }
    ];


    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.breadcumbs = this.getBreadcrumbFromRoute(this.activatedRoute.root);
    });

    this.breadcumbs = this.getBreadcrumbFromRoute(this.activatedRoute.root);
  }

  isOpenMenu: boolean = true;

  exibirMenu(value: boolean) {
    this.isOpenMenu = value;
  }

  hasOpen(): string {
    return this.isOpenMenu ? 'open' : 'closed';
  }

  private getBreadcrumbFromRoute(route: ActivatedRoute): MenuItem[] {
    let breadcrumbLabel: string | null = null;
    let deepestActiveRouteWithBreadcrumb: ActivatedRoute | null = null;

    const findDeepestBreadcrumb = (r: ActivatedRoute) => {
        if (r.snapshot.data && r.snapshot.data['breadcrumb']) {
            deepestActiveRouteWithBreadcrumb = r;
        }
        const primaryChild = r.children.find(child => child.outlet === 'primary');
        if (primaryChild) {
            findDeepestBreadcrumb(primaryChild);
        }
    };

    findDeepestBreadcrumb(route);
    if (deepestActiveRouteWithBreadcrumb) {
        breadcrumbLabel = (deepestActiveRouteWithBreadcrumb as ActivatedRoute).snapshot.data['breadcrumb'];
    }
    return breadcrumbLabel ? [{ label: breadcrumbLabel }] : [];
  }
}
