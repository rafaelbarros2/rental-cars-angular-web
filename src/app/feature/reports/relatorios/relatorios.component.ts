import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { InputTextModule } from 'primeng/inputtext'; 
import { DropdownModule } from 'primeng/dropdown'; 
import { ButtonModule } from 'primeng/button'; 
import { TableModule } from 'primeng/table'; 
import { CalendarModule } from 'primeng/calendar'; 
import { DialogModule } from 'primeng/dialog'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { MessageService, ConfirmationService } from 'primeng/api'; 
import { ToastModule } from 'primeng/toast'; 
import { ConfirmDialogModule } from 'primeng/confirmdialog'; 

interface RelatorioItem {
  data: string;
  modelo: string;
  km: string;
  cliente: string;
  telefone: string;
  devolucao: string;
  pago: boolean;
  valor: string;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    CalendarModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule 
  ],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss'],
  providers: [MessageService, ConfirmationService] 
})
export class RelatoriosComponent implements OnInit {
  // Propriedades para os filtros
  rentalDate: Date | undefined;
  carModels: any[] = [];
  selectedCarModel: any;

  relatorios: RelatorioItem[] = [];

  displayLogoutModal: boolean = false;

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.carModels = [
      { label: 'Todos', value: 'all' },
      { label: 'UNO', value: 'uno' },
      { label: 'PALIO', value: 'palio' },
      { label: 'GOL', value: 'gol' },
      { label: 'SIENA', value: 'siena' },
      { label: 'CELTA', value: 'celta' }
    ];
    this.selectedCarModel = this.carModels[0]; 

    this.loadRelatorios();
  }

  loadRelatorios(): void {
    this.relatorios = [
      { data: '30/09/2024', modelo: 'UNO', km: '50.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: true, valor: 'R$ 250,00' },
      { data: '30/09/2024', modelo: 'PALIO', km: '80.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: false, valor: 'R$ 200,00' },
      { data: '30/09/2024', modelo: 'GOL', km: '110.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: true, valor: 'R$ 250,00' },
      { data: '30/09/2024', modelo: 'SIENA', km: '200.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: true, valor: 'R$ 200,00' },
      { data: '30/09/2024', modelo: 'CELTA', km: '86.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: true, valor: 'R$ 200,00' }
    ];
  }

  buscar(): void {

    console.log('Buscando com filtros:', {
      data: this.rentalDate,
      modelo: this.selectedCarModel ? this.selectedCarModel.value : 'all'
    });
    this.messageService.add({severity:'info', summary:'Busca', detail:'Realizando busca dos relatórios...'});
    this.loadRelatorios();
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
        this.messageService.add({severity:'success', summary:'Sucesso', detail:'Você foi desconectado.'});
        this.displayLogoutModal = false;
        // this.router.navigate(['/login']);
      },
      reject: () => {
        this.messageService.add({severity:'error', summary:'Cancelado', detail:'Logout cancelado.'});
        this.displayLogoutModal = false;
      }
    });
  }

  get totalDebitos(): string {
    const total = this.relatorios.reduce((sum, item) => {
      const valorNumerico = parseFloat(item.valor.replace('R$', '').replace(',', '.').trim());
      return sum + (item.pago ? 0 : valorNumerico); 
    }, 0);
    return `R$ ${total.toFixed(2).replace('.', ',')}`;
  }
}
