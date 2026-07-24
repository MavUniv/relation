document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- STATE ---
  let currentStep = 1;
  const formData = {
    name: '',
    studentId: '',
    rating: 0,
    feedback: ''
  };

  // --- DOM ELEMENTS ---
  const form = document.getElementById('survey-form');
  const progressContainer = document.querySelector('.progress-container');
  const progressBar = document.getElementById('progress-bar');
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const steps = document.querySelectorAll('.step-content');

  // Step 1 Elements
  const inputName = document.getElementById('student-name');
  const inputId = document.getElementById('student-id');
  const nameError = document.getElementById('name-error');
  const idError = document.getElementById('id-error');
  const btnNext1 = document.getElementById('btn-next-1');

  // Step 2 Elements
  const ratingCards = document.querySelectorAll('.rating-card');
  const ratingError = document.getElementById('rating-error');
  const btnPrev2 = document.getElementById('btn-prev-2');
  const btnNext2 = document.getElementById('btn-next-2');

  // Step 3 Elements
  const textFeedback = document.getElementById('feedback-text');
  const currentCharCount = document.getElementById('current-char');
  const feedbackError = document.getElementById('feedback-error');
  const btnPrev3 = document.getElementById('btn-prev-3');
  const btnSubmit = document.getElementById('btn-submit');

  // Step 4 Elements
  const summaryName = document.getElementById('summary-name');
  const summaryId = document.getElementById('summary-id');
  const summaryRating = document.getElementById('summary-rating');
  const btnReset = document.getElementById('btn-reset');

  // Confetti Canvas
  const canvas = document.getElementById('confetti-canvas');

  // --- TRANSITION LOGIC ---
  function goToStep(nextStep) {
    if (nextStep < 1 || nextStep > 4) return;

    const currentEl = document.getElementById(`step-${currentStep}`);
    const nextEl = document.getElementById(`step-${nextStep}`);

    // Direction (Next or Prev)
    const isNext = nextStep > currentStep;

    // Apply animation classes
    if (isNext) {
      currentEl.className = 'step-content slide-out-left';
      nextEl.className = 'step-content active slide-in-right';
    } else {
      currentEl.className = 'step-content slide-out-right';
      nextEl.className = 'step-content active slide-in-left';
    }

    // Update Progress Indicators (only for steps 1-3)
    if (nextStep <= 3) {
      progressContainer.style.display = 'block';
      
      // Progress Bar width
      const progressPercent = ((nextStep - 1) / 2) * 100;
      progressBar.style.width = `${progressPercent}%`;

      // Step indicator states
      stepIndicators.forEach((indicator) => {
        const stepNum = parseInt(indicator.dataset.step);
        if (stepNum < nextStep) {
          indicator.className = 'step-indicator completed';
          indicator.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px;"></i>';
        } else if (stepNum === nextStep) {
          indicator.className = 'step-indicator active';
          indicator.textContent = stepNum;
        } else {
          indicator.className = 'step-indicator';
          indicator.textContent = stepNum;
        }
      });
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    } else {
      // Step 4 (Success Screen)
      progressContainer.style.display = 'none';
    }

    // End of animation cleanup
    setTimeout(() => {
      // Remove temporary animation classes, keep only base classes
      currentEl.className = 'step-content';
      nextEl.className = 'step-content active';
    }, 400);

    currentStep = nextStep;
  }

  // --- VALIDATION LOGIC ---
  function validateStep1() {
    let isValid = true;
    
    // Validate Name
    const nameVal = inputName.value.trim();
    if (nameVal.length < 2) {
      nameError.textContent = '이름을 2자 이상 입력해 주세요.';
      nameError.classList.add('show');
      inputName.closest('.input-wrapper').style.borderColor = 'var(--error)';
      isValid = false;
    } else {
      nameError.classList.remove('show');
      inputName.closest('.input-wrapper').style.borderColor = '';
    }

    // Validate Student ID (Numbers only, 4 to 12 digits)
    const idVal = inputId.value.trim();
    const idReg = /^[0-9]{4,12}$/;
    if (!idReg.test(idVal)) {
      idError.textContent = '4자에서 12자 사이의 숫자 학번을 입력해 주세요.';
      idError.classList.add('show');
      inputId.closest('.input-wrapper').style.borderColor = 'var(--error)';
      isValid = false;
    } else {
      idError.classList.remove('show');
      inputId.closest('.input-wrapper').style.borderColor = '';
    }

    if (isValid) {
      formData.name = nameVal;
      formData.studentId = idVal;
    }
    return isValid;
  }

  function validateStep2() {
    if (formData.rating === 0) {
      ratingError.classList.add('show');
      return false;
    }
    ratingError.classList.remove('show');
    return true;
  }

  function validateStep3() {
    const feedbackVal = textFeedback.value.trim();
    if (feedbackVal.length < 10) {
      feedbackError.classList.add('show');
      textFeedback.closest('.textarea-wrapper').style.borderColor = 'var(--error)';
      return false;
    }
    feedbackError.classList.remove('show');
    textFeedback.closest('.textarea-wrapper').style.borderColor = '';
    formData.feedback = feedbackVal;
    return true;
  }

  // --- EVENT LISTENERS ---

  // Step 1: Next Button
  btnNext1.addEventListener('click', () => {
    if (validateStep1()) {
      goToStep(2);
    }
  });

  // Step 1: Auto clear error when inputting
  inputName.addEventListener('input', () => {
    if (inputName.value.trim().length >= 2) {
      nameError.classList.remove('show');
      inputName.closest('.input-wrapper').style.borderColor = '';
    }
  });

  inputId.addEventListener('input', () => {
    const idVal = inputId.value.trim();
    if (/^[0-9]{4,12}$/.test(idVal)) {
      idError.classList.remove('show');
      inputId.closest('.input-wrapper').style.borderColor = '';
    }
  });

  // Step 2: Rating Cards Choice
  ratingCards.forEach((card) => {
    card.addEventListener('click', () => {
      const rating = parseInt(card.dataset.rating);
      formData.rating = rating;
      
      // Visual state update
      ratingCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      
      // Hide error
      ratingError.classList.remove('show');
    });
  });

  // Step 2: Buttons
  btnPrev2.addEventListener('click', () => goToStep(1));
  btnNext2.addEventListener('click', () => {
    if (validateStep2()) {
      goToStep(3);
    }
  });

  // Step 3: Textarea Counter & Error Clear
  textFeedback.addEventListener('input', () => {
    const currentLen = textFeedback.value.length;
    currentCharCount.textContent = currentLen;
    
    if (currentLen >= 10) {
      feedbackError.classList.remove('show');
      textFeedback.closest('.textarea-wrapper').style.borderColor = '';
    }
  });

  // Step 3: Buttons
  btnPrev3.addEventListener('click', () => goToStep(2));
  btnSubmit.addEventListener('click', () => {
    if (validateStep3()) {
      // Process Submit
      submitSurvey();
    }
  });

  // Step 4: Reset Button
  btnReset.addEventListener('click', resetSurvey);

  // --- SUBMIT PROCESS & CONFETTI ---
  function submitSurvey() {
    // Populate Receipt
    summaryName.textContent = formData.name;
    summaryId.textContent = formData.studentId;
    
    // Rating text mapping with emoji
    const ratingTexts = {
      1: '😢 1점 (매우 불만족)',
      2: '🙁 2점 (불만족)',
      3: '😐 3점 (보통)',
      4: '🙂 4점 (만족)',
      5: '🥰 5점 (매우 만족)'
    };
    summaryRating.textContent = ratingTexts[formData.rating];

    // Color rating badge based on rating
    summaryRating.style.color = `var(--rating-${formData.rating})`;
    summaryRating.style.backgroundColor = `var(--rating-${formData.rating}-glow)`;
    summaryRating.style.borderColor = `var(--rating-${formData.rating})`;

    // Proceed to Step 4
    goToStep(4);

    // Run Confetti effect
    startConfetti();

    // Log the result (mimics sending to server)
    console.log('--- Survey Result Submitted ---');
    console.log('Student Name:', formData.name);
    console.log('Student ID:', formData.studentId);
    console.log('Satisfaction Rating:', formData.rating);
    console.log('Feedback:', formData.feedback);
    console.log('-------------------------------');
  }

  function resetSurvey() {
    // Clear state
    formData.name = '';
    formData.studentId = '';
    formData.rating = 0;
    formData.feedback = '';

    // Clear inputs
    inputName.value = '';
    inputId.value = '';
    textFeedback.value = '';
    currentCharCount.textContent = '0';

    // Clear ratings
    ratingCards.forEach((c) => c.classList.remove('selected'));

    // Reset layout
    nameError.classList.remove('show');
    idError.classList.remove('show');
    ratingError.classList.remove('show');
    feedbackError.classList.remove('show');
    
    inputName.closest('.input-wrapper').style.borderColor = '';
    inputId.closest('.input-wrapper').style.borderColor = '';
    textFeedback.closest('.textarea-wrapper').style.borderColor = '';

    stopConfetti();
    goToStep(1);
  }

  // --- CUSTOM CANVAS CONFETTI EFFECT ---
  let confettiInterval;
  let confettiParticles = [];
  const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'];

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height - 20;
      this.size = Math.random() * 8 + 6;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedY = Math.random() * 4 + 3;
      this.speedX = Math.random() * 4 - 2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      // Reset particle if it leaves screen
      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function startConfetti() {
    canvas.style.display = 'block';
    resizeCanvas();
    
    confettiParticles = [];
    for (let i = 0; i < 150; i++) {
      confettiParticles.push(new ConfettiParticle());
    }

    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d');
    function animate() {
      if (canvas.style.display === 'none') return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      confettiParticles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      confettiInterval = requestAnimationFrame(animate);
    }

    animate();

    // Auto stop after 5 seconds to conserve battery/performance
    setTimeout(() => {
      stopConfetti();
    }, 5000);
  }

  function stopConfetti() {
    canvas.style.display = 'none';
    cancelAnimationFrame(confettiInterval);
    window.removeEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});
