import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ProcessamentoResult {
  temErros: boolean;
  numErros: number;
  totalLinhas: number;
  errosDetalhados?: any[];
  mensagem?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private messagesSubject = new Subject<ProcessamentoResult>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  
  public messages$ = this.messagesSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  connect(): void {
    if (this.stompClient?.connected) {
      return;
    }

    this.stompClient = new Client({
      // Usando SockJS para maior compatibilidade (mesmo endpoint do seu WebSocketConfig)
      webSocketFactory: () => new SockJS('http://localhost:8080/api/ws'),
      
      // Configurações de reconnect
      connectHeaders: {},
      debug: (str) => {
        console.log('🔍 STOMP Debug:', str);
      },
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: (frame) => {
        console.log('✅ WebSocket conectado via STOMP');
        this.connectionStatusSubject.next(true);
        this.subscribeToTopic();
      },
      
      onDisconnect: (frame) => {
        console.log('🔌 WebSocket desconectado');
        this.connectionStatusSubject.next(false);
      },
      
      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
        console.error('❌ Details:', frame.body);
        this.connectionStatusSubject.next(false);
      },
      
      onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error);
        this.connectionStatusSubject.next(false);
      }
    });

    this.stompClient.activate();
  }

  private subscribeToTopic(): void {
    if (this.stompClient?.connected) {
      this.stompClient.subscribe('/topic/processing-status', (message) => {
        try {
          const result: ProcessamentoResult = JSON.parse(message.body);
          console.log('📨 Mensagem recebida:', result);
          this.messagesSubject.next(result);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem:', error);
        }
      });
    }
  }

  disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
      this.connectionStatusSubject.next(false);
    }
  }

  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }
}