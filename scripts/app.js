import { flashcards } from './flashcards.js';

// Shuffle flashcards
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const shuffledFlashcards = shuffleArray([...flashcards]).slice(0, 10); // Take 10 random cards

// DOM elements
const loginSection = document.getElementById('loginSection');
const testSection = document.getElementById('testSection');
const resultsSection = document.getElementById('resultsSection');
const adminSection = document.getElementById('adminSection');
const adminResults = document.getElementById('adminResults');

const usernameInput = document.getElementById('usernameInput');
const startTestBtn = document.getElementById('startTestBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminAccessBtn = document.getElementById('adminAccessBtn');

const flashcard = document.getElementById('flashcard');
const cardFront = document.getElementById('cardFront');
const cardBack = document.getElementById('cardBack');
const correctBtn = document.getElementById('correctBtn');
const incorrectBtn = document.getElementById('incorrectBtn');
const currentCardSpan = document.getElementById('currentCard');
const totalCardsSpan = document.getElementById('totalCards');

const resultsUsername = document.getElementById('resultsUsername');
const resultsScore = document.getElementById('resultsScore');
const missedTerms = document.getElementById('missedTerms');
const retryBtn = document.getElementById('retryBtn');
const viewAllResultsBtn = document.getElementById('viewAllResultsBtn');

const resultsTableBody = document.getElementById('resultsTableBody');
const exportResultsBtn = document.getElementById('exportResultsBtn');
const backToTestBtn = document.getElementById('backToTestBtn');

// Test state
let currentUser = '';
let currentCardIndex = 0;
let correctAnswers = 0;
let missedTermsList = [];

// Initialize
totalCardsSpan.textContent = shuffledFlashcards.length;

// Event listeners
startTestBtn.addEventListener('click', startTest);
adminLoginBtn.addEventListener('click', showAdminLogin);
adminAccessBtn.addEventListener('click', checkAdminPassword);
flashcard.addEventListener('click', flipCard);
correctBtn.addEventListener('click', () => handleAnswer(true));
incorrectBtn.addEventListener('click', () => handleAnswer(false));
retryBtn.addEventListener('click', retryTest);
viewAllResultsBtn.addEventListener('click', showAdminLogin);
exportResultsBtn.addEventListener('click', exportResults);
backToTestBtn.addEventListener('click', backToTest);

// Functions
function startTest() {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    currentUser = username;
    currentCardIndex = 0;
    correctAnswers = 0;
    missedTermsList = [];
    
    loginSection.classList.add('hidden');
    testSection.classList.remove('hidden');
    showCurrentCard();
}

function showAdminLogin() {
    loginSection.classList.add('hidden');
    testSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
    adminResults.classList.add('hidden');
}

function checkAdminPassword() {
    const password = adminPasswordInput.value;
    if (password === 'Scissors65') {
        adminResults.classList.remove('hidden');
        loadAllResults();
    } else {
        alert('Incorrect admin password');
    }
}

function flipCard() {
    flashcard.classList.toggle('flipped');
}

function showCurrentCard() {
    const card = shuffledFlashcards[currentCardIndex];
    cardFront.textContent = card.term;
    cardBack.textContent = card.definition;
    currentCardSpan.textContent = currentCardIndex + 1;
    
    // Reset card state
    flashcard.classList.remove('flipped');
}

function handleAnswer(isCorrect) {
    const currentTerm = shuffledFlashcards[currentCardIndex].term;
    
    if (isCorrect) {
        correctAnswers++;
    } else {
        missedTermsList.push(currentTerm);
    }
    
    currentCardIndex++;
    
    if (currentCardIndex < shuffledFlashcards.length) {
        showCurrentCard();
    } else {
        endTest();
    }
}

function endTest() {
    testSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    resultsUsername.textContent = currentUser;
    resultsScore.textContent = `${correctAnswers}/${shuffledFlashcards.length}`;
    missedTerms.textContent = missedTermsList.join(', ') || 'None';
    
    // Save results
    saveResult(currentUser, correctAnswers, shuffledFlashcards.length, missedTermsList);
}

function saveResult(username, correct, total, missed) {
    const results = JSON.parse(localStorage.getItem('flashcardResults') || '[]');
    
    const result = {
        username,
        score: `${correct}/${total}`,
        date: new Date().toISOString(),
        missedTerms: missed.join(', ')
    };
    
    results.push(result);
    localStorage.setItem('flashcardResults', JSON.stringify(results));
}

function loadAllResults() {
    const results = JSON.parse(localStorage.getItem('flashcardResults')) || [];
    resultsTableBody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.username}</td>
            <td>${result.score}</td>
            <td>${new Date(result.date).toLocaleString()}</td>
            <td>${result.missedTerms}</td>
        `;
        resultsTableBody.appendChild(row);
    });
}

function retryTest() {
    resultsSection.classList.add('hidden');
    testSection.classList.remove('hidden');
    currentCardIndex = 0;
    correctAnswers = 0;
    missedTermsList = [];
    showCurrentCard();
}

function exportResults() {
    const results = JSON.parse(localStorage.getItem('flashcardResults')) || [];
    let csv = 'Username,Score,Date,Missed Terms\n';
    
    results.forEach(result => {
        csv += `"${result.username}","${result.score}","${result.date}","${result.missedTerms}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'flashcard_results.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function backToTest() {
    adminSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    usernameInput.value = '';
}
