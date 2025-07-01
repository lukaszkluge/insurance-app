import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { InsuranceFormService } from '../../services/insurance-form.service';
import { FormStep } from '../../models/insurance-form.model';
import { PersonalDataStepComponent } from '../personal-data-step/personal-data-step.component';
import { PolicyDataStepComponent } from '../policy-data-step/policy-data-step.component';
import { SummaryStepComponent } from '../summary-step/summary-step.component';
import { LoadingErrorComponent } from '../loading-error/loading-error.component';

@Component({
  selector: 'app-insurance-form',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    PersonalDataStepComponent,
    PolicyDataStepComponent,
    SummaryStepComponent,
    LoadingErrorComponent
  ],
  templateUrl: './insurance-form.component.html',
  styleUrls: ['./insurance-form.component.scss']
})
export class InsuranceFormComponent implements OnInit, OnDestroy {
  steps: FormStep[] = [];
  currentStep = 0;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private insuranceFormService: InsuranceFormService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.insuranceFormService.steps$
      .pipe(takeUntil(this.destroy$))
      .subscribe(steps => {
        this.steps = steps;
      });
      
    this.insuranceFormService.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
      
    this.insuranceFormService.getError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
        if (error) {
          this.snackBar.open(error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1 && this.steps[this.currentStep].isValid) {
      this.insuranceFormService.updateStepStatus(this.currentStep + 1, false, true);
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    return this.steps[this.currentStep]?.isValid || false;
  }

  isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  onStepValidityChange(isValid: boolean): void {
    this.insuranceFormService.updateStepStatus(this.currentStep + 1, isValid);
  }

  onStepValidationChange(stepIndex: number, isValid: boolean): void {
    this.insuranceFormService.updateStepStatus(stepIndex + 1, isValid, false);
  }
  
  submitForm(): void {
    this.insuranceFormService.clearError();
    
    this.insuranceFormService.submitForm().subscribe({
      next: (response) => {
        this.snackBar.open('Form has been successfully submitted!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        // Opcjonalnie: przekierowanie lub reset formularza
        // this.insuranceFormService.resetForm();
      },
      error: (error) => {
        console.error('Error while submitting the form:', error);
      }
    });
  }
  
  saveAsDraft(): void {
    this.insuranceFormService.clearError();
    
    this.insuranceFormService.saveAsDraft().subscribe({
      next: (response) => {
        this.snackBar.open('Draft has been saved!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error while saving the draft:', error);
      }
    });
  }
  
  clearError(): void {
    this.insuranceFormService.clearError();
  }
}