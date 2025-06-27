const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/insurance-applications', (req, res) => {
  console.log('Otrzymano wniosek ubezpieczeniowy:', req.body);
  
  // Symulacja przetwarzania
  setTimeout(() => {
    res.status(200).json({
      success: true,
      message: 'Wniosek ubezpieczeniowy został pomyślnie złożony',
      applicationId: 'APP-' + Date.now(),
      submittedAt: new Date().toISOString()
    });
  }, 1000);
});

app.post('/api/insurance-drafts', (req, res) => {
  console.log('Zapisano szkic:', req.body);
  
  res.status(200).json({
    success: true,
    message: 'Szkic został zapisany',
    draftId: 'DRAFT-' + Date.now(),
    savedAt: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Coś poszło nie tak!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono endpoint' });
});

app.listen(port, () => {
  console.log(`Mock serwer działa na http://localhost:${port}`);
  console.log('Dostępne endpointy:');
  console.log('- POST /api/insurance-applications');
  console.log('- POST /api/insurance-drafts');
  console.log('- GET /api/health');
});