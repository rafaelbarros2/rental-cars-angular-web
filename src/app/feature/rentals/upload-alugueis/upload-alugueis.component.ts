import { Component, OnInit, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AluguelService, UploadStatus } from '../../../shared/services/aluguelService.service';

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
  providers: [MessageService, ConfirmationService, AluguelService]
})
export class UploadAlugueisComponent  {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;


  readonly MAX_FILE_SIZE_MB = 10; 
  uploadStatus = this.aluguelService.uploadStatus; 
  selectedFile: File | null = null;
  displayLogoutModal: boolean = false;

 constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private aluguelService: AluguelService,
  ) {
    effect(() => {
      const status = this.uploadStatus(); // Acessa o valor atual do signal
      if (status) {
        if (status.state === 'success') {
          this.messageService.add({ severity: 'success', summary: 'Upload Concluído', detail: status.message || 'Arquivo processado com sucesso!' });
          this.resetFileInput(); // Reseta o input file após sucesso
        } else if (status.state === 'error') {
          this.messageService.add({ severity: 'error', summary: 'Erro de Upload', detail: status.error || 'Ocorreu um erro durante o upload.' });
          this.resetFileInput(); // Reseta o input file em caso de erro
        }
      }
    });
  }

  getIsFileSelected(): boolean {
    return !!this.selectedFile;
  }


onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        this.messageService.clear();

        // Validação de tamanho do arquivo
        if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Erro de Seleção', 
                detail: `O arquivo excede o tamanho máximo de ${this.MAX_FILE_SIZE_MB}MB.` 
            });
            this.resetFileInput();
            return;
        }

        this.selectedFile = file;
        this.uploadStatus.set({ 
            state: 'idle', 
            filename: file.name 
        });
        
        console.log('📁 Arquivo selecionado:', file.name);
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
      const file = event.dataTransfer.files[0];
      this.messageService.clear();

      if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
        this.messageService.add({ severity: 'error', summary: 'Erro de Upload', detail: `O arquivo excede o tamanho máximo de ${this.MAX_FILE_SIZE_MB}MB.` });
        this.resetFileInput();
        return;
      }

      this.aluguelService.uploadRtnFile(file).subscribe();
    }
  }

removeFile(): void {
    this.selectedFile = null;
    this.uploadStatus.set({ state: 'idle' });
    this.resetFileInput();
    this.messageService.clear();
    console.log('🗑️ Arquivo removido');
}

resetFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
    this.selectedFile = null;
}

processFile(): void {
    if (!this.selectedFile) {
        this.messageService.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Nenhum arquivo selecionado para processar.' 
        });
        return;
    }

    console.log('🚀 Iniciando processamento do arquivo:', this.selectedFile.name);
    this.messageService.clear();

    this.aluguelService.uploadRtnFile(this.selectedFile).subscribe({
        next: (response) => {
            console.log('✅ Upload response:', response);
            

                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Processamento Concluído', 
                    detail: response,
                    life: 5000
                });

            this.removeFile();
            this.resetFileInput();
        },
        error: () => {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Erro no Processamento', 
                detail: 'Erro desconhecido ao processar o arquivo.',
                sticky: true 
            });
        },
        complete: () => {
            console.log('🏁 Processamento completado');
        }
    });
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
