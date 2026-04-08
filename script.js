const categories = [
    {id:9,name:"General Knowledge"},
    {id:10,name:"Entertainment: Books"},
    {id:11,name:"Entertainment: Film"},
    {id:12,name:"Entertainment: Music"},
    {id:13,name:"Entertainment: Musicals & Theatres"},
    {id:14,name:"Entertainment: Television"},
    {id:15,name:"Entertainment: Video Games"},
    {id:16,name:"Entertainment: Board Games"},
    {id:17,name:"Science & Nature"},
    {id:18,name:"Science: Computers"},
    {id:19,name:"Science: Mathematics"},
    {id:20,name:"Mythology"},
    {id:21,name:"Sports"},
    {id:22,name:"Geography"},
    {id:23,name:"History"},
    {id:24,name:"Politics"},
    {id:25,name:"Art"},
    {id:26,name:"Celebrities"},
    {id:27,name:"Animals"},
    {id:28,name:"Vehicles"},
    {id:29,name:"Entertainment: Comics"},
    {id:30,name:"Science: Gadgets"},
    {id:31,name:"Entertainment: Japanese Anime & Manga"},
    {id:32,name:"Entertainment: Cartoon & Animations"}
];

// DOM Elements
const loader = document.getElementById('loader');
const quizContainer = document.getElementById('quiz-container');
const emptyState = document.getElementById('empty-state');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const categoryBadge = document.getElementById('category-badge');
const difficultyBadge = document.getElementById('difficulty-badge');
const questionProgress = document.getElementById('question-progress');
const scoreDisplay = document.getElementById('score-display');
const nextBtn = document.getElementById('next-btn');
const errorMessage = document.getElementById('error-message');

const themeToggle = document.getElementById('theme-toggle');
const categorySelect = document.getElementById('category-select');
const searchInput = document.getElementById('search-input');
const difficultyFilter = document.getElementById('difficulty-filter');
const sortSelect = document.getElementById('sort-select');

// State
let allQuestions = [];
let currentDisplayQuestions = [];
let currentIndex = 0;
let score = 0;
let answerSelected = false;

// Initialize
function init() {
    // Populate categories without for loop (using map)
    categories.map(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });

    // Theme logic setup
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // Event listeners
    themeToggle.onclick = toggleTheme;
    categorySelect.onchange = fetchQuiz;
    
    // Filters and sort listeners
    searchInput.oninput = applyFilters;
    difficultyFilter.onchange = applyFilters;
    sortSelect.onchange = applyFilters;

    nextBtn.onclick = handleNext;

    fetchQuiz();
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

function decodeHTML(text) {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
}

