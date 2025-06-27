import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { InsuranceFormService } from '../../services/insurance-form.service';
import { PolicyData } from '../../models/insurance-form.model';

@Component({
  selector: 'app-policy-data-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './policy-data-step.component.html',
  styleUrls: ['./policy-data-step.component.scss']
})
export class PolicyDataStepComponent implements OnInit, OnDestroy {
  @Output() validityChange = new EventEmitter<boolean>();
  
  policyDataForm: FormGroup;
  private destroy$ = new Subject<void>();
  minDate = new Date();
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31);

  additionalBenefits = [
    {
      key: 'hospitalization',
      label: 'Hospitalizacja',
      description: 'Dodatkowe świadczenia w przypadku hospitalizacji',
      icon: 'local_hospital'
    },
    {
      key: 'seriousIllness',
      label: 'Ubezpieczenie od poważnych zachorowań',
      description: 'Ochrona finansowa w przypadku poważnych chorób',
      icon: 'health_and_safety'
    },
    {
      key: 'medicalAssistance',
      label: 'Assistance medyczny',
      description: '24/7 pomoc medyczna i konsultacje',
      icon: 'medical_services'
    },
    {
      key: 'dental',
      label: 'Opieka dentystyczna',
      description: 'Dodatkowa opieka stomatologiczna',
      icon: 'medical_services'
    },
    {
      key: 'vision',
      label: 'Opieka okulistyczna',
      description: 'Dodatkowa opieka okulistyczna',
      icon: 'visibility'
    },
    {
      key: 'physiotherapy',
      label: 'Fizjoterapia',
      description: 'Dostęp do zabiegów fizjoterapeutycznych',
      icon: 'fitness_center'
    },
    {
      key: 'alternative',
      label: 'Medycyna alternatywna',
      description: 'Wsparcie dla medycyny alternatywnej',
      icon: 'spa'
    },
    {
      key: 'prevention',
      label: 'Profilaktyka',
      description: 'Pakiet badań profilaktycznych',
      icon: 'favorite_border'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private insuranceFormService: InsuranceFormService
  ) {
    this.policyDataForm = this.createForm();
  }

  ngOnInit(): void {
    // Load existing data
    this.insuranceFormService.formData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        console.log('Loading existing policy data:', data.policyData);
        
        this.policyDataForm.patchValue({
          startDate: data.policyData.startDate ? new Date(data.policyData.startDate) : null,
          coverageAmount: data.policyData.coverageAmount
        }, { emitEvent: false });
        
        // Update additional coverage array
        const additionalCoverageArray = this.policyDataForm.get('additionalCoverage') as FormArray;
        additionalCoverageArray.clear();
        if (data.policyData.additionalCoverage && data.policyData.additionalCoverage.length > 0) {
          data.policyData.additionalCoverage.forEach(coverage => {
            additionalCoverageArray.push(this.fb.control(coverage));
          });
        }
        
        console.log('Form after loading data:', this.policyDataForm.value);
        console.log('Additional coverage array:', additionalCoverageArray.value);
      });

    // Watch form validity changes
    this.policyDataForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validityChange.emit(this.policyDataForm.valid);
      });

    // Watch form value changes
    this.policyDataForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        console.log('Form value changed:', value);
        console.log('Form valid:', this.policyDataForm.valid);
        console.log('Form errors:', this.policyDataForm.errors);
        
        // Always update data, even if form is not fully valid
        const policyData: PolicyData = {
          policyType: 'standard',
          startDate: value.startDate || null,
          coverageAmount: value.coverageAmount || null,
          additionalCoverage: this.getSelectedCoverage()
        };
        console.log('Coverage amount from form:', value.coverageAmount);
        console.log('Additional coverage from form:', value.additionalCoverage);
        console.log('Updating policy data:', policyData);
        this.insuranceFormService.updatePolicyData(policyData);
      });
      
    // Force initial data update
    const initialData: PolicyData = {
      policyType: 'standard',
      startDate: this.policyDataForm.value.startDate || null,
      coverageAmount: this.policyDataForm.value.coverageAmount || null,
      additionalCoverage: this.getSelectedCoverage()
    };
    console.log('Initial policy data update:', initialData);
    this.insuranceFormService.updatePolicyData(initialData);

    // Initial validity check
    this.validityChange.emit(this.policyDataForm.valid);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      startDate: [null, [Validators.required]],
      coverageAmount: [null, [Validators.required, Validators.min(10000), Validators.max(1000000)]],
      additionalCoverage: this.fb.array([])
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.policyDataForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;
    
    if (errors['required']) {
      return 'To pole jest wymagane';
    }
    
    if (errors['min']) {
      return `Minimalna suma ubezpieczenia to ${errors['min'].min.toLocaleString('pl-PL')} PLN`;
    }
    
    if (errors['max']) {
      return `Maksymalna suma ubezpieczenia to ${errors['max'].max.toLocaleString('pl-PL')} PLN`;
    }
    
    return 'Nieprawidłowa wartość';
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pl-PL') + ' PLN';
  }



  getSelectedCoverage(): string[] {
    const additionalCoverageArray = this.policyDataForm.get('additionalCoverage') as FormArray;
    const values = additionalCoverageArray.controls.map(control => control.value);
    console.log('Selected coverage values:', values);
    return values || [];
  }

  getSelectedCoverageLabels(): string[] {
    const selected = this.getSelectedCoverage();
    return selected.map(key => {
      const found = this.additionalBenefits.find(b => b.key === key);
      return found ? found.label : key;
    });
  }

  isCoverageSelected(coverageKey: string): boolean {
    const selectedCoverage = this.getSelectedCoverage();
    return selectedCoverage.includes(coverageKey);
  }

  toggleCoverage(coverageKey: string, isSelected: boolean): void {
    const additionalCoverageArray = this.policyDataForm.get('additionalCoverage') as FormArray;
    const currentCoverage = additionalCoverageArray.value || [];
    
    if (isSelected && !currentCoverage.includes(coverageKey)) {
      additionalCoverageArray.push(this.fb.control(coverageKey));
    } else if (!isSelected && currentCoverage.includes(coverageKey)) {
      const index = currentCoverage.indexOf(coverageKey);
      if (index > -1) {
        additionalCoverageArray.removeAt(index);
      }
    }
    
    // Force update policy data after coverage change
    const policyData: PolicyData = {
      policyType: 'standard',
      startDate: this.policyDataForm.value.startDate || null,
      coverageAmount: this.policyDataForm.value.coverageAmount || null,
      additionalCoverage: this.getSelectedCoverage()
    };
    console.log('Manual update from toggleCoverage:', policyData);
    this.insuranceFormService.updatePolicyData(policyData);
  }
}