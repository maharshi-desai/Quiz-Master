const categoriesData = [
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

const state = {
    allQuestions: [],
    filteredQuestions: [],
    currentIndex: 0,
    score: 0,
    hasAnswered: false
};

const UI = {
    themeT: document.getElementById('theme-toggle'),
    catSel: document.getElementById('category-select'),
    diffSel: document.getElementById('difficulty-select'),
    sortSel: document.getElementById('sort-select'),
    searchInput: document.getElementById('search-input'),
    vLoad: document.getElementById('loading-view'),
    vError: document.getElementById('error-view'),
    vQuiz: document.getElementById('quiz-view'),
    vEmpty: document.getElementById('empty-view'),
    errMsg: document.getElementById('error-message'),
    btnRetry: document.getElementById('retry-btn'),
    btnNext: document.getElementById('next-btn'),
    qCategory: document.getElementById('question-category'),
    qDifficulty: document.getElementById('question-difficulty'),
    qText: document.getElementById('question-text'),
    scoreDisp: document.getElementById('score-display'),
    curNum: document.getElementById('current-question-num'),
    totNum: document.getElementById('total-questions-num'),
    optList: document.getElementById('options-container'),
    progressBar: document.getElementById('progress-bar')
};

const decodeText = (str) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
};

const randomizeOrder = (arr) => arr
    .map(val => ({ val, sortVal: Math.random() }))
    .sort((a, b) => a.sortVal - b.sortVal)
    .map(obj => obj.val);

const transformQuestion = (apiData) => ({
    category: decodeText(apiData.category),
    difficulty: apiData.difficulty,
    question: decodeText(apiData.question),
    correctAnswer: decodeText(apiData.correct_answer),
    answers: randomizeOrder([
        apiData.correct_answer, 
        ...apiData.incorrect_answers
    ]).map(decodeText)
});

const activateView = (viewName) => {
    [UI.vLoad, UI.vError, UI.vQuiz, UI.vEmpty].map(el => {
        el.classList.add('hidden');
        el.classList.remove('flex');
    });

    if (viewName === 'loading') {
        UI.vLoad.classList.remove('hidden');
        UI.vLoad.classList.add('flex');
    } else if (viewName === 'error') {
        UI.vError.classList.remove('hidden');
        UI.vError.classList.add('flex');
    } else if (viewName === 'quiz') {
        UI.vQuiz.classList.remove('hidden');
        UI.vQuiz.classList.add('flex');
    } else if (viewName === 'empty') {
        UI.vEmpty.classList.remove('hidden');
        UI.vEmpty.classList.add('flex');
    }
};

const hydrateCategories = () => {
    categoriesData.map(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        UI.catSel.appendChild(opt);
        return cat; 
    });
};

const evaluatePipeline = () => {
    const term = UI.searchInput.value.toLowerCase().trim();
    const diffLevel = UI.diffSel.value;
    const sortMethod = UI.sortSel.value;

    state.filteredQuestions = state.allQuestions.filter(item => {
        const searchPass = term === '' || 
            item.question.toLowerCase().includes(term) ||
            item.answers.find(ans => ans.toLowerCase().includes(term)) !== undefined;
        
        const diffPass = diffLevel === 'any' || item.difficulty === diffLevel;
        
        return searchPass && diffPass;
    });

    if (sortMethod === 'alpha') {
        state.filteredQuestions.sort((a, b) => a.question.localeCompare(b.question));
    } else if (sortMethod === 'difficulty') {
        const levels = { easy: 1, medium: 2, hard: 3 };
        state.filteredQuestions.sort((a, b) => levels[a.difficulty] - levels[b.difficulty]);
    }

    state.currentIndex = 0;
    renderPrompt();
};

const renderPrompt = () => {
    if (state.filteredQuestions.length === 0) {
        activateView('empty');
        return;
    }

    activateView('quiz');
    state.hasAnswered = false;
    UI.btnNext.classList.add('hidden');
    UI.optList.innerHTML = '';
    
    const curr = state.filteredQuestions[state.currentIndex];

    UI.qCategory.textContent = curr.category;
    UI.qDifficulty.textContent = curr.difficulty;
    UI.scoreDisp.textContent = state.score;
    UI.curNum.textContent = state.currentIndex + 1;
    UI.totNum.textContent = state.filteredQuestions.length;
    UI.qText.textContent = curr.question;

    curr.answers.map(ansText => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = ansText;
        btn.onclick = () => registerClick(ansText, btn);
        UI.optList.appendChild(btn);
        return ansText;
    });

    const progress = ((state.currentIndex + 1) / state.filteredQuestions.length) * 100;
    if (UI.progressBar) UI.progressBar.style.width = progress + '%';
};

const registerClick = (chosenAns, elementClicked) => {
    if (state.hasAnswered) return;
    state.hasAnswered = true;

    const curr = state.filteredQuestions[state.currentIndex];
    const correct = chosenAns === curr.correctAnswer;

    if (correct) {
        state.score += 1;
        UI.scoreDisp.textContent = state.score;
    }

    Array.from(UI.optList.children).map(btnElm => {
        const textVal = btnElm.textContent;
        btnElm.disabled = true;

        if (textVal === curr.correctAnswer) {
            btnElm.classList.add('correct');
        } else if (textVal === chosenAns && !correct) {
            btnElm.classList.add('incorrect');
        } else {
            btnElm.style.opacity = '0.4';
        }
        return btnElm;
    });

    UI.btnNext.classList.remove('hidden');
    const atEnd = state.currentIndex === state.filteredQuestions.length - 1;
    UI.btnNext.textContent = atEnd ? "Finish & Play Again" : "Next Question";
};

const networkFetch = async () => {
    activateView('loading');
    state.score = 0;
    state.currentIndex = 0;
    
    const catId = UI.catSel.value;
    let targetEndpoint = 'https://opentdb.com/api.php?amount=10';
    if (catId !== 'any') targetEndpoint += `&category=${catId}`;

    try {
        const req = await fetch(targetEndpoint);
        if (!req.ok) throw new Error("HTTP connection failed");
        const respData = await req.json();

        if (respData.response_code !== 0 || !respData.results || respData.results.length === 0) {
            throw new Error("No trivia questions returned for this selection.");
        }

        state.allQuestions = respData.results.map(transformQuestion);
        
        evaluatePipeline();

    } catch (err) {
        console.error(err);
        UI.errMsg.textContent = err.message || "Failed to load knowledge. Please retry.";
        activateView('error');
    }
};

const injectTriggers = () => {
    UI.themeT.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
    });

    UI.catSel.addEventListener('change', networkFetch);
    UI.btnRetry.addEventListener('click', networkFetch);

    [UI.searchInput, UI.diffSel, UI.sortSel].map(node => {
        node.addEventListener('input', evaluatePipeline);
        return node;
    });

    UI.btnNext.addEventListener('click', () => {
        if (state.currentIndex < state.filteredQuestions.length - 1) {
            state.currentIndex += 1;
            renderPrompt();
        } else {
            networkFetch();
        }
    });
};

const AppStart = () => {
    hydrateCategories();
    injectTriggers();
    networkFetch();
};

window.addEventListener('DOMContentLoaded', AppStart);
