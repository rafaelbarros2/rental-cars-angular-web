import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AluguelService, CarModelOption } from '../../../shared/services/aluguelService.service';

interface RelatorioItem {
  dataAluguel: string;
  modeloCarro: string;
  kmCarro: number;
  nomeCliente: string;
  telefoneCliente: string;
  dataDevolucao: string;
  valor: number;
  pago: string;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, DropdownModule,
    ButtonModule, TableModule, CalendarModule, DialogModule,
    ToastModule, ConfirmDialogModule
  ],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss'],
  providers: [MessageService, ConfirmationService, AluguelService]
})
export class RelatoriosComponent implements OnInit {
  rentalDate: Date | undefined;
  selectedCarModel: CarModelOption | undefined;
  displayLogoutModal: boolean = false;

  relatorios = this.aluguelService.relatorios;
  relatoriosTotalElements = this.aluguelService.relatoriosTotalElements;
  carModelsOptions = this.aluguelService.carModelsOptions;
  relatoriosError = this.aluguelService.relatoriosError;
  carModelsError = this.aluguelService.carModelsError;
  relatoriosLoading = this.aluguelService.relatoriosLoading;
  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private aluguelService: AluguelService
  ) {
    effect(() => {
      const errorMsg = this.relatoriosError();
      if (errorMsg) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMsg });
      }
    });

    effect(() => {
      const errorMsg = this.carModelsError();
      if (errorMsg) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMsg });
      }
    });
  }

  ngOnInit(): void {
    this.aluguelService.listarModelosCarros().subscribe(() => {
      this.selectedCarModel = this.carModelsOptions()?.find(option => option.value === 'all');
    });

    this.buscar();
  }

  loadData(event: TableLazyLoadEvent): void {
    const page = event.first! / event.rows!;
    const size = event.rows!;
    const sortField = event.sortField || 'id';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    const sort = `${sortField},${sortOrder}`;

    const filters: { [key: string]: any } = {};
    if (this.rentalDate) {
      filters['dataAluguel'] = this.rentalDate.toISOString().split('T')[0];
    }
    if (this.selectedCarModel && this.selectedCarModel.value !== 'all') {
      filters['modeloCarro'] = this.selectedCarModel.value;
    }

    this.aluguelService.listarAlugueis(page, size, sort, filters).subscribe();
  }

  buscar(): void {
    const fakeEvent: TableLazyLoadEvent = { first: 0, rows: 10 };
    this.loadData(fakeEvent);
  }

  showLogoutModal(): void {
    this.displayLogoutModal = true;
  }

  confirmLogout(): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja sair?',
      header: 'Confirmação de Saída',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Você foi desconectado.' });
        this.displayLogoutModal = false;
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'Logout cancelado.' });
        this.displayLogoutModal = false;
      }
    });
  }

get totalDebitos(): string {
  const relatorios = this.relatorios() || [];
  const total = relatorios.reduce((sum, item) => {
    if (item.pago === true) {
      return sum + Number(item.valor);
    }
    return sum;
  }, 0);
  return `R$ ${total.toFixed(2).replace('.', ',')}`;
}
}