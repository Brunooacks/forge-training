/**
 * FORGE Quiz Engine
 * Requires window.FORGE_QUIZ to be defined before this script runs.
 *
 * window.FORGE_QUIZ = {
 *   id: 'lab-03-quiz',
 *   passingScore: 70,
 *   questions: [
 *     { text: '...', options: ['a','b','c','d'], correct: 1, explanation: '...' }
 *   ]
 * }
 */
(function() {
  const quiz = window.FORGE_QUIZ;
  if (!quiz) return;

  const container = document.getElementById('forge-quiz');
  if (!container) return;

  let current = 0;
  let answers = [];
  let submitted = false;

  const totalQ = quiz.questions.length;

  function render() {
    container.innerHTML = `
      <div class="forge-quiz">
        <div class="quiz-header">
          <span class="quiz-label">✦ Quiz de verificação</span>
          <span class="quiz-counter" id="quiz-counter">Questão 1 de ${totalQ}</span>
        </div>
        <div id="quiz-body"></div>
        <div id="quiz-result" class="quiz-result" style="display:none"></div>
      </div>`;
    renderQuestion(0);
  }

  function renderQuestion(idx) {
    const q = quiz.questions[idx];
    const body = document.getElementById('quiz-body');
    const counter = document.getElementById('quiz-counter');
    if (counter) counter.textContent = `Questão ${idx + 1} de ${totalQ}`;
    body.innerHTML = `
      <div class="quiz-question active">
        <p class="question-text">${q.text}</p>
        <div class="quiz-options" role="radiogroup" aria-label="Opções de resposta">
          ${q.options.map((opt, i) => `
            <div class="quiz-option" data-idx="${i}" role="radio" aria-checked="false" tabindex="0">
              <div class="option-radio"><div class="option-radio-inner"></div></div>
              <span class="option-text">${opt}</span>
            </div>`).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
        <button class="btn-primary" id="quiz-confirm" style="margin-top:4px" disabled>Confirmar</button>
      </div>`;

    let selected = null;
    const opts = body.querySelectorAll('.quiz-option');
    const confirmBtn = body.querySelector('#quiz-confirm');

    opts.forEach(opt => {
      function selectOpt() {
        opts.forEach(o => { o.classList.remove('selected'); o.setAttribute('aria-checked','false'); });
        opt.classList.add('selected');
        opt.setAttribute('aria-checked','true');
        selected = parseInt(opt.dataset.idx);
        confirmBtn.disabled = false;
      }
      opt.addEventListener('click', selectOpt);
      opt.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); selectOpt(); } });
    });

    confirmBtn.addEventListener('click', function() {
      if (selected === null) return;
      answers[idx] = selected;
      const correct = q.correct;
      const feedback = document.getElementById('quiz-feedback');
      opts.forEach(opt => {
        const i = parseInt(opt.dataset.idx);
        if (i === correct) opt.classList.add('correct');
        else if (i === selected && selected !== correct) opt.classList.add('wrong');
        opt.style.pointerEvents = 'none';
      });
      feedback.style.display = 'block';
      feedback.className = 'quiz-feedback ' + (selected === correct ? 'correct' : 'wrong');
      feedback.textContent = (selected === correct ? '✓ Correto! ' : '✗ Incorreto. ') + q.explanation;
      confirmBtn.textContent = idx < totalQ - 1 ? 'Próxima →' : 'Ver resultado';
      confirmBtn.disabled = false;
      confirmBtn.onclick = function() {
        if (idx < totalQ - 1) renderQuestion(idx + 1);
        else showResult();
      };
    });
  }

  function showResult() {
    const correct = answers.filter((a, i) => a === quiz.questions[i].correct).length;
    const score = Math.round((correct / totalQ) * 100);
    const passed = score >= quiz.passingScore;
    const body = document.getElementById('quiz-body');
    const resultEl = document.getElementById('quiz-result');
    body.style.display = 'none';
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <div class="result-score-num" style="color:${passed ? 'var(--green)' : 'var(--red)'}">${score}%</div>
      <div class="result-score-label">${correct} de ${totalQ} questões corretas</div>
      <div class="result-msg">${passed
        ? '🎉 Parabéns! Você passou neste módulo e pode avançar para o próximo lab.'
        : `Você precisa de ${quiz.passingScore}% para avançar. Revise o conteúdo e tente novamente.`}</div>
      <div class="result-actions">
        <button class="btn-secondary" id="quiz-retry">↺ Tentar novamente</button>
        ${passed ? `<a href="${quiz.nextLab || 'index.html'}" class="btn-primary">Próximo Lab →</a>` : ''}
      </div>`;

    forgeProgress.saveQuizScore(quiz.id, score, passed);
    if (passed && quiz.labId) forgeProgress.markLabComplete(quiz.labId, score);

    document.getElementById('quiz-retry').addEventListener('click', function() {
      current = 0; answers = [];
      resultEl.style.display = 'none';
      body.style.display = 'block';
      renderQuestion(0);
    });
  }

  render();
})();
