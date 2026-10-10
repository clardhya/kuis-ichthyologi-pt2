document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    
    const questionText = document.getElementById('question-text');
    const answerInput = document.getElementById('answer-input');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const btnRestart = document.getElementById('btn-restart');
    
    // State variables
    let currentIndex = 0;
    const totalQuestions = questions.length;
    let userAnswers = new Array(totalQuestions).fill('');

    // Initialize Quiz
    function initQuiz() {
        currentIndex = 0;
        userAnswers = new Array(totalQuestions).fill('');
        
        // Tampilkan Quiz Screen
        quizScreen.classList.remove('hidden');
        quizScreen.classList.add('active');
        
        // Sembunyikan Result Screen
        resultScreen.classList.add('hidden');
        resultScreen.classList.remove('active');
        
        loadQuestion();
    }

    // Load a Question based on currentIndex
    function loadQuestion() {
        const q = questions[currentIndex];
        
        // Setup text with fade animation effect
        questionText.style.opacity = 0;
        setTimeout(() => {
            questionText.textContent = `${q.id}. ${q.question}`;
            questionText.style.opacity = 1;
        }, 150);
        
        answerInput.value = userAnswers[currentIndex] || '';
        answerInput.focus();
        
        updateProgress();
        updateButtons();
    }

    // Update Progress Bar & Text
    function updateProgress() {
        progressText.textContent = `Soal ${currentIndex + 1} dari ${totalQuestions}`;
        // Calculate progress percentage
        const percentage = totalQuestions > 1 ? (currentIndex / (totalQuestions - 1)) * 100 : 100;
        progressBar.style.width = `${percentage}%`;
    }

    // Update Navigation Buttons Visibility & State
    function updateButtons() {
        btnPrev.disabled = currentIndex === 0;
        
        if (currentIndex === totalQuestions - 1) {
            btnNext.classList.add('hidden');
            btnSubmit.classList.remove('hidden');
        } else {
            btnNext.classList.remove('hidden');
            btnSubmit.classList.add('hidden');
        }
    }

    // Save User Answer
    function saveAnswer() {
        userAnswers[currentIndex] = answerInput.value.trim();
    }

    // Event Listeners for Navigation
    btnNext.addEventListener('click', () => {
        saveAnswer();
        if (currentIndex < totalQuestions - 1) {
            currentIndex++;
            loadQuestion();
        }
    });

    btnPrev.addEventListener('click', () => {
        saveAnswer();
        if (currentIndex > 0) {
            currentIndex--;
            loadQuestion();
        }
    });

    // Enter Key Support for quick submit (FIXED: panggil saveAnswer lebih dulu)
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveAnswer(); // Memastikan jawaban input aktif tersimpan
            if (currentIndex < totalQuestions - 1) {
                currentIndex++;
                loadQuestion();
            } else {
                btnSubmit.click();
            }
        }
    });

    // Final Submit Action
    btnSubmit.addEventListener('click', () => {
        saveAnswer();
        progressBar.style.width = '100%';
        
        setTimeout(() => {
            showResults();
        }, 400);
    });

    // Restart Action
    btnRestart.addEventListener('click', () => {
        initQuiz();
    });

    // Evaluate & Display Results
    function showResults() {
        quizScreen.classList.add('hidden');
        quizScreen.classList.remove('active');

        resultScreen.classList.remove('hidden');
        resultScreen.classList.add('active');
        
        let correctCount = 0;
        const breakdownContainer = document.getElementById('result-breakdown');
        breakdownContainer.innerHTML = '';

        userAnswers.forEach((ans, index) => {
            const q = questions[index];
            const isCorrect = checkAnswer(ans, q.accepted_answers);
            
            if (isCorrect) correctCount++;

            // Create breakdown item DOM
            const item = document.createElement('div');
            item.className = `result-item ${isCorrect ? 'correct' : 'wrong'}`;
            
            const givenAnsText = ans === '' ? 'Tidak dijawab' : ans;
            
            item.innerHTML = `
                <div class="result-item-q">${q.id}. ${q.question}</div>
                <div class="result-item-a">
                    Jawaban Anda: <span>${givenAnsText}</span> <br/>
                    Kunci Jawaban: <strong>${q.accepted_answers[0]}</strong> <br/>
                    <em>Penjelasan: ${q.explanation}</em>
                </div>
            `;
            breakdownContainer.appendChild(item);
        });

        const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
        
        document.getElementById('score-text').textContent = scorePercentage;
        document.getElementById('correct-count').textContent = correctCount;
        
        // Animate conic gradient circle
        const circle = document.querySelector('.score-circle');
        circle.style.background = `conic-gradient(var(--accent-blue) ${scorePercentage}%, rgba(255,255,255,0.03) 0%)`;
    }

    // Validate Answer (FIXED: Pencocokan jawaban yang presisi)
    function checkAnswer(userAns, acceptedAnswers) {
        if (!userAns) return false;
        
        // Normalize answer: Lowercase, remove special characters & double spaces
        const normalized = userAns.toLowerCase().replace(/[.,!?;:()]/g, '').replace(/\s+/g, ' ').trim();
        
        return acceptedAnswers.some(accepted => {
            const accNorm = accepted.toLowerCase().trim();
            // Cek persis sama ATAU mengandung frasa kunci utuh
            return normalized === accNorm || normalized.includes(accNorm);
        });
    }

    // Provide smooth transition for question texts
    questionText.style.transition = 'opacity 0.2s ease';

    // Start App
    initQuiz();
});