'use strict';

/* ============================================================
   1. IDENTIDADE VISUAL: LOGO E ALTERNÂNCIA DE TEMA
   ============================================================ */
const discoveryLogo = document.querySelector('.brand-logo');
const brandFallback = document.querySelector('.brand-fallback');
const themeToggle = document.querySelector('#theme-toggle');
const themeToggleLabel = themeToggle?.querySelector('.theme-toggle-label');
const themeToggleIcon = themeToggle?.querySelector('.theme-toggle-icon');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function showBrandFallback() {
  if (discoveryLogo) discoveryLogo.hidden = true;
  if (brandFallback) brandFallback.hidden = false;
}

if (discoveryLogo && brandFallback) {
  discoveryLogo.addEventListener('error', showBrandFallback);
  if (discoveryLogo.complete && discoveryLogo.naturalWidth === 0) showBrandFallback();
}

function applyTheme(theme, savePreference = true) {
  const selectedTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = selectedTheme;

  if (themeToggle) {
    const lightThemeIsActive = selectedTheme === 'light';
    themeToggle.setAttribute('aria-pressed', String(lightThemeIsActive));
    themeToggle.setAttribute(
      'aria-label',
      lightThemeIsActive ? 'Ativar tema escuro' : 'Ativar tema claro'
    );
  }

  if (themeToggleLabel) {
    themeToggleLabel.textContent = selectedTheme === 'light' ? 'Tema escuro' : 'Tema claro';
  }

  if (themeToggleIcon) {
    themeToggleIcon.textContent = selectedTheme === 'light' ? '◐' : '☼';
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', selectedTheme === 'light' ? '#edf2f1' : '#080e15');
  }

  if (savePreference) {
    try {
      localStorage.setItem('isomeria-espacial-theme', selectedTheme);
    } catch (error) {
      // O tema continua funcionando mesmo quando o navegador bloqueia armazenamento local.
    }
  }
}

let savedTheme = 'dark';
try {
  const storedTheme = localStorage.getItem('isomeria-espacial-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') savedTheme = storedTheme;
} catch (error) {
  // Sem preferência persistida, o projeto inicia no tema escuro definido no HTML.
}
applyTheme(savedTheme, false);

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
});

/* ============================================================
   2. PROGRESSO DE LEITURA E NAVEGAÇÃO ATIVA
   ============================================================ */
const readingProgressBar = document.querySelector('#reading-progress-bar');
let scrollUpdateScheduled = false;

function updateReadingProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  if (readingProgressBar) {
    readingProgressBar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
  }
  scrollUpdateScheduled = false;
}

window.addEventListener('scroll', () => {
  if (!scrollUpdateScheduled) {
    window.requestAnimationFrame(updateReadingProgress);
    scrollUpdateScheduled = true;
  }
}, { passive: true });
window.addEventListener('resize', updateReadingProgress, { passive: true });
updateReadingProgress();

const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && navSections.length > 0) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeId = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === activeId;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-28% 0px -62% 0px', threshold: 0 });

  navSections.forEach((section) => sectionObserver.observe(section));
}

/* ============================================================
   3. REVELAÇÃO DISCRETA DOS BLOCOS AO ENTRAR NA TELA
   ============================================================ */
const revealCandidates = document.querySelectorAll(
  '.concept-card, .technical-note, .fat-explanation article, .regulation-panel, ' +
  '.thalidomide-card, .ibuprofen-panel, .scent-card, .conclusion-grid, ' +
  '.quiz-card, .file-card, .reference-list li'
);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -35px 0px' });

  revealCandidates.forEach((element, index) => {
    element.classList.add('reveal-target');
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
    revealObserver.observe(element);
  });
} else {
  revealCandidates.forEach((element) => element.classList.add('is-visible'));
}

/* ============================================================
   4. VISUALIZADOR DE IMAGENS CIENTÍFICAS
   ============================================================ */
const imageDialog = document.querySelector('#image-dialog');
const imageDialogImage = document.querySelector('#image-dialog-image');
const imageDialogCaption = document.querySelector('#image-dialog-caption');
const imageDialogClose = document.querySelector('#image-dialog-close');

function closeImageDialog() {
  if (imageDialog?.open) imageDialog.close();
}

document.querySelectorAll('.zoom-image-btn').forEach((button) => {
  button.addEventListener('click', () => {
    if (!imageDialog || !imageDialogImage || !imageDialogCaption) return;

    const imageUrl = button.dataset.imageViewer;
    if (!imageUrl) return;

    imageDialogImage.src = imageUrl;
    imageDialogImage.alt = button.dataset.imageAlt || 'Imagem científica ampliada.';
    imageDialogCaption.textContent = button.dataset.imageCaption || '';

    if (typeof imageDialog.showModal === 'function') {
      imageDialog.showModal();
    } else {
      imageDialog.setAttribute('open', '');
    }
  });
});

