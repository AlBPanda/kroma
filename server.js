const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Güvenlik Başlıkları (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors());
app.use(express.json());

// Live Reload SSE (Server-Sent Events) - VS Code'da Ctrl+S yapılınca tarayıcıyı anında yenileme
const reloadClients = [];

app.get('/api/reload-stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  reloadClients.push(res);
  req.on('close', () => {
    const idx = reloadClients.indexOf(res);
    if (idx !== -1) reloadClients.splice(idx, 1);
  });
});

function triggerLiveReload() {
  reloadClients.forEach((client) => client.write('data: reload\n\n'));
}

// Data ve Public klasörlerindeki değişiklikleri izleme (Ctrl+S algılama)
let watchDebounce;
const watchPaths = [path.join(__dirname, 'data'), path.join(__dirname, 'public')];
watchPaths.forEach((dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => {
        console.log(`⚡ Dosya değişti (${filename}), tarayıcı yenileniyor...`);
        triggerLiveReload();
      }, 200);
    });
  }
});

// Statik Dosya Servisi (Public ve Data klasörleri)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// Ana sayfa yönlendirmesi
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🛡️ Güvenli Galeri Sunucusu Çalışıyor!`);
  console.log(`⚡ Live Reload Aktif (Ctrl+S yapılınca site anında yenilenir)`);
  console.log(`🌐 Yerel Adres: http://localhost:3000`);
  console.log(`==================================================\n`);
});
