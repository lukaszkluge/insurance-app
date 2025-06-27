# Integracja z Backendem - Aplikacja Ubezpieczeniowa

## Przegląd

Aplikacja została rozszerzona o funkcjonalności HTTP i jest gotowa do integracji z backendem. Dodano obsługę stanów loading/error oraz metody do komunikacji z API.

## Dodane Funkcjonalności

### 1. HttpClient
- ✅ Dodano `provideHttpClient()` do `app.config.ts`
- ✅ Skonfigurowano dla całej aplikacji

### 2. Rozszerzony Serwis (`InsuranceFormService`)
- ✅ Dodano metody HTTP:
  - `submitForm()` - wysyłanie kompletnego formularza
  - `saveAsDraft()` - zapisywanie szkicu
  - `loadDraft(draftId)` - ładowanie szkicu
  - `validatePeselOnline(pesel)` - walidacja PESEL online

### 3. Obsługa Stanów Loading/Error
- ✅ Komponent `LoadingErrorComponent` z spinnerem i obsługą błędów
- ✅ Observables dla stanów loading i error w serwisie
- ✅ Snackbar notyfikacje dla użytkownika
- ✅ Obsługa błędów HTTP z odpowiednimi komunikatami

## Konfiguracja API

### URL API
W pliku `src/app/services/insurance-form.service.ts` zmień URL API:
```typescript
private readonly apiUrl = 'http://localhost:3000/api'; // Zmień na właściwy URL
```

### Wymagane Endpointy Backend

#### 1. Wysyłanie Formularza
```
POST /api/insurance-applications
Content-Type: application/json

Body: InsuranceFormData
```

#### 2. Zapisywanie Szkicu
```
POST /api/insurance-drafts
Content-Type: application/json

Body: InsuranceFormData
```

#### 3. Ładowanie Szkicu
```
GET /api/insurance-drafts/{draftId}

Response: InsuranceFormData
```

#### 4. Walidacja PESEL
```
POST /api/validate-pesel
Content-Type: application/json

Body: { "pesel": "string" }
Response: { "valid": boolean }
```

## Struktura Danych

### InsuranceFormData
```typescript
interface InsuranceFormData {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pesel: string;
    birthDate: Date | null;
  };
  policyData: {
    policyType: string;
    coverageAmount: number | null;
    startDate: Date | null;
    additionalCoverage: string[];
  };
  termsAccepted: boolean;
}
```

## Użycie w Komponentach

### Wysyłanie Formularza
```typescript
submitForm(): void {
  this.insuranceFormService.submitForm().subscribe({
    next: (response) => {
      // Sukces
    },
    error: (error) => {
      // Błąd jest automatycznie obsłużony przez serwis
    }
  });
}
```

### Zapisywanie Szkicu
```typescript
saveAsDraft(): void {
  this.insuranceFormService.saveAsDraft().subscribe({
    next: (response) => {
      // Szkic zapisany
    }
  });
}
```

### Obsługa Stanów Loading/Error
```typescript
// W komponencie
isLoading$ = this.insuranceFormService.getLoading();
error$ = this.insuranceFormService.getError();

// W template
<app-loading-error 
  [isLoading]="isLoading$ | async"
  [errorMessage]="error$ | async">
</app-loading-error>
```

## Obsługa Błędów

Serwis automatycznie obsługuje błędy HTTP:
- **400** - Nieprawidłowe dane w formularzu
- **401** - Brak autoryzacji
- **403** - Brak uprawnień
- **404** - Nie znaleziono zasobu
- **500** - Błąd serwera

Błędy są wyświetlane jako:
1. Snackbar notyfikacje
2. Komponent loading-error
3. Logi w konsoli

## Dodatkowe Funkcjonalności do Rozważenia

### 1. Interceptory HTTP
```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

### 2. Retry Logic
```typescript
// W serwisie
retryWhen(errors => 
  errors.pipe(
    delay(1000),
    take(3)
  )
)
```

### 3. Offline Support
```typescript
// Sprawdzanie połączenia
if (!navigator.onLine) {
  // Zapisz lokalnie
}
```

## Testowanie

### Mock Server (json-server)
```bash
npm install -g json-server
json-server --watch db.json --port 3000
```

### Przykład db.json
```json
{
  "insurance-applications": [],
  "insurance-drafts": [],
  "pesel-validations": []
}
```

## Bezpieczeństwo

1. **Walidacja po stronie serwera** - zawsze waliduj dane
2. **HTTPS** - używaj szyfrowanego połączenia
3. **CORS** - skonfiguruj odpowiednio
4. **Rate Limiting** - ogranicz liczbę requestów
5. **Sanityzacja** - czyść dane wejściowe

## Monitoring i Logi

```typescript
// Dodaj do serwisu
private logRequest(method: string, url: string, data?: any): void {
  console.log(`[${method}] ${url}`, data);
}
```

## Status Gotowości

- ✅ HttpClient skonfigurowany
- ✅ Metody HTTP w serwisie
- ✅ Obsługa loading/error
- ✅ UI komponenty zaktualizowane
- ✅ Snackbar notyfikacje
- ✅ Obsługa błędów HTTP
- ⏳ Konfiguracja URL API (do zmiany)
- ⏳ Implementacja backendu
- ⏳ Testowanie integracji

**Aplikacja jest gotowa do połączenia z backendem!**