imageDialogClose?.addEventListener('click', closeImageDialog);
imageDialog?.addEventListener('click', (event) => {
  if (event.target === imageDialog) closeImageDialog();
});
imageDialog?.addEventListener('close', () => {
  if (imageDialogImage) imageDialogImage.removeAttribute('src');
});

/* ============================================================
   5. QUIZ: CONCEITOS E APLICAÇÕES DA ISOMERIA ESPACIAL
   ============================================================ */
const quizQuestions = [
  {
    question: 'Em uma cadeia com ligação dupla, o que caracteriza a configuração cis?',
    options: [
      'Os grupos de referência ficam em lados opostos da ligação dupla.',
      'Os grupos de referência ficam do mesmo lado da ligação dupla.',
      'A molécula passa a ter uma fórmula molecular diferente.',
      'A ligação dupla deixa de existir.'
    ],
    answer: 1,
    explanation: 'Na configuração cis, os grupos de referência estão do mesmo lado. Na configuração trans, ficam em lados opostos. A conectividade dos átomos permanece a mesma.'
  },
  {
    question: 'Qual afirmação descreve corretamente um par de enantiômeros?',
    options: [
      'São moléculas com fórmulas moleculares diferentes.',
      'São moléculas idênticas que sempre se sobrepõem perfeitamente.',
      'São imagens especulares que não podem ser sobrepostas perfeitamente.',
      'São moléculas que obrigatoriamente têm ligações duplas.'
    ],
    answer: 2,
    explanation: 'Enantiômeros são imagens especulares não sobreponíveis. Um carbono ligado a quatro grupos diferentes é um caso comum de centro quiral.'
  },
  {
    question: 'Por que as gorduras trans industriais foram restringidas pela ANVISA?',
    options: [
      'Porque elevam o HDL e reduzem o LDL.',
      'Porque não possuem nenhuma ligação entre carbonos.',
      'Porque são necessárias para a absorção de vitaminas.',
      'Porque prejudicam o perfil cardiovascular, incluindo aumento do LDL e redução do HDL.'
    ],
    answer: 3,
    explanation: 'A gordura trans industrial prejudica o perfil lipídico: tende a elevar o LDL e reduzir o HDL. O enunciado relaciona essa geometria molecular a um importante problema de saúde pública.'
  },
  {
    question: 'Qual ressalva é essencial ao explicar a quiralidade da talidomida?',
    options: [
      'As formas R e S podem se interconverter em condições fisiológicas.',
      'A forma R nunca apresenta qualquer atividade biológica.',
      'A forma S não possui relação com efeitos teratogênicos.',
      'A separação de R e S garante uma forma sem risco na gestação.'
    ],
    answer: 0,
    explanation: 'As formas R e S da talidomida se interconvertem no organismo. Por isso, não é correto afirmar que separar a forma R eliminaria o risco teratogênico.'
  },
  {
    question: 'Qual associação entre enantiômeros e aromas está correta?',
    options: [
      'A (−)-carvona tem odor de laranja; a (+)-carvona tem odor de hortelã.',
      'A (+)-carvona lembra o cominho; a (−)-carvona lembra a hortelã.',
      'Os dois enantiômeros da carvona têm necessariamente o mesmo odor.',
      'O (+)-limoneno tem odor de limão e o (−)-limoneno tem odor de laranja.'
    ],
    answer: 1,
    explanation: 'A (+)-carvona está associada ao odor de cominho/alcarávia, enquanto a (−)-carvona está associada à hortelã. No limoneno, o (+) é classicamente associado ao aroma de laranja.'
  }
];

const quizContent = document.querySelector('#quiz-content');
const progressLabel = document.querySelector('#quiz-progress-label');
const scoreLabel = document.querySelector('#quiz-score-label');
const progressBar = document.querySelector('#quiz-progress-bar');
const nextButton = document.querySelector('#quiz-next');

let currentQuestion = 0;
let score = 0;
let hasAnswered = false;

function createOptionButton(optionText, optionIndex) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'quiz-option';
  button.dataset.optionIndex = String(optionIndex);

  const marker = document.createElement('span');
  marker.className = 'option-marker';
  marker.setAttribute('aria-hidden', 'true');
  marker.textContent = String.fromCharCode(65 + optionIndex);

  const label = document.createElement('span');
  label.textContent = optionText;

  button.append(marker, label);
  button.addEventListener('click', () => selectAnswer(optionIndex));
  return button;
}

