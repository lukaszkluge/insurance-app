import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { InsuranceFormService } from '../../services/insurance-form.service';
import { InsuranceFormData } from '../../models/insurance-form.model';

@Component({
  selector: 'app-summary-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './summary-step.component.html',
  styleUrls: ['./summary-step.component.scss']
})
export class SummaryStepComponent implements OnInit, OnDestroy {
  @Output() validityChange = new EventEmitter<boolean>();
  
  summaryForm: FormGroup;
  formData: InsuranceFormData | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private insuranceFormService: InsuranceFormService
  ) {
    this.summaryForm = this.createForm();
  }

  ngOnInit(): void {
    // Load form data
    this.insuranceFormService.formData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('Summary received data:', data);
        console.log('Coverage amount:', data.policyData.coverageAmount);
        this.formData = data;
        this.summaryForm.patchValue({
          termsAccepted: data.termsAccepted
        }, { emitEvent: false });
      });

    // Watch form validity changes
    this.summaryForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validityChange.emit(this.summaryForm.valid);
      });

    // Watch terms acceptance changes
    this.summaryForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.insuranceFormService.updateTermsAccepted(value.termsAccepted);
      });

    // Initial validity check
    this.validityChange.emit(this.summaryForm.valid);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      termsAccepted: [false, [Validators.requiredTrue]]
    });
  }

  formatDate(date: Date | null): string {
    if (!date) return 'Nie wybrano';
    return date.toLocaleDateString('pl-PL');
  }

  formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) return '0 PLN';
    return amount.toLocaleString('pl-PL') + ' PLN';
  }

  getSelectedBenefits(): string[] {
    if (!this.formData?.policyData.additionalCoverage || this.formData.policyData.additionalCoverage.length === 0) {
      return [];
    }
    
    const benefits: string[] = [];
    const coverageData = this.formData.policyData.additionalCoverage;
    
    coverageData.forEach(coverage => {
      switch (coverage) {
        case 'hospitalization':
          benefits.push('Hospitalizacja');
          break;
        case 'seriousIllness':
          benefits.push('Ubezpieczenie od poważnych zachorowań');
          break;
        case 'medicalAssistance':
          benefits.push('Assistance medyczny');
          break;
        case 'dental':
          benefits.push('Opieka dentystyczna');
          break;
        case 'vision':
          benefits.push('Opieka okulistyczna');
          break;
        case 'physiotherapy':
          benefits.push('Fizjoterapia');
          break;
        case 'alternative':
          benefits.push('Medycyna alternatywna');
          break;
        case 'prevention':
          benefits.push('Profilaktyka zdrowotna');
          break;
        default:
          benefits.push(coverage);
          break;
      }
    });
    
    return benefits;
  }

  hasSelectedBenefits(): boolean {
    if (!this.formData?.policyData.additionalCoverage) return false;
    return this.formData.policyData.additionalCoverage.length > 0;
  }

  getEstimatedPremium(): number {
    if (!this.formData || !this.formData.policyData.coverageAmount) return 0;
    
    const baseAmount = this.formData.policyData.coverageAmount;
    let premium = baseAmount * 0.012; // 1.2% base premium
    
    // Add costs for additional coverage
    const additionalCoverage = this.formData.policyData.additionalCoverage;
    additionalCoverage.forEach(coverage => {
      switch (coverage) {
        case 'hospitalization':
          premium += 200;
          break;
        case 'seriousIllness':
          premium += 300;
          break;
        case 'medicalAssistance':
          premium += 150;
          break;
      }
    });
    
    return Math.round(premium);
  }
}