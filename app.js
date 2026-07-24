document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ==========================================
  // CONFIGURATION: GOOGLE APPS SCRIPT URL
  // ==========================================
  // 구글 Apps Script 배포 후 발급받은 웹앱 URL을 아래에 넣어주세요.
  // URL이 비어있거나 기본값이면 데모 데이터가 작동합니다.
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby7yg_yiOPytYWYiB_5GiUh6mni53p1M7w0a2GJ1TD9OmwQ0V6fTPULQL0mo-HhJvH0/exec';

  // --- STATE ---
  let currentStep = 1;
  const formData = {
    name: '',
    studentId: '',
    rating: 0,
    feedback: ''
  };

  // --- DOM ELEMENTS ---
  const appContainer = document.querySelector('.app-container');
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

  // Step 5: Admin Dashboard Elements
  const adminTotalStudents = document.getElementById('admin-total-students');
  const adminAvgRating = document.getElementById('admin-avg-rating');
  const adminSyncStatus = document.getElementById('admin-sync-status');
  const adminTableBody = document.getElementById('admin-table-body');
  const btnAdminExit = document.getElementById('btn-admin-exit');
  const btnAdminRefresh = document.getElementById('btn-admin-refresh');

  // Admin Authentication Elements
  const adminTriggerBtn = document.getElementById('admin-trigger-btn');
  const adminAuthOverlay = document.getElementById('admin-auth-overlay');
  const adminPasswordInput = document.getElementById('admin-password');
  const authError = document.getElementById('auth-error');
  const btnAuthCancel = document.getElementById('btn-auth-cancel');
  const btnAuthSubmit = document.getElementById('btn-auth-submit');

  // Confetti Canvas
  const canvas = document.getElementById('confetti-canvas');

  // --- TRANSITION LOGIC ---
  function goToStep(nextStep) {
    if (nextStep < 1 || nextStep > 5) return;

    const currentEl = document.getElementById(`step-${currentStep}`);
    const nextEl = document.getElementById(`step-${nextStep}`);

    const isNext = nextStep > currentStep;

    // Apply slide animation classes
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
      
      const progressPercent = ((nextStep - 1) / 2) * 100;
      progressBar.style.width = `${progressPercent}%`;

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
      // Step 4 (Success Screen) or Step 5 (Admin Dashboard)
      progressContainer.style.display = 'none';
    }

    setTimeout(() => {
      currentEl.className = 'step-content';
      nextEl.className = 'step-content active';
    }, 400);

    currentStep = nextStep;
  }

  // --- VALIDATION LOGIC ---
  function validateStep1() {
    let isValid = true;
    
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

  // --- EVENT LISTENERS (SURVEY) ---
  btnNext1.addEventListener('click', () => {
    if (validateStep1()) goToStep(2);
  });

  inputName.addEventListener('input', () => {
    if (inputName.value.trim().length >= 2) {
      nameError.classList.remove('show');
      inputName.closest('.input-wrapper').style.borderColor = '';
    }
  });

  inputId.addEventListener('input', () => {
    if (/^[0-9]{4,12}$/.test(inputId.value.trim())) {
      idError.classList.remove('show');
      inputId.closest('.input-wrapper').style.borderColor = '';
    }
  });

  ratingCards.forEach((card) => {
    card.addEventListener('click', () => {
      const rating = parseInt(card.dataset.rating);
      formData.rating = rating;
      ratingCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      ratingError.classList.remove('show');
    });
  });

  btnPrev2.addEventListener('click', () => goToStep(1));
  btnNext2.addEventListener('click', () => {
    if (validateStep2()) goToStep(3);
  });

  textFeedback.addEventListener('input', () => {
    const currentLen = textFeedback.value.length;
    currentCharCount.textContent = currentLen;
    if (currentLen >= 10) {
      feedbackError.classList.remove('show');
      textFeedback.closest('.textarea-wrapper').style.borderColor = '';
    }
  });

  btnPrev3.addEventListener('click', () => goToStep(2));
  btnSubmit.addEventListener('click', () => {
    if (validateStep3()) {
      submitSurvey();
    }
  });

  btnReset.addEventListener('click', resetSurvey);

  // ==========================================
  // ADMIN AUTHENTICATION EVENTS
  // ==========================================
  adminTriggerBtn.addEventListener('click', () => {
    adminAuthOverlay.classList.add('show');
    adminPasswordInput.focus();
  });

  function closeAuthModal() {
    adminAuthOverlay.classList.remove('show');
    adminPasswordInput.value = '';
    authError.classList.remove('show');
  }

  btnAuthCancel.addEventListener('click', closeAuthModal);

  function handleAdminAuth() {
    const pw = adminPasswordInput.value;
    // 기본 비밀번호: admin1234
    if (pw === 'admin1234') {
      closeAuthModal();
      appContainer.classList.add('admin-active');
      goToStep(5);
      fetchAdminData();
    } else {
      authError.classList.add('show');
      adminPasswordInput.focus();
    }
  }

  btnAuthSubmit.addEventListener('click', handleAdminAuth);
  adminPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdminAuth();
  });

  btnAdminExit.addEventListener('click', () => {
    appContainer.classList.remove('admin-active');
    resetSurvey();
  });

  btnAdminRefresh.addEventListener('click', () => {
    fetchAdminData();
  });

  // ==========================================
  // DATA SUBMISSION (POST)
  // ==========================================
  function submitSurvey() {
    // 1. Populate Receipt
    summaryName.textContent = formData.name;
    summaryId.textContent = formData.studentId;
    
    const ratingTexts = {
      1: '😢 1점 (매우 불만족)',
      2: '🙁 2점 (불만족)',
      3: '😐 3점 (보통)',
      4: '🙂 4점 (만족)',
      5: '🥰 5점 (매우 만족)'
    };
    summaryRating.textContent = ratingTexts[formData.rating];

    summaryRating.style.color = `var(--rating-${formData.rating})`;
    summaryRating.style.backgroundColor = `var(--rating-${formData.rating}-glow)`;
    summaryRating.style.borderColor = `var(--rating-${formData.rating})`;

    // 2. HTTP POST Request to Google Apps Script
    const isUrlConfigured = GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE';
    
    if (isUrlConfigured) {
      // Send data as URLSearchParams (Apps Script deals with Form urlencoded easily)
      const params = new URLSearchParams();
      params.append('name', formData.name);
      params.append('studentId', formData.studentId);
      params.append('rating', formData.rating);
      params.append('feedback', formData.feedback);

      // no-cors allows sending without triggering preflight blocks on Apps Script
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      }).then(() => {
        console.log('Survey submitted to Google Sheets successfully.');
      }).catch((err) => {
        console.error('Error submitting survey:', err);
      });
    } else {
      console.log('[Demo Mode] Google Sheet URL not set. Data logged below:');
      console.log(formData);
    }

    // 3. Move to thank you screen & start confetti
    goToStep(4);
    startConfetti();
  }

  function resetSurvey() {
    formData.name = '';
    formData.studentId = '';
    formData.rating = 0;
    formData.feedback = '';

    inputName.value = '';
    inputId.value = '';
    textFeedback.value = '';
    currentCharCount.textContent = '0';

    ratingCards.forEach((c) => c.classList.remove('selected'));

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

  // ==========================================
  // FETCH ADMIN DATA & LIVE RENDER (GET)
  // ==========================================
  const mockResponses = [
    { name: '김지현', studentId: '20251004', rating: 5, feedback: '수업이 지루하지 않고 실제 코딩 실습이 많아 유익했습니다. 감사합니다!' },
    { name: '이민수', studentId: '20261102', rating: 4, feedback: '교수님 강의 설명이 명쾌합니다. 과제가 조금 어렵지만 배울 점이 많아요.' },
    { name: '박서연', studentId: '20241249', rating: 3, feedback: '전반적으로 만족하지만 진도가 조금 빨라서 따라가기 벅찬 감이 있었습니다.' },
    { name: '최동현', studentId: '20260233', rating: 5, feedback: '동작 원리를 그림과 시각 자료로 설명해 주셔서 쉽게 이해되었습니다.' },
    { name: '정유진', studentId: '20250912', rating: 4, feedback: '수업 내용이 알차고 피드백을 바로바로 해주셔서 좋았습니다.' }
  ];

  function fetchAdminData() {
    adminSyncStatus.textContent = '불러오는 중';
    adminSyncStatus.className = 'stat-value status-badge syncing';

    const isUrlConfigured = GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE';

    if (isUrlConfigured) {
      // Fetch data from Google Apps Script (GET returns JSON)
      fetch(GOOGLE_SCRIPT_URL)
        .then((res) => {
          if (!res.ok) throw new Error('Network response error');
          return res.json();
        })
        .then((data) => {
          renderDashboard(data);
          adminSyncStatus.textContent = '실시간 연동';
          adminSyncStatus.className = 'stat-value status-badge success';
        })
        .catch((err) => {
          console.error('Failed to fetch sheets data:', err);
          adminSyncStatus.textContent = '연동 실패';
          adminSyncStatus.className = 'stat-value status-badge error';
          // Fallback to mock data so layout doesn't break
          renderDashboard(mockResponses);
        });
    } else {
      // Simulated delay for Demo mode
      setTimeout(() => {
        renderDashboard(mockResponses);
        adminSyncStatus.textContent = '데모 모드';
        adminSyncStatus.className = 'stat-value status-badge error'; // Alert colors
      }, 800);
    }
  }

  function renderDashboard(data) {
    if (!data || data.length === 0) {
      adminTotalStudents.textContent = '0';
      adminAvgRating.textContent = '0.0';
      adminTableBody.innerHTML = `<tr><td colspan="4" class="table-empty">제출된 설문 조사가 아직 없습니다.</td></tr>`;
      
      // Reset charts
      for (let i = 1; i <= 5; i++) {
        document.getElementById(`bar-${i}`).style.width = '0%';
        document.getElementById(`count-${i}`).textContent = '0명 (0%)';
      }
      return;
    }

    const total = data.length;
    adminTotalStudents.textContent = total;

    // Calculate rating details
    let sumRating = 0;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    data.forEach((item) => {
      const r = parseInt(item.rating);
      sumRating += r;
      if (ratingCounts[r] !== undefined) {
        ratingCounts[r]++;
      }
    });

    const average = (sumRating / total).toFixed(1);
    adminAvgRating.textContent = average;

    // Render bar charts
    for (let i = 1; i <= 5; i++) {
      const count = ratingCounts[i];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      
      const bar = document.getElementById(`bar-${i}`);
      const countText = document.getElementById(`count-${i}`);
      
      bar.style.width = `${percentage}%`;
      countText.textContent = `${count}명 (${percentage}%)`;
    }

    // Render Response Table
    adminTableBody.innerHTML = '';
    
    // Reverse order (most recent first)
    const reversedData = [...data].reverse();
    
    reversedData.forEach((student) => {
      const tr = document.createElement('tr');
      
      const ratingEmojis = { 1: '😢', 2: '🙁', 3: '😐', 4: '🙂', 5: '🥰' };
      const ratingEmoji = ratingEmojis[student.rating] || '😐';

      tr.innerHTML = `
        <td>${escapeHtml(student.name)}</td>
        <td>${escapeHtml(student.studentId)}</td>
        <td>
          <span class="table-rating-badge" style="color: var(--rating-${student.rating}); background: var(--rating-${student.rating}-glow);">
            ${ratingEmoji} ${student.rating}점
          </span>
        </td>
        <td>${escapeHtml(student.feedback)}</td>
      `;
      adminTableBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    str = String(str);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
