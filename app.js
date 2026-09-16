// ========== VARIÁVEIS GLOBAIS ==========
let currentUser = null;
let currentGame = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkIfLoggedIn();
});

function setupEventListeners() {
    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Registro
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// ========== VERIFICAR SE ESTÁ LOGADO ==========
function checkIfLoggedIn() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            showCasinoScreen();
        } catch (e) {
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

// ========== TELAS ==========
function showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('casinoScreen').classList.remove('active');
}

function showRegisterScreen() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.add('active');
    document.getElementById('casinoScreen').classList.remove('active');
}

function showCasinoScreen() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.remove('active');
    document.getElementById('casinoScreen').classList.add('active');
    updateUserDisplay();
    loadLeaderboard();
}

// ========== LOGIN ==========
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = db.loginUser(username, password);
    
    if (result.success) {
        currentUser = result.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('loginForm').reset();
        showCasinoScreen();
    } else {
        alert(result.message);
    }
}

// ========== REGISTRO ==========
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const balance = parseFloat(document.getElementById('registerBalance').value);
    
    if (password.length < 6) {
        alert('Senha deve ter no mínimo 6 caracteres!');
        return;
    }
    
    const result = db.createUser(username, email, password, balance);
    
    if (result.success) {
        alert(result.message);
        document.getElementById('registerForm').reset();
        showLoginScreen();
    } else {
        alert(result.message);
    }
}

// ========== LOGOUT ==========
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        currentUser = null;
        currentGame = null;
        localStorage.removeItem('currentUser');
        showLoginScreen();
    }
}

