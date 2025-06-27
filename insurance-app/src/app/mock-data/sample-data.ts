import { InsuranceFormData } from '../models/insurance-form.model';

// Przykładowe dane do testowania formularza
export const SAMPLE_INSURANCE_DATA: InsuranceFormData = {
  personalData: {
    firstName: 'Jan',
    lastName: 'Kowalski',
    pesel: '85010112345',
    email: 'jan.kowalski@example.com',
    phone: '+48 123 456 789',
    birthDate: null
  },
  policyData: {
    policyType: 'standard',
    startDate: new Date('2025-02-01'),
    coverageAmount: 250000,
    additionalCoverage: ['hospitalization', 'medicalAssistance']
  },
  termsAccepted: true
};

// Dodatkowe przykładowe dane dla różnych scenariuszy testowych
export const SAMPLE_DATA_VARIANTS: InsuranceFormData[] = [
  {
    personalData: {
      firstName: 'Anna',
      lastName: 'Nowak',
      pesel: '90020298765',
      email: 'anna.nowak@gmail.com',
      phone: '987654321',
      birthDate: null
    },
    policyData: {
      policyType: 'premium',
      startDate: new Date('2024-03-15'),
      coverageAmount: 500000,
      additionalCoverage: ['hospitalization', 'seriousIllness', 'medicalAssistance']
    },
    termsAccepted: true
  },
  {
    personalData: {
      firstName: 'Piotr',
      lastName: 'Wiśniewski',
      pesel: '75121567890',
      email: 'piotr.wisniewski@outlook.com',
      phone: '+48 555 123 456',
      birthDate: null
    },
    policyData: {
      policyType: 'basic',
      startDate: new Date('2024-01-20'),
      coverageAmount: 100000,
      additionalCoverage: []
    },
    termsAccepted: true
  },
  {
    personalData: {
      firstName: 'Maria',
      lastName: 'Zielińska',
      pesel: '88030387654',
      email: 'maria.zielinska@company.pl',
      phone: '600700800',
      birthDate: null
    },
    policyData: {
      policyType: 'premium',
      startDate: new Date('2024-04-01'),
      coverageAmount: 750000,
      additionalCoverage: ['hospitalization', 'seriousIllness']
    },
    termsAccepted: true
  }
];

// Funkcja pomocnicza do załadowania przykładowych danych
export function loadSampleData(variant: number = 0): InsuranceFormData {
  if (variant === 0) {
    return SAMPLE_INSURANCE_DATA;
  }
  
  if (variant > 0 && variant <= SAMPLE_DATA_VARIANTS.length) {
    return SAMPLE_DATA_VARIANTS[variant - 1];
  }
  
  // Zwróć pierwszy wariant jeśli podano nieprawidłowy numer
  return SAMPLE_DATA_VARIANTS[0];
}

// Funkcja do generowania losowych danych testowych
export function generateRandomSampleData(): InsuranceFormData {
  const firstNames = ['Jan', 'Anna', 'Piotr', 'Maria', 'Tomasz', 'Katarzyna', 'Michał', 'Agnieszka'];
  const lastNames = ['Kowalski', 'Nowak', 'Wiśniewski', 'Zielińska', 'Lewandowski', 'Kamińska', 'Dąbrowski', 'Szymańska'];
  const domains = ['gmail.com', 'outlook.com', 'wp.pl', 'onet.pl', 'company.pl'];
  
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  
  // Generuj losowy PESEL (uproszczona wersja - tylko dla testów)
  const randomPesel = '8' + Math.floor(Math.random() * 10) + '0' + 
                     Math.floor(Math.random() * 10) + '0' + 
                     Math.floor(Math.random() * 10) + 
                     Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  
  const randomAmount = [100000, 250000, 500000, 750000, 1000000][Math.floor(Math.random() * 5)];
  
  const availableCoverage = ['hospitalization', 'seriousIllness', 'medicalAssistance', 'dental', 'vision', 'physiotherapy'];
  const selectedCoverage = availableCoverage.filter(() => Math.random() > 0.5);
  
  return {
    personalData: {
      firstName: randomFirstName,
      lastName: randomLastName,
      pesel: randomPesel,
      email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@${randomDomain}`,
      phone: `+48 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`,
      birthDate: null
    },
    policyData: {
      policyType: 'standard',
      startDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
      coverageAmount: randomAmount,
      additionalCoverage: selectedCoverage
    },
    termsAccepted: true
  };
}