async function fetchQuiz() {
    try {
        loader.classList.remove('hidden');
        quizContainer.classList.add('hidden');
        emptyState.classList.add('hidden');
        errorMessage.classList.add('hidden');

        const catId = categorySelect.value;
        let url = "https://opentdb.com/api.php?amount=10&type=multiple";
        if (catId !== 'any') {
            url += `&category=${catId}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("HTTP connection failed");
        
        const data = await response.json();
        
        if (data.response_code !== 0 || !data.results || data.results.length === 0) {
            throw new Error(data.response_code === 5 ? "Too many requests. Please wait a few seconds." : "No trivia logic returned.");
        }
        
        allQuestions = data.results; 
        
        // Map over questions to pre-compute decoded question text for easier searching
        // No for loops used
        allQuestions = allQuestions.map((q, index) => {
            return {
                ...q,
                id: index,
                decodedQuestion: decodeHTML(q.question).toLowerCase()
            };
        });

        score = 0;
        updateScoreDisplay();
        
        applyFilters();

    } catch (error) {
        console.error("Error fetching data:", error);
        loader.classList.add('hidden');
        if (errorMessage.querySelector('p')) {
            errorMessage.querySelector('p').textContent = error.message.includes("Too many") || error.message.includes("No trivia") ? error.message : "Oops! Something went wrong while fetching the quiz.";
        }
        errorMessage.classList.remove('hidden');
    }
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const diffNode = difficultyFilter.value;
    const sortVal = sortSelect.value;

    // Filter using .filter() based on search term and difficulty
    let filtered = allQuestions.filter(q => {
        const matchesSearch = q.decodedQuestion.includes(searchTerm);
        const matchesDiff = diffNode === 'any' || q.difficulty === diffNode;
        return matchesSearch && matchesDiff;
    });

    // Sort using .sort() 
    if (sortVal !== 'default') {
        filtered = filtered.sort((a, b) => {
            if (sortVal === 'alpha-asc') return a.decodedQuestion.localeCompare(b.decodedQuestion);
            if (sortVal === 'alpha-desc') return b.decodedQuestion.localeCompare(a.decodedQuestion);
            
            const diffMap = { 'easy': 1, 'medium': 2, 'hard': 3 };
            if (sortVal === 'diff-asc') return diffMap[a.difficulty] - diffMap[b.difficulty];
            if (sortVal === 'diff-desc') return diffMap[b.difficulty] - diffMap[a.difficulty];
            return 0;
        });
    }

    currentDisplayQuestions = filtered;
    currentIndex = 0;

    loader.classList.add('hidden');
    
    if (currentDisplayQuestions.length === 0) {
        quizContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        renderQuestion();
    }
}

function renderQuestion() {
    const currentQ = currentDisplayQuestions[currentIndex];
    answerSelected = false;
    nextBtn.disabled = true;

    questionText.innerText = decodeHTML(currentQ.question);
    categoryBadge.innerText = decodeHTML(currentQ.category);
    difficultyBadge.innerText = currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1);
    questionProgress.innerText = `${currentIndex + 1}/${currentDisplayQuestions.length}`;

    // Apply color to difficulty badges
    difficultyBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold';
    if (currentQ.difficulty === 'easy') {
        difficultyBadge.classList.add('bg-green-100', 'text-green-800', 'dark:bg-green-900/30', 'dark:text-green-300');
    } else if (currentQ.difficulty === 'medium') {
        difficultyBadge.classList.add('bg-yellow-100', 'text-yellow-800', 'dark:bg-yellow-900/30', 'dark:text-yellow-300');
    } else {
        difficultyBadge.classList.add('bg-red-100', 'text-red-800', 'dark:bg-red-900/30', 'dark:text-red-300');
    }

    categoryBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';

    const allOptions = [...currentQ.incorrect_answers, currentQ.correct_answer];
    
    // Sort randomly
    allOptions.sort(() => Math.random() - 0.5);

    optionsContainer.innerHTML = "";
    
    // Iterate to build option buttons using .map()
    allOptions.map(option => {
        const btn = document.createElement('button');
        btn.className = `option-btn w-full text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent hover:border-apple-accent p-4 rounded-xl transition-all duration-200 text-sm md:text-base font-medium`;
        btn.innerText = decodeHTML(option);
        
        btn.onclick = () => handleAnswer(btn, option, currentQ.correct_answer);
        
        optionsContainer.appendChild(btn);
    });
    
    // Update button text logic
    if (currentIndex === currentDisplayQuestions.length - 1) {
        nextBtn.innerText = "Finish Quiz";
    } else {
        nextBtn.innerText = "Next Question";
    }
}

function handleAnswer(selectedBtn, selectedOption, correctAnswer) {
    if (answerSelected) return;
    answerSelected = true;

    // Use .find() and .map() on Array.from(children) to adhere to no-loop constraint
    const allBtns = Array.from(optionsContainer.children);
    const isCorrect = selectedOption === correctAnswer;
    
    if (isCorrect) {
        score++;
        updateScoreDisplay();
        selectedBtn.classList.remove('bg-gray-50', 'dark:bg-gray-800/50', 'hover:border-apple-accent', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
        selectedBtn.classList.add('bg-green-500', 'text-white', 'border-green-600', 'shadow-sm');
    } else {
        selectedBtn.classList.remove('bg-gray-50', 'dark:bg-gray-800/50', 'hover:border-apple-accent', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
        selectedBtn.classList.add('bg-red-500', 'text-white', 'border-red-600', 'shadow-sm');
        
        // Find correct button and highlight it using .find()
        const correctBtn = allBtns.find(b => b.innerText === decodeHTML(correctAnswer));
        if (correctBtn) {
            correctBtn.classList.remove('bg-gray-50', 'dark:bg-gray-800/50', 'hover:border-apple-accent');
            correctBtn.classList.add('bg-green-500/50', 'text-white', 'border-green-600/50', 'dark:bg-green-900/50');
        }
    }

    // Disable all buttons using .map()
    allBtns.map(btn => {
        btn.disabled = true;
        btn.classList.add('cursor-not-allowed');
        if (btn !== selectedBtn && btn.innerText !== decodeHTML(correctAnswer)) {
            btn.classList.add('opacity-50');
        }
    });

    nextBtn.disabled = false;
}

function handleNext() {
    if (currentIndex < currentDisplayQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        // Find quiz container to hide, show completion state
        quizContainer.innerHTML = `
            <div class="bg-apple-cardLight dark:bg-apple-cardDark rounded-3xl shadow-lg p-10 text-center border border-gray-100 dark:border-gray-800 animate-fade-in">
                <h2 class="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">Quiz Complete!</h2>
                <p class="text-xl mb-8">You scored <span class="font-bold text-apple-accent">${score}</span> out of ${currentDisplayQuestions.length}.</p>
                <button onclick="location.reload()" class="bg-apple-accent hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-transform transform active:scale-95 shadow-md">Play Again</button>
            </div>
        `;
    }
}

function updateScoreDisplay() {
    scoreDisplay.innerText = `Score: ${score}`;
}

// Start
init();