// ========== ATUALIZAR DISPLAY DO USUÁRIO ==========
function updateUserDisplay() {
    if (!currentUser) return;
    
    const freshUser = db.getUser(currentUser.username);
    if (freshUser) {
        currentUser = freshUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    document.getElementById('userGreeting').textContent = `Bem-vindo, ${currentUser.username}! 🦈`;
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('userBalance').textContent = `$${currentUser.balance.toFixed(2)}`;
}

// ========== NAVEGAÇÃO DE ABAS ==========
function switchTab(tab) {
    // Remover active de todos os items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Remover active de todos os tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Adicionar active ao item e tab selecionados
    if (tab === 'games') {
        document.querySelector('.menu-item').classList.add('active');
        document.getElementById('gamesTab').classList.add('active');
    } else if (tab === 'history') {
        document.querySelectorAll('.menu-item')[1].classList.add('active');
        document.getElementById('historyTab').classList.add('active');
        loadBetHistory();
    } else if (tab === 'leaderboard') {
        document.querySelectorAll('.menu-item')[2].classList.add('active');
        document.getElementById('leaderboardTab').classList.add('active');
        loadLeaderboard();
    } else if (tab === 'info') {
        document.querySelectorAll('.menu-item')[3].classList.add('active');
        document.getElementById('infoTab').classList.add('active');
    }
}

// ========== HISTÓRICO DE APOSTAS ==========
function loadBetHistory() {
    const bets = db.getUserBets(currentUser.username);
    const tbody = document.getElementById('historyBody');
    
    if (bets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">Nenhuma aposta ainda</td></tr>';
        return;
    }
    
    tbody.innerHTML = bets.reverse().map(bet => `
        <tr>
            <td>${new Date(bet.timestamp).toLocaleString('pt-BR')}</td>
            <td>${bet.game}</td>
            <td>$${bet.betAmount.toFixed(2)}</td>
            <td>${bet.result}</td>
            <td class="${bet.profit > 0 ? 'win' : 'loss'}">
                ${bet.profit > 0 ? '+' : ''}$${bet.profit.toFixed(2)}
            </td>
        </tr>
    `).join('');
}

// ========== RANKING ==========
function loadLeaderboard() {
    const leaderboard = db.getLeaderboard();
    const tbody = document.getElementById('leaderboardBody');
    
    tbody.innerHTML = leaderboard.map((user, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${user.username} ${currentUser.username === user.username ? '👑' : ''}</td>
            <td>$${user.balance.toFixed(2)}</td>
            <td>${user.totalBets}</td>
        </tr>
    `).join('');
}

// ========== INICIAR JOGO ==========
function startGame(gameType) {
    currentGame = gameType;
    document.getElementById('gamesTab').classList.remove('active');
    document.getElementById('gameTab').classList.add('active');
    
    const gameTitle = {
        'coinflip': 'Cara ou Coroa 🪙',
        'dice': 'Dados ����',
        'slots': 'Máquina Caça-Níqueis 🎰',
        'roulette': 'Roleta 🎡',
        'blackjack': 'Blackjack 🎴'
    };
    
    document.getElementById('gameTitle').textContent = gameTitle[gameType];
    renderGameScreen(gameType);
}

function backToGames() {
    currentGame = null;
    document.getElementById('gameTab').classList.remove('active');
    document.getElementById('gamesTab').classList.add('active');
    document.getElementById('gameContent').innerHTML = '';
    updateUserDisplay();
}

// ========== RENDERIZAR TELAS DOS JOGOS ==========
function renderGameScreen(gameType) {
    const gameContent = document.getElementById('gameContent');
    
    switch(gameType) {
        case 'coinflip':
            renderCoinFlipGame(gameContent);
            break;
        case 'dice':
            renderDiceGame(gameContent);
            break;
        case 'slots':
            renderSlotsGame(gameContent);
            break;
        case 'roulette':
            renderRouletteGame(gameContent);
            break;
        case 'blackjack':
            renderBlackjackGame(gameContent);
            break;
    }
}

// ========== CARA OU COROA ==========
function renderCoinFlipGame(container) {
    container.innerHTML = `
        <div class="bet-form">
            <div class="form-group">
                <label>Escolha um lado:</label>
                <select id="coinChoice" class="coin-select">
                    <option value="heads">Cara (Heads)</option>
                    <option value="tails">Coroa (Tails)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Valor da Aposta ($):</label>
                <input type="number" id="coinBet" placeholder="Ex: 100" min="1" step="1" value="100">
            </div>
            <button class="btn btn-primary" onclick="playGame('coinflip')">Jogar 🎯</button>
        </div>
        <div id="coinResult"></div>
    `;
}

// ========== DADOS ==========
function renderDiceGame(container) {
    container.innerHTML = `
        <div class="bet-form">
            <div class="form-group">
                <label>Escolha um número (1-6):</label>
                <select id="diceChoice" class="dice-select">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
            </div>
            <div class="form-group">
                <label>Valor da Aposta ($):</label>
                <input type="number" id="diceBet" placeholder="Ex: 100" min="1" step="1" value="100">
            </div>
            <button class="btn btn-primary" onclick="playGame('dice')">Jogar 🎯</button>
        </div>
        <div id="diceResult"></div>
    `;
}

// ========== CAÇA-NÍQUEIS ==========
function renderSlotsGame(container) {
    container.innerHTML = `
        <div class="bet-form">
            <div class="form-group">
                <label>Valor da Aposta ($):</label>
                <input type="number" id="slotsBet" placeholder="Ex: 100" min="1" step="1" value="100">
            </div>
            <button class="btn btn-primary" onclick="playGame('slots')">Girar 🎰</button>
        </div>
        <div id="slotsResult"></div>
    `;
}

// ========== ROLETA ==========
function renderRouletteGame(container) {
    container.innerHTML = `
        <div class="roulette-container">
            <div class="roulette-display" id="rouletteDisplay">🎡</div>
            <div class="roulette-options" id="rouletteOptions">
                ${Array.from({length: 37}, (_, i) => `
                    <button class="roulette-option" onclick="selectRouletteOption('${i}')">${i}</button>
                `).join('')}
                <button class="roulette-option" onclick="selectRouletteOption('red')">🔴 Vermelho</button>
                <button class="roulette-option" onclick="selectRouletteOption('black')">⚫ Preto</button>
                <button class="roulette-option" onclick="selectRouletteOption('par')">Par</button>
                <button class="roulette-option" onclick="selectRouletteOption('impar')">Ímpar</button>
                <button class="roulette-option" onclick="selectRouletteOption('maior')">1-18</button>
                <button class="roulette-option" onclick="selectRouletteOption('menor')">19-36</button>
            </div>
        </div>
        <div class="bet-form">
            <div class="form-group">
                <label>Seleção: <span id="selectedOption">Nenhuma</span></label>
            </div>
            <div class="form-group">
                <label>Valor da Aposta ($):</label>
                <input type="number" id="rouletteBet" placeholder="Ex: 100" min="1" step="1" value="100">
            </div>
            <button class="btn btn-primary" onclick="playGame('roulette')">Girar Roleta 🎡</button>
        </div>
        <div id="rouletteResult"></div>
    `;
}

let selectedRouletteOption = null;

function selectRouletteOption(option) {
    selectedRouletteOption = option;
    document.querySelectorAll('.roulette-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    const optionNames = {
        'red': 'Vermelho',
        'black': 'Preto',
        'par': 'Par',
        'impar': 'Ímpar',
        'maior': 'Maior (19-36)',
        'menor': 'Menor (1-18)'
    };
    
    document.getElementById('selectedOption').textContent = optionNames[option] || `Número ${option}`;
}

// ========== BLACKJACK ==========
function renderBlackjackGame(container) {
    container.innerHTML = `
        <div class="bet-form">
            <div class="form-group">
                <label>Valor da Aposta ($):</label>
                <input type="number" id="blackjackBet" placeholder="Ex: 100" min="1" step="1" value="100">
            </div>
            <button class="btn btn-primary" onclick="playGame('blackjack')">Jogar 🎴</button>
        </div>
        <div id="blackjackResult"></div>
    `;
}

// ========== EXECUTAR JOGO ==========
function playGame(gameType) {
    let betAmount = 0;
    let userChoice = null;

    switch(gameType) {
        case 'coinflip': {
            const choice = document.getElementById('coinChoice').value;
            const bet = parseFloat(document.getElementById('coinBet').value);
            userChoice = choice;
            betAmount = bet;
            break;
        }
        case 'dice': {
            const choice = document.getElementById('diceChoice').value;
            const bet = parseFloat(document.getElementById('diceBet').value);
            userChoice = choice;
            betAmount = bet;
            break;
        }
        case 'slots': {
            const bet = parseFloat(document.getElementById('slotsBet').value);
            betAmount = bet;
            break;
        }
        case 'roulette': {
            if (!selectedRouletteOption) {
                alert('Selecione uma opção na roleta!');
                return;
            }
            const bet = parseFloat(document.getElementById('rouletteBet').value);
            userChoice = selectedRouletteOption;
            betAmount = bet;
            break;
        }
        case 'blackjack': {
            const bet = parseFloat(document.getElementById('blackjackBet').value);
            betAmount = bet;
            break;
        }
    }

    // Validar aposta
    const validation = db.validateBet(currentUser.username, betAmount);
    if (!validation.valid) {
        alert(validation.message);
        return;
    }

    // Executar jogo
    let gameResult;
    switch(gameType) {
        case 'coinflip':
            gameResult = CasinoGames.coinFlip(userChoice, betAmount);
            break;
        case 'dice':
            gameResult = CasinoGames.rollDice(userChoice, betAmount);
            break;
        case 'slots':
            gameResult = CasinoGames.playSlots(betAmount);
            break;
        case 'roulette':
            gameResult = CasinoGames.playRoulette(userChoice, betAmount);
            break;
        case 'blackjack':
            gameResult = CasinoGames.playBlackjack(userChoice, betAmount);
            break;
    }

    // Atualizar saldo
    const profit = gameResult.winAmount - betAmount;
    db.updateUserBalance(currentUser.username, profit);
    db.updateUserStats(currentUser.username, betAmount, gameResult.won);
    
    // Adicionar ao histórico
    db.addBet(
        currentUser.username,
        gameType.charAt(0).toUpperCase() + gameType.slice(1),
        betAmount,
        gameResult.resultText,
        gameResult.winAmount
    );

    updateUserDisplay();
    displayGameResult(gameType, gameResult);
}

function displayGameResult(gameType, result) {
    let resultHTML = `
        <div class="game-result ${result.won ? 'win' : 'loss'}">
            <div>
                <h3>${result.message}</h3>
                <p>${result.resultText}</p>
    `;

    if (gameType === 'slots') {
        resultHTML += `
            <div class="slots-display">
                ${result.reels.map(reel => `<div class="slot">${reel}</div>`).join('')}
            </div>
        `;
    }

    resultHTML += `
                <p style="margin-top: 20px; font-size: 1.2em;">
                    Ganho: <strong>$${result.winAmount.toFixed(2)}</strong>
                </p>
            </div>
        </div>
        <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 20px;">Jogar Novamente</button>
    `;

    const resultElement = document.getElementById(`${gameType}Result`) || 
                         document.getElementById('gameContent');
    
    if (document.getElementById(`${gameType}Result`)) {
        document.getElementById(`${gameType}Result`).innerHTML = resultHTML;
    } else {
        const gameContent = document.getElementById('gameContent');
        const betForm = gameContent.querySelector('.bet-form');
        if (betForm) {
            betForm.remove();
        }
        gameContent.innerHTML += resultHTML;
    }
}
