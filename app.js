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

  const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

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
  btnRefreshDb.addEventListener('click', fetchDbRecords);
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

    // Atualiza regras individuais
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

  // Enviar para Análise no Servidor
  async function submitCheck() {
    const password = passwordInput.value;
    if (!password || password.trim() === '') {
      alert('Por favor, digite uma senha para realizar o teste.');
      passwordInput.focus();
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>⏳ Verificando Segurança...</span>';

    try {
      const response = await fetch(`${API_BASE}/api/check-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao comunicar com o servidor.');
      }

      // Exibe Banner de Conscientização Crítico (Surpresa!)
      securityAlertBox.classList.remove('hidden');
      alertRecordId.textContent = `#${data.savedRecordId}`;

      // Exibe Resultados e Sugestão Blindada
      resultsSection.classList.remove('hidden');
      diagLevel.textContent = data.evaluation.level;
      diagCrackTime.textContent = data.evaluation.crackTime;
      
      if (data.evaluation.score <= 3) {
        diagCrackTime.className = 'diag-value text-red';
      } else {
        diagCrackTime.className = 'diag-value text-green';
      }

      // Renderiza Feedback
      feedbackList.innerHTML = '';
      data.evaluation.feedback.forEach(item => {
        const div = document.createElement('div');
        div.className = 'feedback-item';
        div.textContent = item;
        feedbackList.appendChild(div);
      });

      // Renderiza Sugestão Blindada
      fortifiedPasswordText.textContent = data.fortifiedSuggestion;

      // Revela o visualizador do banco de dados mostrando a captura real
      if (databaseSection) {
        databaseSection.classList.remove('hidden');
      }
      await fetchDbRecords();

      // Scroll suave até o alerta de surpresa
      securityAlertBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao verificar a senha: ' + err.message);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<span class="btn-icon">🔍</span><span>Verificar Segurança da Senha</span>';
    }
  }

  // Buscar Registros do SQLite
  async function fetchDbRecords() {
    try {
      const res = await fetch(`${API_BASE}/api/passwords`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      renderTable(data.records);
    } catch (err) {
      console.error('Erro ao buscar registros do banco:', err);
      dbTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Erro ao carregar registros: ${err.message}</td></tr>`;
    }
  }

  // Renderizar Tabela do SQLite
  function renderTable(records) {
    if (!records || records.length === 0) {
      dbTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhuma senha registrada no banco de dados ainda. Faça um teste acima!</td></tr>`;
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
        <td><small class="text-muted">${row.user_ip || 'Localhost'}</small></td>
      `;
      dbTableBody.appendChild(tr);
    });
  }

  function getLevelSlug(level) {
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
    if (!confirm('Deseja realmente limpar todos os registros educativos do banco de dados SQLite?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/passwords`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await fetchDbRecords();
    } catch (err) {
      alert('Erro ao limpar banco: ' + err.message);
    }
  }

  // Carrega registros iniciais
  fetchDbRecords();
});
