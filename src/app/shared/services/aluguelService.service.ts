import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ListarAlugueisQueryResultItem {
  [x: string]: any;
  dataAluguel: string;
  modeloCarro: string;
  kmCarro: string;
  nomeCliente: string;
  telefoneCliente: string;
  dataDevolucao: string;
  pago: boolean;
  valor: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UploadStatus {
  state: 'idle' | 'uploading' | 'success' | 'warning' | 'error';
  filename?: string;
  progress?: number;
  message?: string;
  error?: string;
  details?: {
    totalLinhas: number;
    sucessos: number;
    numErros: number;
    errosDetalhados: Array<{
      linha: number;
      mensagem: string;
      tipo: string;
    }>;
  };
}

export interface CarModelOption {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class AluguelService {
  private apiUrl = environment.apiUrl + '/alugueis';
  private carrosApiUrl = environment.apiUrl + '/carros';

  public relatorios: WritableSignal<ListarAlugueisQueryResultItem[]> = signal([]);
  public relatoriosLoading: WritableSignal<boolean> = signal(false);
  public relatoriosError: WritableSignal<string | null> = signal(null);
  public relatoriosTotalElements: WritableSignal<number> = signal(0);

  public carModelsOptions: WritableSignal<CarModelOption[]> = signal([]);
  public carModelsLoading: WritableSignal<boolean> = signal(false);
  public carModelsError: WritableSignal<string | null> = signal(null);

  public uploadStatus: WritableSignal<UploadStatus> = signal({ state: 'idle' });

  constructor(private http: HttpClient) { }

  uploadRtnFile(file: File): Observable<any> {
    this.uploadStatus.set({ state: 'uploading', filename: file.name, progress: 0 });
    const formData = new FormData();
    formData.append('file', file);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      this.uploadStatus.update(status => ({ ...status, progress: Math.min(progress, 99) }));
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);

    return this.http.post(`${this.apiUrl}/upload`, formData, { responseType: 'text' }).pipe(
      tap((response: string) => {
        clearInterval(interval);
        this.uploadStatus.set({
          state: 'success',
          filename: file.name,
          message: response || 'Upload realizado com sucesso.'
        });
      }),
      catchError(error => {
        clearInterval(interval);
        let errorMessage = 'Erro desconhecido ao enviar o arquivo.';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        this.uploadStatus.set({
          state: 'error',
          filename: file.name,
          error: errorMessage
        });
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
      })
    );
  }

  listarAlugueis(
    page: number = 0,
    size: number = 10,
    sort: string = 'dataAluguel,DESC',
    filters?: { [key: string]: any }
  ): Observable<Page<ListarAlugueisQueryResultItem>> {
    this.relatoriosLoading.set(true);
    this.relatoriosError.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.append(key, filters[key].toString());
        }
      });
    }

    return this.http.get<Page<ListarAlugueisQueryResultItem>>(this.apiUrl, { params }).pipe(
      tap(response => {
        this.relatorios.set(response.content);
        this.relatoriosTotalElements.set(response.totalElements);
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Erro ao carregar aluguéis.';
        this.relatoriosError.set(errorMessage);
        this.relatorios.set([]);
        this.relatoriosTotalElements.set(0);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this.relatoriosLoading.set(false);
      })
    );
  }

  listarModelosCarros(): Observable<string[]> {
    this.carModelsLoading.set(true);
    this.carModelsError.set(null);

    return this.http.get<string[]>(this.carrosApiUrl).pipe(
      tap(modelos => {
        const options: CarModelOption[] = [{ label: 'Todos', value: 'all' }];
        modelos.forEach(modelo => {
          if (modelo) {
            options.push({ label: modelo, value: modelo.toLowerCase() });
          }
        });
        this.carModelsOptions.set(options);
      }),
      catchError(error => {
        const errorMessage = error.error?.message || 'Erro ao carregar modelos de carros.';
        this.carModelsError.set(errorMessage);
        this.carModelsOptions.set([{ label: 'Todos', value: 'all' }]);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this.carModelsLoading.set(false);
      })
    );
  }
}