import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-loading-error',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  template: `
    <div class="loading-error-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
        <p class="loading-text">{{ loadingMessage || 'Ładowanie...' }}</p>
      </div>
      
      <!-- Error State -->
      <div *ngIf="errorMessage && !isLoading" class="error-state">
        <mat-icon class="error-icon">error</mat-icon>
        <p class="error-text">{{ errorMessage }}</p>
        <button 
          *ngIf="showRetryButton" 
          mat-raised-button 
          color="primary" 
          (click)="onRetry()">
          <mat-icon>refresh</mat-icon>
          Spróbuj ponownie
        </button>
      </div>
    </div>
  `,
  styles: [`
    .loading-error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .loading-text {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
    
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      max-width: 400px;
    }
    
    .error-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #f44336;
    }
    
    .error-text {
      margin: 0;
      color: #f44336;
      font-size: 0.9rem;
      line-height: 1.4;
    }
    
    button {
      margin-top: 0.5rem;
    }
  `]
})
export class LoadingErrorComponent {
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() loadingMessage: string = '';
  @Input() showRetryButton: boolean = true;
  @Input() onRetryClick: (() => void) | null = null;
  
  onRetry(): void {
    if (this.onRetryClick) {
      this.onRetryClick();
    }
  }
}