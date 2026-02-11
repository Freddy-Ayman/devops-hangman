const defaultWords = [
    'DEVOPS', 'AGILE', 'VERSION', 'BRANCH', 'GITHUB', 
    'CHANGES', 'FEATURES', 'HOTFIX', 'CONTINUOUS', 'INTEGRATION',
    'DEPLOYMENT', 'TESTING', 'COMMIT', 'SNAPSHOT', 'CULTURE',
    'PIPELINE', 'DOCKER', 'SCRUM', 'KANBAN', 'MERGE'
];

let gameState = {
    player1: { name: '', score: 0 },
    player2: { name: '', score: 0 },
    currentPlayer: 1,
    currentWord: '',
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrong: 6,
    gameActive: false,
    usedWords: []
};

let wordBank = [];

document.addEventListener('DOMContentLoaded', function() {
    loadWordBank();
    generateKeyboard();
});

function toggleTheme() {
    const themeIcon = document.querySelector('.theme-icon');
    
    if (themeIcon.textContent === '🌙') {
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function loadWordBank() {
    const stored = localStorage.getItem('wordBank');
    if (stored) {
        wordBank = JSON.parse(stored);
    } else {
        wordBank = [...defaultWords];
        saveWordBank();
    }
    displayWordBank();
}

function saveWordBank() {
    localStorage.setItem('devopsWords', JSON.stringify(wordBank));
}

function displayWordBank() {
    const wordList = document.getElementById('wordList');
    const wordCount = document.getElementById('wordCount');
    
    wordCount.textContent = wordBank.length;
    
    if (wordBank.length === 0) {
        wordList.innerHTML = `
            <div class="empty-state">
                <h3>No words in the bank!</h3>
                <p>Add some DevOps terms to get started.</p>
            </div>
        `;
        return;
    }
    
    wordList.innerHTML = '';
    wordBank.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <span class="word">${word}</span>
            <div class="actions">
                <button class="edit-btn" onclick="editWord(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteWord(${index})">Delete</button>
            </div>
        `;
        wordList.appendChild(wordItem);
    });
}

function addWord() {
    const input = document.getElementById('newWord');
    const word = input.value.trim().toUpperCase();

    // FIX FOR BUG #1 (REQ-WB-02): Prevent empty words
    if (word === "") {
        alert("Empty words are not allowed!");
        return; // Exits the function so the word isn't added
    }

    // FIX FOR BUG #2 (REQ-WB-02): Prevent duplicate words
    if (wordBank.includes(word)) {
        alert("This word is already in the word bank!");
        return; // Stop the function so the duplicate isn't added
    }

    // FIX FOR BUG #3 (REQ-WB-02): Only allow A-Z
    // This regex checks if the string contains ONLY letters from A to Z
    const onlyLetters = /^[A-Z]+$/;
    if (!onlyLetters.test(word)) {
        alert("Words must only contain letters (A-Z). No numbers or symbols allowed!");
        return;
    }

    wordBank.push(word);
    input.value = '';
    saveWordBank();
    displayWordBank();
}

function editWord(index) {
    const oldWord = wordBank[index];
    const newWord = prompt('Edit word:', oldWord);
    
    // If user cancels the prompt, do nothing
    if (newWord === null) return;

    const formattedWord = newWord.trim().toUpperCase();

    // REQ-WB-03: Apply same validation rules as adding words
    if (formattedWord === "") {
        alert("Word cannot be empty!");
        return;
    }

    if (wordBank.includes(formattedWord) && formattedWord !== oldWord) {
        alert("This word already exists in the bank!");
        return;
    }

    const onlyLetters = /^[A-Z]+$/;
    if (!onlyLetters.test(formattedWord)) {
        alert("Words must only contain letters (A-Z)!");
        return;
    }

    // FIX: Update the word at the specific index instead of just splicing it away
    wordBank[index] = formattedWord; 
    
    saveWordBank();
    displayWordBank();
}

function deleteWord(index) {
    if (confirm('Are you sure you want to delete this word?')) {
        saveWordBank();
        displayWordBank();
    }
}

function generateKeyboard() {
    const keyboard = document.getElementById('keyboard');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    keyboard.innerHTML = '';
    for (let letter of letters) {
        const button = document.createElement('button');
        button.className = 'key';
        button.textContent = letter;
        button.onclick = () => guessLetter(letter);
        button.id = 'key-' + letter;
        keyboard.appendChild(button);
    }
}

function startGame() {
    const p1Name = document.getElementById('player1Name').value.trim();
    const p2Name = document.getElementById('player2Name').value.trim();
    
    // Validate that names are not empty
    if (!p1Name) {
        alert('Player 1 name cannot be empty');
        return;
    }
    if (!p2Name) {
        alert('Player 2 name cannot be empty');
        return;
    }
    
    // Validate that names are different
    if (p1Name === p2Name) {
        alert('Player 1 and Player 2 must have different names');
        return;
    }
    
    gameState.player1.name = p1Name;
    gameState.player2.name = p2Name;
    
    document.getElementById('player1Display').textContent = gameState.player1.name;
    document.getElementById('player2Display').textContent = gameState.player2.name;
    
    document.getElementById('gameArea').style.display = 'block';
    
    nextRound();
}

function nextRound() {
    if (wordBank.length === 0) {
        alert('No words in the word bank! Add some words first.');
        return;
    }
    
    gameState.guessedLetters = [];
    gameState.wrongGuesses = 0;
    gameState.gameActive = true;
    
    const randomIndex = Math.floor(Math.random() * wordBank.length);
    gameState.currentWord = wordBank[randomIndex];
    
    document.getElementById('gameStatus').classList.remove('show');
    document.getElementById('gameStatus').className = 'game-status';
    resetHangman();
    resetKeyboard();
    updateWordDisplay();
    updateWrongLetters();
    updateLives();
    updateCurrentPlayer();
}

function guessLetter(letter) {
    if (!gameState.gameActive) return;
    
    if (gameState.guessedLetters.includes(letter)) {
        return;
    }
    
    gameState.guessedLetters.push(letter);
    
    // Disable the button
    const button = document.getElementById('key-' + letter);
    button.disabled = true;
    
    if (!gameState.currentWord.includes(letter)) {
        gameState.wrongGuesses++;
        updateHangman();
    }
    
    updateWordDisplay();
    updateWrongLetters();
    updateLives();
    checkGameStatus();
}

function updateWordDisplay() {
    const display = document.getElementById('wordDisplay');
    let displayText = '';
    
    for (let letter of gameState.currentWord) {
        if (gameState.guessedLetters.includes(letter)) {
            displayText += letter + ' ';
        } else {
            displayText += '_ ';
        }
    }
    
    display.textContent = displayText.trim();
}

function updateWrongLetters() {
    const wrongLettersDiv = document.getElementById('wrongLetters');
    const wrong = gameState.guessedLetters.filter(letter => 
        !gameState.currentWord.includes(letter)
    );
    
    if (wrong.length === 0) {
        wrongLettersDiv.textContent = 'None yet';
    } else {
        wrongLettersDiv.textContent = gameState.guessedLetters.join(', ');
    }
}

function updateLives() {
    const livesLeft = gameState.maxWrong - gameState.wrongGuesses;
    document.getElementById('livesLeft').textContent = livesLeft;
}

function updateHangman() {
    const parts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
    
    const wrongOrder = ['head', 'leftArm', 'rightArm', 'body', 'leftLeg', 'rightLeg'];
    const partIndex = gameState.wrongGuesses - 1;
    
    if (partIndex >= 0 && partIndex < wrongOrder.length) {
        const partToShow = wrongOrder[partIndex];
        document.getElementById(partToShow).style.display = 'block';
    }
}

function resetHangman() {
    const parts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
    parts.forEach(part => {
        document.getElementById(part).style.display = 'none';
    });
}

function resetKeyboard() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let letter of letters) {
        const button = document.getElementById('key-' + letter);
        if (button) {
            button.disabled = false;
        }
    }
}

function updateCurrentPlayer() {
    const player1Div = document.getElementById('player1Score');
    const player2Div = document.getElementById('player2Score');
    
    if (gameState.currentPlayer === 1) {
        player1Div.classList.add('active');
        player2Div.classList.remove('active');
    } else {
        player1Div.classList.remove('active');
        player2Div.classList.add('active');
    }
}

function checkGameStatus() {
    const allLettersGuessed = [...gameState.currentWord].every(letter =>
        gameState.guessedLetters.includes(letter)
    );
    
    if (allLettersGuessed) {
        gameWon();
        return;
    }
    
    if (gameState.wrongGuesses >= gameState.maxWrong) {
        gameLost();
        return;
    }
}

function gameWon() {
    gameState.gameActive = false;
    
    if (gameState.currentPlayer === 1) {
        gameState.player1.score += 10;
        document.getElementById('score1').textContent = gameState.player1.score;
    } else {
        gameState.player2.score += 10;
        document.getElementById('score2').textContent = gameState.player2.score;
    }
    
    const statusDiv = document.getElementById('gameStatus');
    const statusMsg = document.getElementById('statusMessage');
    
    const winnerName = gameState.currentPlayer === 1 ? 
        gameState.player1.name : gameState.player2.name;
    
    statusMsg.textContent = `🎉 ${winnerName} won! The word was: ${gameState.currentWord}`;
    statusDiv.classList.add('show', 'winner');
    
    // Switch to next player
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
}

function gameLost() {
    gameState.gameActive = false;
    
    const statusDiv = document.getElementById('gameStatus');
    const statusMsg = document.getElementById('statusMessage');
    
    const currentPlayerName = gameState.currentPlayer === 1 ? 
        gameState.player1.name : gameState.player2.name;
    
    statusMsg.textContent = `😢 ${currentPlayerName} lost! The word was: ${gameState.currentWord}`;
    statusDiv.classList.add('show', 'loser');
    
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
}