function updateQuizProgress() {
  if (progressLabel) {
    progressLabel.textContent = `QUESTÃO ${String(currentQuestion + 1).padStart(2, '0')} / ${String(quizQuestions.length).padStart(2, '0')}`;
  }
  if (scoreLabel) scoreLabel.textContent = `ACERTOS: ${score}`;
  if (progressBar) {
    progressBar.style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
  }
}

function renderQuestion() {
  if (!quizContent || !nextButton) return;

  const questionData = quizQuestions[currentQuestion];
  hasAnswered = false;
  nextButton.disabled = true;
  nextButton.className = 'quiz-next';
  nextButton.innerHTML = currentQuestion === quizQuestions.length - 1
    ? 'Ver resultado <span aria-hidden="true">→</span>'
    : 'Próxima questão <span aria-hidden="true">→</span>';

  updateQuizProgress();

  const heading = document.createElement('h3');
  heading.className = 'quiz-question';
  heading.id = 'quiz-question-title';
  heading.textContent = questionData.question;

  const options = document.createElement('div');
  options.className = 'quiz-options';
  options.setAttribute('role', 'group');
  options.setAttribute('aria-labelledby', heading.id);

  questionData.options.forEach((option, index) => {
    options.append(createOptionButton(option, index));
  });

  quizContent.replaceChildren(heading, options);
}

function selectAnswer(selectedIndex) {
  if (hasAnswered || !quizContent || !nextButton) return;

  const questionData = quizQuestions[currentQuestion];
  const isCorrect = selectedIndex === questionData.answer;
  hasAnswered = true;

  if (isCorrect) score += 1;

  const optionButtons = quizContent.querySelectorAll('.quiz-option');
  optionButtons.forEach((button, index) => {
    button.disabled = true;
    if (index === questionData.answer) button.classList.add('is-correct');
    if (index === selectedIndex && !isCorrect) button.classList.add('is-wrong');
  });

  const feedback = document.createElement('div');
  feedback.className = `quiz-feedback${isCorrect ? '' : ' is-incorrect'}`;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');

  const feedbackTitle = document.createElement('strong');
  feedbackTitle.textContent = isCorrect ? 'Resposta correta.' : 'Resposta não correta.';

  const feedbackText = document.createElement('span');
  feedbackText.textContent = questionData.explanation;

  feedback.append(feedbackTitle, feedbackText);
  quizContent.append(feedback);
  if (scoreLabel) scoreLabel.textContent = `ACERTOS: ${score}`;
  nextButton.disabled = false;
  nextButton.focus();
}

function renderResult() {
  if (!quizContent || !nextButton) return;

  const percentage = Math.round((score / quizQuestions.length) * 100);
  const title = document.createElement('h3');
  title.textContent = percentage >= 80
    ? 'Excelente leitura molecular.'
    : percentage >= 60
      ? 'Boa investigação. Continue.'
      : 'A pesquisa continua.';

  const description = document.createElement('p');
  description.textContent = `Você acertou ${score} de ${quizQuestions.length} questões (${percentage}%). Revise os eixos e as explicações das fontes para fortalecer sua compreensão da isomeria espacial.`;

  const scoreDisplay = document.createElement('span');
  scoreDisplay.className = 'quiz-result-score';
  scoreDisplay.textContent = `${score}/${quizQuestions.length}`;

  const result = document.createElement('div');
  result.className = 'quiz-result';
  result.setAttribute('aria-live', 'polite');
  result.append(scoreDisplay, title, description);
  quizContent.replaceChildren(result);

  if (progressLabel) progressLabel.textContent = 'INVESTIGAÇÃO CONCLUÍDA';
  if (scoreLabel) scoreLabel.textContent = `RESULTADO: ${percentage}%`;
  if (progressBar) progressBar.style.width = '100%';

  nextButton.disabled = false;
  nextButton.className = 'quiz-next quiz-restart';
  nextButton.textContent = 'Refazer o quiz';
  nextButton.focus();
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  renderQuestion();
}

function advanceQuiz() {
  if (!hasAnswered) return;

  if (currentQuestion < quizQuestions.length - 1) {
    currentQuestion += 1;
    renderQuestion();
    const firstOption = quizContent?.querySelector('.quiz-option');
    firstOption?.focus();
    return;
  }

  renderResult();
  hasAnswered = false;
}

nextButton?.addEventListener('click', () => {
  if (nextButton.classList.contains('quiz-restart')) {
    restartQuiz();
    const firstOption = quizContent?.querySelector('.quiz-option');
    firstOption?.focus();
    return;
  }
  advanceQuiz();
});

if (quizContent && progressLabel && scoreLabel && progressBar && nextButton) {
  renderQuestion();
} else {
  console.warn('O quiz não foi iniciado: revise os elementos com os identificadores quiz-* no HTML.');
}
