import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Subject, takeUntil } from 'rxjs';
import { InsuranceFormService } from '../../services/insurance-form.service';

@Component({
  selector: 'app-personal-data-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './personal-data-step.component.html',
  styleUrls: ['./personal-data-step.component.scss']
})
export class PersonalDataStepComponent implements OnInit, OnDestroy {
  @Output() validityChange = new EventEmitter<boolean>();
  
  personalDataForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private insuranceFormService: InsuranceFormService
  ) {
    this.personalDataForm = this.createForm();
  }

  ngOnInit(): void {
    // Load existing data
    this.insuranceFormService.formData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.personalDataForm.patchValue(data.personalData, { emitEvent: false });
      });

    // Watch form validity changes
    this.personalDataForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validityChange.emit(this.personalDataForm.valid);
      });

    // Watch form value changes
    this.personalDataForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.personalDataForm.valid) {
          this.insuranceFormService.updatePersonalData(value);
        }
      });

    // Initial validity check
    this.validityChange.emit(this.personalDataForm.valid);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      pesel: ['', [Validators.required, this.peselValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9]{9,15}$/)]]
    });
  }

  private peselValidator(control: any) {
    if (!control.value) {
      return null;
    }
    
    const isValid = this.insuranceFormService.validatePesel(control.value);
    return isValid ? null : { invalidPesel: true };
  }

  getErrorMessage(fieldName: string): string {
    const field = this.personalDataForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;
    
    if (errors['required']) {
      return 'To pole jest wymagane';
    }
    
    if (errors['minlength']) {
      return `Minimum ${errors['minlength'].requiredLength} znaków`;
    }
    
    if (errors['maxlength']) {
      return `Maksimum ${errors['maxlength'].requiredLength} znaków`;
    }
    
    if (errors['email']) {
      return 'Nieprawidłowy format adresu e-mail';
    }
    
    if (errors['pattern']) {
      return 'Nieprawidłowy format numeru telefonu';
    }
    
    if (errors['invalidPesel']) {
      return 'Nieprawidłowy numer PESEL';
    }
    
    return 'Nieprawidłowa wartość';
  }
}