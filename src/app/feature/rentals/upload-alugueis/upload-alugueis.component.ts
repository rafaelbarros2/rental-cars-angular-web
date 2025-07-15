import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

enum UploadState {
  Initial,
  Loading,
  Success,
  Error
}

@Component({
  selector: 'app-upload-alugueis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule
  ],
  templateUrl: './upload-alugueis.component.html',
  styleUrls: ['./upload-alugueis.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class UploadAlugueisComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  uploadState: UploadState = UploadState.Initial;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  readonly MAX_FILE_SIZE_MB = 10;

  displayLogoutModal: boolean = false;

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit(): void {

  }

  get UploadState() {
    return UploadState;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File): void {
    this.messageService.clear();

    if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
      this.messageService.add({ severity: 'error', summary: 'Erro de Upload', detail: `O arquivo excede o tamanho máximo de ${this.MAX_FILE_SIZE_MB}MB.` });
      this.resetUploadState();
      return;
    }

    this.selectedFile = file;
    this.uploadState = UploadState.Loading;
    this.uploadProgress = 0;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.uploadProgress = progress;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.uploadState = UploadState.Success;
          this.messageService.add({ severity: 'success', summary: 'Upload Concluído', detail: 'Arquivo pronto para processamento.' });
        }, 300);
      }
    }, 100);
  }

  removeFile(): void {
    this.selectedFile = null; // Garante que o arquivo selecionado seja nulo
    this.resetUploadState(); // Reseta o estado visual e o input
    this.messageService.clear();
    this.messageService.add({ severity: 'info', summary: 'Arquivo Removido', detail: 'O arquivo foi removido da área de upload.' });
  }

  resetUploadState(): void {
    this.uploadState = UploadState.Initial;
    this.uploadProgress = 0;
    // Limpa o valor do input de arquivo para permitir a seleção do mesmo arquivo novamente
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  processFile(): void {
    if (this.selectedFile) {
      this.messageService.add({ severity: 'success', summary: 'Processamento', detail: `Processando arquivo: ${this.selectedFile.name}` });
      this.resetUploadState();
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Nenhum arquivo para processar.' });
    }
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
      },
      reject: () => {
        this.messageService.add({severity:'error', summary:'Cancelado', detail:'Logout cancelado.'});
        this.displayLogoutModal = false;
      }
    });
  }
}
