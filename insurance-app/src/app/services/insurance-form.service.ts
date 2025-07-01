import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap, map } from 'rxjs/operators';
import { InsuranceFormData, PersonalData, PolicyData, FormStep } from '../models/insurance-form.model';

@Injectable({
  providedIn: 'root'
})
export class InsuranceFormService {
  private readonly apiUrl = 'http://localhost:3000/api'; // Change to the appropriate API URL
  
  private formDataSubject = new BehaviorSubject<InsuranceFormData>({
    personalData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      pesel: '',
      birthDate: null
    },
    policyData: {
      policyType: '',
      coverageAmount: null,
      startDate: null,
      additionalCoverage: []
    },
    termsAccepted: false
  });
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  private stepsSubject = new BehaviorSubject<FormStep[]>([
    { id: 1, title: 'Personal Data', isValid: false, isCompleted: false },
    { id: 2, title: 'Policy Details', isValid: false, isCompleted: false },
    { id: 3, title: 'Summary', isValid: false, isCompleted: false }
  ]);

  constructor(private http: HttpClient) { }

  formData$ = this.formDataSubject.asObservable();
  steps$ = this.stepsSubject.asObservable();
  
  getFormData(): Observable<InsuranceFormData> {
    return this.formDataSubject.asObservable();
  }
  
  getLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }
  
  getError(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }
  
  clearError(): void {
    this.errorSubject.next(null);
  }

  updatePersonalData(data: PersonalData): void {
    const currentData = this.formDataSubject.value;
    this.formDataSubject.next({
      ...currentData,
      personalData: data
    });
  }

  updatePolicyData(data: PolicyData): void {
    const currentData = this.formDataSubject.value;
    this.formDataSubject.next({
      ...currentData,
      policyData: {
        ...currentData.policyData,
        ...data
      }
    });
  }

  updateTermsAccepted(accepted: boolean): void {
    const currentData = this.formDataSubject.value;
    this.formDataSubject.next({
      ...currentData,
      termsAccepted: accepted
    });
  }

  updateStepStatus(stepId: number, isValid: boolean, isCompleted: boolean = false): void {
    const currentSteps = this.stepsSubject.value;
    const updatedSteps = currentSteps.map(step => 
      step.id === stepId ? { ...step, isValid, isCompleted } : step
    );
    this.stepsSubject.next(updatedSteps);
  }

  validatePesel(pesel: string): boolean {
    if (!pesel || pesel.length !== 11) {
      return false;
    }

    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    let sum = 0;

    for (let i = 0; i < 10; i++) {
      sum += parseInt(pesel[i]) * weights[i];
    }

    const checksum = (10 - (sum % 10)) % 10;
    return checksum === parseInt(pesel[10]);
  }

  getCurrentFormData(): InsuranceFormData {
    return this.formDataSubject.value;
  }

  resetForm(): void {
    this.formDataSubject.next({
      personalData: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        pesel: '',
        birthDate: null
      },
      policyData: {
        policyType: '',
        coverageAmount: null,
        startDate: null,
        additionalCoverage: []
      },
      termsAccepted: false
    });
    
    this.resetSteps();
  }
  
  // HTTP Methods
  submitForm(): Observable<any> {
    this.loadingSubject.next(true);
    this.clearError();
    
    const formData = this.formDataSubject.value;
    
    return this.http.post(`${this.apiUrl}/insurance-applications`, formData)
      .pipe(
        tap(response => {
          console.log('Form has been successfully submitted:', response);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }
  
  saveAsDraft(): Observable<any> {
    this.loadingSubject.next(true);
    this.clearError();
    
    const formData = this.formDataSubject.value;
    
    return this.http.post(`${this.apiUrl}/insurance-drafts`, formData)
      .pipe(
        tap(response => {
          console.log('Draft has been saved:', response);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }
  
  loadDraft(draftId: string): Observable<InsuranceFormData> {
    this.loadingSubject.next(true);
    this.clearError();
    
    return this.http.get<InsuranceFormData>(`${this.apiUrl}/insurance-drafts/${draftId}`)
      .pipe(
        tap(data => {
          this.formDataSubject.next(data);
          console.log('Draft has been loaded:', data);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      );
  }
  
  validatePeselOnline(pesel: string): Observable<boolean> {
    this.loadingSubject.next(true);
    this.clearError();
    
    return this.http.post<{valid: boolean}>(`${this.apiUrl}/validate-pesel`, { pesel })
      .pipe(
        tap(response => {
          console.log('PESEL validation:', response);
        }),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false)),
        map(response => response.valid)
      );
  }
  
  private resetSteps(): void {
    this.stepsSubject.next([
      { id: 1, title: 'Personal Data', isValid: false, isCompleted: false },
      { id: 2, title: 'Policy Details', isValid: false, isCompleted: false },
      { id: 3, title: 'Summary', isValid: false, isCompleted: false }
    ]);
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'No connection to server. Check your internet connection or contact the administrator.';
          break;
        case 400:
          errorMessage = 'Invalid form data';
          break;
        case 401:
          errorMessage = 'Unauthorized';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Server error';
          break;
        default:
          errorMessage = `Server error: ${error.status}`;
      }
    }
    
    this.errorSubject.next(errorMessage);
    console.error('HTTP Error:', error);
    
    return throwError(() => new Error(errorMessage));
  }
}