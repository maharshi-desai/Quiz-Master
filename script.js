const API_URL = "https://opentdb.com/api.php?amount=10&type=multiple";

const loader = document.getElementById('loader');
const quizContainer = document.getElementById('quiz-container');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');


let questions = [];
let currentIndex = 0;


function decodeHTML(text) {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
}

async function fetchQuiz() {
    try {
        loader.classList.remove('hidden');
        quizContainer.classList.add('hidden');

        const response = await fetch(API_URL);
        const data = await response.json();
        
        questions = data.results; 
        renderQuestion();

    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load quiz. Please refresh.");
    }
}

function renderQuestion() {
    loader.classList.add('hidden');
    quizContainer.classList.remove('hidden');

    const currentQ = questions[currentIndex];

    questionText.innerText = decodeHTML(currentQ.question);

    const allOptions = [...currentQ.incorrect_answers, currentQ.correct_answer];
    
    allOptions.sort(() => Math.random() - 0.5);

    optionsContainer.innerHTML = "";
    
    allOptions.map(option => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = decodeHTML(option);
        
        btn.onclick = () => {
            alert("You clicked: " + btn.innerText);
        };
        
        optionsContainer.appendChild(btn);
    });
}


document.getElementById('next-btn').onclick = () => {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        alert("Quiz Complete!");
    }
};

fetchQuiz();