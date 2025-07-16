import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProcessamentoResult, WebSocketService } from './shared/services/websocket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService, WebSocketService]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'projeto-imobiliario';

  private wsSubscription: Subscription | undefined;
  private connectionSubscription: Subscription | undefined;

  constructor(
    private webSocketService: WebSocketService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    // Monitorar status da conexão
    this.connectionSubscription = this.webSocketService.connectionStatus$.subscribe(
      (isConnected: boolean) => {
        if (isConnected) {
          console.log('🎉 WebSocket conectado!');
          this.messageService.add({
            severity: 'info',
            summary: 'Conectado',
            detail: 'Notificações em tempo real ativadas',
            life: 3000
          });
        } else {
          console.log('⚠️ WebSocket desconectado');
        }
      }
    );

    // Escutar mensagens de processamento
    this.wsSubscription = this.webSocketService.messages$.subscribe(
      (result: ProcessamentoResult) => {
        this.handleProcessingResult(result);
      },
      (error: any) => {
        console.error('❌ Erro na subscrição WebSocket:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro de Comunicação',
          detail: 'Não foi possível receber o status do processamento em tempo real.',
          life: 7000
        });
      }
    );

    // Iniciar conexão
    this.webSocketService.connect();
  }

  private handleProcessingResult(result: ProcessamentoResult): void {
    console.log('🔔 Resultado do processamento:', result);
    
    if (result.temErros) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Processamento Concluído com Erros',
        detail: `${result.numErros} erros encontrados em ${result.totalLinhas} linhas processadas.`,
        life: 8000
      });
      
      // Log detalhado dos erros
      if (result.errosDetalhados && result.errosDetalhados.length > 0) {
        console.group('📋 Detalhes dos Erros:');
        result.errosDetalhados.forEach((erro, index) => {
          console.error(`Erro ${index + 1}:`, erro);
        });
        console.groupEnd();
      }
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Processamento Concluído',
        detail: `${result.totalLinhas} linhas processadas com sucesso!`,
        life: 5000
      });
    }

    // Emitir evento customizado para outros componentes recarregarem dados
    window.dispatchEvent(new CustomEvent('processamento-concluido', { 
      detail: result 
    }));
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}