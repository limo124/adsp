// ============================================
// ADSPILOT AI - SERVER PRINCIPAL
// ============================================
// Version finale configurée et prête à l'emploi

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth-handler-final');

const app = express();

// ============================================
// CORS - Permet les requêtes du frontend
// ============================================
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:8000',
      'http://localhost:3000',
      'http://127.0.0.1:8000',
      'http://127.0.0.1:3000',
      'https://adspilotai.com',
      'https://www.adspilotai.com'
    ];
    
    // Autoriser les requêtes sans origin (Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      callback(null, true); // On autorise quand même pour le dev
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (Object.keys(req.query).length > 0) {
    console.log('   Query:', req.query);
  }
  next();
});

// ============================================
// ROUTES
// ============================================

// Page d'accueil de l'API
app.get('/', (req, res) => {
  res.json({
    name: 'AdsPilot AI Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /api/health',
      authStart: 'GET /api/auth/google',
      authCallback: 'GET /api/auth/callback/google',
      scan: 'POST /api/campaigns/scan'
    },
    documentation: 'See README.md for usage instructions'
  });
});

// Routes OAuth et Scan
app.use(authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: 'This endpoint does not exist'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// DÉMARRER LE SERVEUR
// ============================================
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.clear();
  console.log('━'.repeat(60));
  console.log('🚀 ADSPILOT AI - BACKEND DÉMARRÉ');
  console.log('━'.repeat(60));
  console.log('');
  console.log('✅ Serveur en ligne:');
  console.log(`   http://localhost:${PORT}`);
  console.log('');
  console.log('🔧 Configuration:');
  console.log(`   Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Client ID: ${process.env.GOOGLE_CLIENT_ID ? '✓ Configuré' : '✗ Manquant'}`);
  console.log(`   Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? '✓ Configuré' : '✗ Manquant'}`);
  console.log(`   Developer Token: ${process.env.GOOGLE_DEVELOPER_TOKEN ? '✓ Configuré' : '⚠️  Non configuré (optionnel)'}`);
  console.log('');
  console.log('🔗 Endpoints disponibles:');
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/google`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/callback/google`);
  console.log(`   POST http://localhost:${PORT}/api/campaigns/scan`);
  console.log('');
  console.log('⚙️  Google Cloud Console - Redirect URIs:');
  console.log(`   ✓ http://localhost:${PORT}/api/auth/callback/google`);
  console.log(`   ✓ ${process.env.BACKEND_URL || 'https://api.adspilotai.com'}/api/auth/callback/google`);
  console.log('');
  console.log('📱 Frontend:');
  console.log(`   Démarrez avec: python3 -m http.server 8000`);
  console.log(`   Puis ouvrez: http://localhost:8000/adspilot-scanner.html`);
  console.log('');
  console.log('━'.repeat(60));
  console.log('💡 Prêt à recevoir des requêtes!');
  console.log('━'.repeat(60));
  console.log('');
  
  // Vérifications
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error('⚠️  ATTENTION: GOOGLE_CLIENT_SECRET non configuré!');
    console.error('   OAuth ne fonctionnera pas.');
    console.error('   Ajoutez-le dans le fichier .env');
    console.log('');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM reçu: Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 CTRL+C détecté: Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

module.exports = app;
