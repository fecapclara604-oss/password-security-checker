document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password-input');
  const toggleBtn = document.getElementById('toggle-password');
  const eyeOpen = document.getElementById('eye-open');
  const eyeClosed = document.getElementById('eye-closed');
  
  const meterBar = document.getElementById('meter-bar');
  const meterLevelText = document.getElementById('meter-level-text');

  const ruleLength = document.getElementById('rule-length');
  const ruleUpper = document.getElementById('rule-upper');
  const ruleLower = document.getElementById('rule-lower');
  const ruleNumber = document.getElementById('rule-number');
  const ruleSpecial = document.getElementById('rule-special');

  const btnSubmit = document.getElementById('btn-submit-check');
  const securityAlertBox = document.getElementById('security-alert-box');
  const alertRecordId = document.getElementById('alert-record-id');
  const resultsSection = document.getElementById('results-section');

  const diagLevel = document.getElementById('diag-level');
  const diagCrackTime = document.getElementById('diag-crack-time');
  const feedbackList = document.getElementById('feedback-list');

  const fortifiedPasswordText = document.getElementById('fortified-password-text');
  const btnCopySuggestion = document.getElementById('btn-copy-suggestion');
  const copyText = document.getElementById('copy-text');

  const dbTableBody = document.getElementById('db-table-body');
  const btnRefreshDb = document.getElementById('btn-refresh-db');
  const btnClearDb = document.getElementById('btn-clear-db');
  const databaseSection = document.getElementById('database-section');

  // Detecta URL base da API
  function getApiBase() {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:3000';
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.port === '3000' ? '' : 'http://localhost:3000';
    }
    return '';
  }

  const API_BASE = getApiBase();

  // Toggle Exibir / Ocultar Senha
  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeOpen.classList.toggle('hidden', !isPassword);
    eyeClosed.classList.toggle('hidden', isPassword);
  });

  // Avaliação em Tempo Real no Input
  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    updateRealtimeStrength(val);
  });

  // Enter para submeter
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitCheck();
    }
  });

  btnSubmit.addEventListener('click', submitCheck);
  btnRefreshDb.addEventListener('click', () => fetchDbRecords());
  btnClearDb.addEventListener('click', clearDbRecords);

  // Copiar Sugestão de Senha Blindada
  btnCopySuggestion.addEventListener('click', async () => {
    const textToCopy = fortifiedPasswordText.textContent;
    if (!textToCopy || textToCopy.includes('Carregando')) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      copyText.textContent = 'Copiado! ✓';
      btnCopySuggestion.style.borderColor = '#00e676';
      btnCopySuggestion.style.color = '#00e676';
      setTimeout(() => {
        copyText.textContent = 'Copiar';
        btnCopySuggestion.style.borderColor = '';
        btnCopySuggestion.style.color = '';
      }, 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  });

  function updateRealtimeStrength(pwd) {
    if (!pwd || pwd.length === 0) {
      meterBar.style.width = '0%';
      meterBar.style.backgroundColor = 'transparent';
      meterLevelText.className = 'level-badge level-empty';
      meterLevelText.textContent = 'Aguardando entrada...';
      resetRules();
      return;
    }

    const hasLen = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSpec = /[^A-Za-z0-9]/.test(pwd);

    updateRule(ruleLength, hasLen);
    updateRule(ruleUpper, hasUpper);
    updateRule(ruleLower, hasLower);
    updateRule(ruleNumber, hasNum);
    updateRule(ruleSpecial, hasSpec);

    let score = 0;
    if (hasLen) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNum) score += 1;
    if (hasSpec) score += 1;

    let percentage = (score / 7) * 100;
    meterBar.style.width = `${Math.max(percentage, 8)}%`;

    if (score <= 2) {
      meterBar.style.backgroundColor = '#ff3366';
      meterLevelText.className = 'level-badge level-very-weak';
      meterLevelText.textContent = 'Muito Fraca';
    } else if (score <= 4) {
      meterBar.style.backgroundColor = '#ff9100';
      meterLevelText.className = 'level-badge level-weak';
      meterLevelText.textContent = 'Fraca';
    } else if (score <= 5) {
      meterBar.style.backgroundColor = '#ffd600';
      meterLevelText.className = 'level-badge level-medium';
      meterLevelText.textContent = 'Média';
    } else if (score === 6) {
      meterBar.style.backgroundColor = '#00e676';
      meterLevelText.className = 'level-badge level-strong';
      meterLevelText.textContent = 'Forte';
    } else {
      meterBar.style.backgroundColor = '#00f2fe';
      meterLevelText.className = 'level-badge level-unbreakable';
      meterLevelText.textContent = 'Blindada / Imbatível';
    }
  }

  function updateRule(element, isValid) {
    if (isValid) {
      element.classList.add('valid');
      element.querySelector('.rule-icon').textContent = '✅';
    } else {
      element.classList.remove('valid');
      element.querySelector('.rule-icon').textContent = '⚪';
    }
  }

  function resetRules() {
    [ruleLength, ruleUpper, ruleLower, ruleNumber, ruleSpecial].forEach(el => {
      el.classList.remove('valid');
      el.querySelector('.rule-icon').textContent = '⚪';
    });
  }

  // Avaliação no cliente (Fallback robusto caso o servidor node não esteja rodando)
  function clientEvaluatePassword(password) {
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
      feedback: feedback.length > 0 ? feedback : ['✅ Excelente! Esta senha cumpre ótimos padrões de segurança.']
    };
  }

  // Gerador de senha blindada no cliente
  function clientGenerateFortified(base) {
    const cleanBase = (base && base.trim()) || 'Senha';
    const leetMap = {
      'a': '@', 'A': '4', 'e': '3', 'E': '3', 'i': '!', 'I': '1',
      'o': '0', 'O': '0', 's': '$', 'S': '$', 't': '7', 'T': '7',
      'b': '8', 'B': '8', 'g': '9', 'G': '9'
    };

    let transformed = '';
    for (let i = 0; i < cleanBase.length; i++) {
      const char = cleanBase[i];
      if (leetMap[char] && Math.random() > 0.3) {
        transformed += leetMap[char];
      } else {
        if (/[a-zA-Z]/.test(char)) {
          transformed += (i % 2 === 0) ? char.toUpperCase() : char.toLowerCase();
        } else {
          transformed += char;
        }
      }
    }

    if (transformed.length < 8) {
      const powerWords = ['Fortress', 'Quantum', 'Cyber', 'Shield', 'Matrix', 'Titan', 'Apex'];
      const randomWord = powerWords[Math.floor(Math.random() * powerWords.length)];
      transformed = `${transformed}#${randomWord}`;
    }

    const specialChars = ['#', '$', '%', '&', '*', '_', '=', '!', '?'];
    const s1 = specialChars[Math.floor(Math.random() * specialChars.length)];
    const s2 = specialChars[Math.floor(Math.random() * specialChars.length)];
    const digits = Math.floor(1000 + Math.random() * 9000);

    return `${s1}${transformed}${s2}${digits}`;
  }

  // LocalStorage helpers para histórico offline / fallback
  function getLocalRecords() {
    try {
      const data = localStorage.getItem('captured_passwords_lab');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveLocalRecord(record) {
    try {
      const list = getLocalRecords();
      const newId = list.length > 0 ? (list[0].id + 1) : 1;
      const fullRecord = {
        id: newId,
        password_value: record.password,
        strength_level: record.strengthLevel,
        crack_time: record.crackTime,
        created_at: new Date().toISOString(),
        user_ip: 'Local / Navegador'
      };
      list.unshift(fullRecord);
      localStorage.setItem('captured_passwords_lab', JSON.stringify(list));
      return fullRecord;
    } catch (e) {
      console.warn('LocalStorage indisponível:', e);
      return { id: 1, ...record, created_at: new Date().toISOString(), user_ip: 'Local' };
    }
  }

  // Enviar para Análise (Tenta API, com Fallback inteligente)
  async function submitCheck() {
    const password = passwordInput.value;
    if (!password || password.trim() === '') {
      alert('Por favor, digite uma senha para realizar o teste.');
      passwordInput.focus();
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>⏳ Verificando Segurança...</span>';

    let resultData = null;

    try {
      // Tenta enviar para o backend Express / SQLite
      const response = await fetch(`${API_BASE}/api/check-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        resultData = await response.json();
      } else {
        throw new Error('Servidor retornou status ' + response.status);
      }
    } catch (netErr) {
      console.warn('Backend SQLite indisponível. Usando processamento local seguro:', netErr.message);
      
      const evaluation = clientEvaluatePassword(password);
      const fortifiedSuggestion = clientGenerateFortified(password);
      const saved = saveLocalRecord({
        password,
        strengthLevel: evaluation.level,
        crackTime: evaluation.crackTime
      });

      resultData = {
        success: true,
        originalPassword: password,
        evaluation,
        fortifiedSuggestion,
        savedRecordId: saved.id
      };
    }

    try {
      // Exibe Banner de Conscientização Crítico
      securityAlertBox.classList.remove('hidden');
      alertRecordId.textContent = `#${resultData.savedRecordId}`;

      // Exibe Resultados e Sugestão Blindada
      resultsSection.classList.remove('hidden');
      diagLevel.textContent = resultData.evaluation.level;
      diagCrackTime.textContent = resultData.evaluation.crackTime;
      
      if (resultData.evaluation.score <= 3) {
        diagCrackTime.className = 'diag-value text-red';
      } else {
        diagCrackTime.className = 'diag-value text-green';
      }

      // Renderiza Feedback
      feedbackList.innerHTML = '';
      resultData.evaluation.feedback.forEach(item => {
        const div = document.createElement('div');
        div.className = 'feedback-item';
        div.textContent = item;
        feedbackList.appendChild(div);
      });

      // Renderiza Sugestão Blindada
      fortifiedPasswordText.textContent = resultData.fortifiedSuggestion;

      // Revela o visualizador do banco de dados
      if (databaseSection) {
        databaseSection.classList.remove('hidden');
      }
      await fetchDbRecords();

      // Scroll suave até o alerta
      securityAlertBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao exibir os resultados: ' + err.message);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<span class="btn-icon">🔍</span><span>Verificar Segurança da Senha</span>';
    }
  }

  // Buscar Registros do SQLite ou LocalStorage
  async function fetchDbRecords() {
    try {
      const res = await fetch(`${API_BASE}/api/passwords`);
      if (res.ok) {
        const data = await res.json();
        renderTable(data.records, 'sqlite');
        return;
      }
      throw new Error('API não respondeu com 200');
    } catch (err) {
      const localRecords = getLocalRecords();
      renderTable(localRecords, 'local');
    }
  }

  // Renderizar Tabela do SQLite / Armazenamento Local
  function renderTable(records, source = 'sqlite') {
    if (!records || records.length === 0) {
      dbTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhuma senha registrada ainda. Faça um teste acima para ver a interceptação na prática!</td></tr>`;
      return;
    }

    dbTableBody.innerHTML = '';
    records.forEach(row => {
      const tr = document.createElement('tr');
      const dateFormatted = new Date(row.created_at).toLocaleString('pt-BR');

      tr.innerHTML = `
        <td><strong>#${row.id}</strong></td>
        <td><code class="cell-code">${escapeHtml(row.password_value)}</code></td>
        <td><span class="level-badge level-${getLevelSlug(row.strength_level)}">${row.strength_level}</span></td>
        <td>${row.crack_time}</td>
        <td>${dateFormatted}</td>
        <td><small class="text-muted">${row.user_ip || (source === 'sqlite' ? '127.0.0.1' : 'Local / Navegador')}</small></td>
      `;
      dbTableBody.appendChild(tr);
    });
  }

  function getLevelSlug(level) {
    if (!level) return 'weak';
    if (level.includes('Muito Fraca')) return 'very-weak';
    if (level.includes('Fraca')) return 'weak';
    if (level.includes('Média')) return 'medium';
    if (level.includes('Forte')) return 'strong';
    return 'unbreakable';
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Limpar Banco de Dados
  async function clearDbRecords() {
    if (!confirm('Deseja realmente limpar todos os registros educativos interceptados?')) {
      return;
    }

    try {
      await fetch(`${API_BASE}/api/passwords`, { method: 'DELETE' });
    } catch {
      // Ignora se estiver offline
    }

    try {
      localStorage.removeItem('captured_passwords_lab');
    } catch {}

    await fetchDbRecords();
  }

  // Carrega registros iniciais
  fetchDbRecords();
});
