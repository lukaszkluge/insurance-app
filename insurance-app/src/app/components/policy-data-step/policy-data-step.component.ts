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
      label: 'Hospitalization',
      description: 'Additional benefits in case of hospitalization',
      icon: 'local_hospital'
    },
    {
      key: 'seriousIllness',
      label: 'Serious Illness Insurance',
      description: 'Financial protection in case of serious diseases',
      icon: 'health_and_safety'
    },
    {
      key: 'medicalAssistance',
      label: 'Medical Assistance',
      description: '24/7 medical help and consultations',
      icon: 'medical_services'
    },
    {
      key: 'dental',
      label: 'Dental Care',
      description: 'Additional dental care',
      icon: 'medical_services'
    },
    {
      key: 'vision',
      label: 'Vision Care',
      description: 'Additional vision care',
      icon: 'visibility'
    },
    {
      key: 'physiotherapy',
      label: 'Physiotherapy',
      description: 'Access to physiotherapy treatments',
      icon: 'fitness_center'
    },
    {
      key: 'alternative',
      label: 'Alternative Medicine',
      description: 'Support for alternative medicine',
      icon: 'spa'
    },
    {
      key: 'prevention',
      label: 'Prevention',
      description: 'Preventive examination package',
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
        
        // Prevent recursive update by comparing values
        const current = this.policyDataForm.value;
        const newStartDate = data.policyData.startDate ? new Date(data.policyData.startDate) : null;
        const newCoverageAmount = data.policyData.coverageAmount;
        const newAdditionalCoverage = data.policyData.additionalCoverage || [];
        let changed = false;
        if (current.startDate?.toString() !== newStartDate?.toString()) changed = true;
        if (current.coverageAmount !== newCoverageAmount) changed = true;
        const currentCoverage = (this.policyDataForm.get('additionalCoverage') as FormArray).value || [];
        if (JSON.stringify(currentCoverage) !== JSON.stringify(newAdditionalCoverage)) changed = true;
        if (changed) {
          this.policyDataForm.patchValue({
            startDate: newStartDate,
            coverageAmount: newCoverageAmount
          }, { emitEvent: false });
          // Update additional coverage array
          const additionalCoverageArray = this.policyDataForm.get('additionalCoverage') as FormArray;
          additionalCoverageArray.clear();
          if (newAdditionalCoverage.length > 0) {
            newAdditionalCoverage.forEach(coverage => {
              additionalCoverageArray.push(this.fb.control(coverage));
            });
          }
        }
        console.log('Form after loading data:', this.policyDataForm.value);
        console.log('Additional coverage array:', (this.policyDataForm.get('additionalCoverage') as FormArray).value);
      });

    // Watch form validity changes
    this.policyDataForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validityChange.emit(this.policyDataForm.valid);
      });

    // Watch form value changes
    let lastPolicyData: PolicyData | null = null;
    this.policyDataForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        console.log('Form value changed:', value);
        console.log('Form valid:', this.policyDataForm.valid);
        console.log('Form errors:', this.policyDataForm.errors);
        
        // Only update data if it actually changed
        const policyData: PolicyData = {
          policyType: 'standard',
          startDate: value.startDate || null,
          coverageAmount: value.coverageAmount || null,
          additionalCoverage: this.getSelectedCoverage()
        };
        if (!lastPolicyData || JSON.stringify(lastPolicyData) !== JSON.stringify(policyData)) {
          console.log('Coverage amount from form:', value.coverageAmount);
          console.log('Additional coverage from form:', value.additionalCoverage);
          console.log('Updating policy data:', policyData);
          this.insuranceFormService.updatePolicyData(policyData);
          lastPolicyData = policyData;
        } else {
          console.log('No change in policy data, skipping update.');
        }
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
      return `Minimum coverage amount is ${errors['min'].min.toLocaleString('en-US')} EUR`;
    }
    
    if (errors['max']) {
      return `Maximum coverage amount is ${errors['max'].max.toLocaleString('en-US')} EUR`;
    }
    
    return 'Invalid value';
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('en-US') + ' EUR';
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
    console.log(`Toggling coverage ${coverageKey} to ${isSelected}`);
    const additionalCoverageArray = this.policyDataForm.get('additionalCoverage') as FormArray;
    const currentCoverage = additionalCoverageArray.value || [];
    console.log('Current coverage before toggle:', currentCoverage);
    
    if (isSelected && !currentCoverage.includes(coverageKey)) {
      console.log(`Adding ${coverageKey} to coverage array`);
      additionalCoverageArray.push(this.fb.control(coverageKey));
    } else if (!isSelected && currentCoverage.includes(coverageKey)) {
      const index = currentCoverage.indexOf(coverageKey);
      console.log(`Removing ${coverageKey} from coverage array at index ${index}`);
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
    console.log('Additional coverage after toggle:', this.getSelectedCoverage());
    this.insuranceFormService.updatePolicyData(policyData);
  }
}