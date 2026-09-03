const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function generatePublicAndLocalQRCodes() {
  const publicWebUrl = 'https://fecapclara604-oss.github.io/password-security-checker/';
  const localWifiUrl = 'http://10.1.33.166:3000';
  const localhostUrl = 'http://localhost:3000';

  console.log('\n======================================================');
  console.log('🌐 URLS & QR CODES DO PROJETO PARA COMPARTILHAMENTO');
  console.log('======================================================\n');
  console.log(`🌍 1. URL PÚBLICA NA INTERNET (GitHub Pages - Qualquer Lugar / 4G / 5G):`);
  console.log(`   👉 ${publicWebUrl}\n`);
  console.log(`📲 2. URL na Rede Wi-Fi Local (Mesmo Roteador):`);
  console.log(`   👉 ${localWifiUrl}\n`);
  console.log(`💻 3. URL Local no PC:`);
  console.log(`   👉 ${localhostUrl}\n`);

  console.log('--- QR CODE OFICIAL DA INTERNET (Escaneie com a câmera do celular) ---');
  const qrInternetTerminal = await QRCode.toString(publicWebUrl, { type: 'terminal', small: true });
  console.log(qrInternetTerminal);

  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // Gera imagens PNG e SVG para a URL pública na internet
  await QRCode.toFile(path.join(__dirname, 'qrcode.png'), publicWebUrl, {
    width: 600,
    margin: 2,
    color: { dark: '#090d16', light: '#ffffff' }
  });

  await QRCode.toFile(path.join(publicDir, 'qrcode.png'), publicWebUrl, {
    width: 600,
    margin: 2,
    color: { dark: '#090d16', light: '#ffffff' }
  });

  await QRCode.toFile(path.join(publicDir, 'qrcode.svg'), publicWebUrl, {
    margin: 2,
    color: { dark: '#090d16', light: '#ffffff' }
  });

  // Também gera para a rede Wi-Fi local caso queiram testar offline
  await QRCode.toFile(path.join(publicDir, 'qrcode-wifi.png'), localWifiUrl, {
    width: 600,
    margin: 2,
    color: { dark: '#090d16', light: '#ffffff' }
  });

  console.log('✅ Arquivos de imagem do QR Code gerados com sucesso:');
  console.log(`   📁 qrcode.png (URL Pública)`);
  console.log(`   📁 public/qrcode.png (URL Pública)`);
  console.log(`   📁 public/qrcode.svg (URL Pública em Vetor)`);
  console.log(`   📁 public/qrcode-wifi.png (URL Wi-Fi Local)\n`);
}

generatePublicAndLocalQRCodes();
