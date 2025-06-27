export interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pesel: string;
  birthDate: Date | null;
}

export interface PolicyData {
  policyType: string;
  coverageAmount: number | null;
  startDate: Date | null;
  additionalCoverage: string[];
}

export interface InsuranceFormData {
  personalData: PersonalData;
  policyData: PolicyData;
  termsAccepted: boolean;
}

export interface FormStep {
  id: number;
  title: string;
  isValid: boolean;
  isCompleted: boolean;
}