const { getAllCapturedPasswords } = require('./database');

async function showDatabase() {
  console.log('\n======================================================');
  console.log('🗄️  REGISTROS DO BANCO DE DADOS SQLITE (passwords.db)');
  console.log('======================================================\n');

  try {
    const records = await getAllCapturedPasswords();

    if (records.length === 0) {
      console.log('Nenhum registro encontrado no banco de dados ainda.');
      console.log('Faça um teste no site para capturar registros!\n');
      process.exit(0);
    }

    console.table(
      records.map(r => ({
        ID: `#${r.id}`,
        'Senha Digitada': r.password_value,
        'Nível': r.strength_level,
        'Tempo de Quebra': r.crack_time,
        'IP': r.user_ip || 'Local',
        'Data/Hora': r.created_at
      }))
    );

    console.log(`\nTotal de registros: ${records.length}\n`);
  } catch (err) {
    console.error('Erro ao consultar banco de dados:', err.message);
  } finally {
    process.exit(0);
  }
}

showDatabase();
