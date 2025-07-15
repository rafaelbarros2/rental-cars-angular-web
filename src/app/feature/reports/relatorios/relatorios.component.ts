import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para ngModel
import { InputTextModule } from 'primeng/inputtext'; // Para campos de texto
import { DropdownModule } from 'primeng/dropdown'; // Para dropdown
import { ButtonModule } from 'primeng/button'; // Para botões
import { TableModule } from 'primeng/table'; // Para tabela
import { CalendarModule } from 'primeng/calendar'; // Para seletor de data
import { DialogModule } from 'primeng/dialog'; // Para o modal de logout
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Necessário para animações do PrimeNG
import { MessageService, ConfirmationService } from 'primeng/api'; // Para notificações e confirmações
import { ToastModule } from 'primeng/toast'; // Para exibir toasts
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Para exibir diálogos de confirmação

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
    ConfirmDialogModule // Importar aqui para usar no template
  ],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss'],
  providers: [MessageService, ConfirmationService] // Prover os serviços
})
export class RelatoriosComponent implements OnInit {
  // Propriedades para os filtros
  rentalDate: Date | undefined;
  carModels: any[] = [];
  selectedCarModel: any;

  // Dados da tabela
  relatorios: RelatorioItem[] = [];

  // Propriedades para o modal de logout
  displayLogoutModal: boolean = false;

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    // Inicializa as opções do dropdown de modelos de carro
    this.carModels = [
      { label: 'Todos', value: 'all' },
      { label: 'UNO', value: 'uno' },
      { label: 'PALIO', value: 'palio' },
      { label: 'GOL', value: 'gol' },
      { label: 'SIENA', value: 'siena' },
      { label: 'CELTA', value: 'celta' }
    ];
    this.selectedCarModel = this.carModels[0]; // Define 'Todos' como padrão

    // Carrega dados de exemplo para a tabela
    this.loadRelatorios();
  }

  loadRelatorios(): void {
    // Dados de exemplo, similar ao HTML estático
    this.relatorios = [
      { data: '30/09/2024', modelo: 'UNO', km: '50.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: true, valor: 'R$ 250,00' },
      { data: '30/09/2024', modelo: 'PALIO', km: '80.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: false, valor: 'R$ 200,00' },
      { data: '30/09/2024', modelo: 'GOL', km: '110.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: true, valor: 'R$ 250,00' },
      { data: '30/09/2024', modelo: 'SIENA', km: '200.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: true, valor: 'R$ 200,00' },
      { data: '30/09/2024', modelo: 'CELTA', km: '86.000', cliente: 'Jorge Amado Santos', telefone: '(99) 98109-2912', devolucao: '30/09/2024', pago: true, valor: 'R$ 200,00' }
    ];
  }

  buscar(): void {
    // Lógica para aplicar os filtros e buscar os relatórios
    // Aqui você faria uma chamada a um serviço para buscar os dados da API
    console.log('Buscando com filtros:', {
      data: this.rentalDate,
      modelo: this.selectedCarModel ? this.selectedCarModel.value : 'all'
    });
    this.messageService.add({severity:'info', summary:'Busca', detail:'Realizando busca dos relatórios...'});
    // Por enquanto, apenas recarrega os dados de exemplo
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
        // Lógica de logout real aqui
        this.messageService.add({severity:'success', summary:'Sucesso', detail:'Você foi desconectado.'});
        this.displayLogoutModal = false;
        // Redirecionar para a página de login, por exemplo
        // this.router.navigate(['/login']);
      },
      reject: () => {
        this.messageService.add({severity:'error', summary:'Cancelado', detail:'Logout cancelado.'});
        this.displayLogoutModal = false;
      }
    });
  }

  // Método para calcular a soma dos débitos (exemplo)
  get totalDebitos(): string {
    // Supondo que 'valor' seja uma string formatada, precisamos convertê-la para número
    const total = this.relatorios.reduce((sum, item) => {
      const valorNumerico = parseFloat(item.valor.replace('R$', '').replace(',', '.').trim());
      return sum + (item.pago ? 0 : valorNumerico); // Soma apenas se não estiver pago
    }, 0);
    return `R$ ${total.toFixed(2).replace('.', ',')}`;
  }
}
