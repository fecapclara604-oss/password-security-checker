const localtunnel = require('localtunnel');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function startTunnel() {
  const PORT = 3000;
  console.log('\n======================================================');
  console.log('🚀 CRIANDO URL PÚBLICA NA INTERNET COM QR CODE...');
  console.log('======================================================\n');

  try {
    const tunnel = await localtunnel({ port: PORT });

    const publicUrl = tunnel.url;
    console.log(`🌍 SUA URL PÚBLICA NA INTERNET (HTTPS):`);
    console.log(`   👉 ${publicUrl}\n`);
    console.log(`💡 Qualquer pessoa em qualquer lugar do mundo pode acessar por este link!`);
    console.log(`📱 QR CODE PÚBLICO GERADO ABAIXO:\n`);

    // Gera QR Code no terminal
    const qrTerminal = await QRCode.toString(publicUrl, { type: 'terminal', small: true });
    console.log(qrTerminal);

    // Salva a imagem do QR Code público
    const publicDir = path.join(__dirname, 'public');
    const qrPublicPng = path.join(publicDir, 'qrcode-internet.png');
    const qrPublicSvg = path.join(publicDir, 'qrcode-internet.svg');

    await QRCode.toFile(qrPublicPng, publicUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#090d16', light: '#ffffff' }
    });

    await QRCode.toFile(qrPublicSvg, publicUrl, {
      margin: 2,
      color: { dark: '#090d16', light: '#ffffff' }
    });

    // Salva a URL pública em um arquivo json para a página de share usar
    fs.writeFileSync(path.join(publicDir, 'public-url.json'), JSON.stringify({ publicUrl, timestamp: new Date() }, null, 2));

    console.log(`\n✅ QR Code salvo em:`);
    console.log(`   📁 public/qrcode-internet.png`);
    console.log(`   📁 public/qrcode-internet.svg`);
    console.log(`\n📄 Visualize no navegador: http://localhost:3000/share.html\n`);

    tunnel.on('close', () => {
      console.log('Túnel público encerrado.');
    });

    tunnel.on('error', (err) => {
      console.error('Erro no túnel:', err);
    });

  } catch (err) {
    console.error('❌ Falha ao criar túnel público:', err.message);
  }
}

startTunnel();
