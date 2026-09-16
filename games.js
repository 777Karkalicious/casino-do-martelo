// ========== JOGOS DO CASINO ==========

class CasinoGames {
    // ========== CARA OU COROA ==========
    static coinFlip(userChoice, betAmount) {
        const result = Math.random() > 0.5 ? 'heads' : 'tails';
        const won = userChoice === result;
        const winAmount = won ? betAmount * 2 : 0;

        return {
            result,
            won,
            winAmount,
            message: won ? '🎉 GANHOU! ' : '💸 PERDEU!',
            resultText: result === 'heads' ? 'Cara (Heads)' : 'Coroa (Tails)'
        };
    }

    // ========== DADOS ==========
    static rollDice(userChoice, betAmount) {
        const result = Math.floor(Math.random() * 6) + 1;
        const won = parseInt(userChoice) === result;
        const winAmount = won ? betAmount * 5.5 : 0;

        return {
            result,
            won,
            winAmount,
            message: won ? '🎉 GANHOU! ' : '💸 PERDEU!',
            resultText: `Saiu o número ${result}`
        };
    }

    // ========== CAÇA-NÍQUEIS ==========
    static playSlots(betAmount) {
        const symbols = ['🍎', '🍊', '🍋', '🍌', '🍉', '🎯', '💎', '👑'];
        const reels = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        // Checar vitórias
        let won = false;
        let multiplier = 0;

        if (reels[0] === reels[1] && reels[1] === reels[2]) {
            // Três iguais - Jackpot!
            multiplier = 10;
            won = true;
        } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
            // Dois iguais
            multiplier = 2;
            won = true;
        }

        const winAmount = won ? betAmount * multiplier : 0;

        return {
            reels,
            won,
            multiplier,
            winAmount,
            message: won ? `🎉 GANHOU ${multiplier}x!` : '💸 PERDEU!',
            resultText: won ? `Padrão vencedor: ${multiplier}x` : 'Sem padrão'
        };
    }

    // ========== ROLETA ==========
    static playRoulette(userChoice, betAmount) {
        const result = Math.floor(Math.random() * 37); // 0-36
        const colors = this.getRouletteColors();
        const resultColor = colors[result];

        let won = false;
        let multiplier = 0;

        // Verificar se acertou o número
        if (parseInt(userChoice) === result) {
            multiplier = 35;
            won = true;
        }
        // Verificar se acertou a cor
        else if (userChoice === resultColor) {
            multiplier = 1.5;
            won = true;
        }
        // Verificar se acertou par/ímpar
        else if (userChoice === 'par' && result % 2 === 0 && result !== 0) {
            multiplier = 1.5;
            won = true;
        }
        else if (userChoice === 'impar' && result % 2 !== 0) {
            multiplier = 1.5;
            won = true;
        }
        // Verificar se acertou maior/menor
        else if (userChoice === 'maior' && result > 18) {
            multiplier = 1.5;
            won = true;
        }
        else if (userChoice === 'menor' && result < 19 && result !== 0) {
            multiplier = 1.5;
            won = true;
        }

        const winAmount = won ? Math.floor(betAmount * multiplier) : 0;

        return {
            result,
            resultColor,
            won,
            multiplier,
            winAmount,
            message: won ? `🎉 GANHOU ${multiplier}x!` : '💸 PERDEU!',
            resultText: `Número ${result} (${resultColor})`
        };
    }

    static getRouletteColors() {
        const colors = {
            0: 'green',
            1: 'red', 3: 'red', 5: 'red', 7: 'red', 9: 'red',
            12: 'red', 14: 'red', 16: 'red', 18: 'red', 19: 'red',
            21: 'red', 23: 'red', 25: 'red', 27: 'red', 30: 'red',
            32: 'red', 34: 'red', 36: 'red'
        };

        // Números pretos (todos os outros)
        for (let i = 1; i <= 36; i++) {
            if (!colors[i]) {
                colors[i] = 'black';
            }
        }

        return colors;
    }

    // ========== BLACKJACK SIMPLES ==========
    static playBlackjack(playerChoice, betAmount) {
        const getCardValue = (card) => {
            if (card === 'A') return 11;
            if (['K', 'Q', 'J'].includes(card)) return 10;
            return parseInt(card);
        };

        const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        // Distribuir cartas ao jogador
        const playerCard1 = cards[Math.floor(Math.random() * cards.length)];
        const playerCard2 = cards[Math.floor(Math.random() * cards.length)];
        let playerValue = getCardValue(playerCard1) + getCardValue(playerCard2);

        // Distribuir cartas ao dealer
        const dealerCard1 = cards[Math.floor(Math.random() * cards.length)];
        const dealerCard2 = cards[Math.floor(Math.random() * cards.length)];
        let dealerValue = getCardValue(dealerCard1) + getCardValue(dealerCard2);

        // Lógica simplificada
        let won = false;
        let multiplier = 0;

        if (playerValue === 21) {
            multiplier = 2.5;
            won = true;
        } else if (playerValue > 21) {
            won = false;
        } else if (dealerValue > 21) {
            multiplier = 2;
            won = true;
        } else if (playerValue > dealerValue) {
            multiplier = 2;
            won = true;
        } else if (playerValue === dealerValue) {
            multiplier = 1;
            won = true;
        }

        const winAmount = won ? Math.floor(betAmount * multiplier) : 0;

        return {
            playerCards: [playerCard1, playerCard2],
            playerValue,
            dealerCards: [dealerCard1, dealerCard2],
            dealerValue,
            won,
            multiplier,
            winAmount,
            message: won ? `🎉 GANHOU ${multiplier}x!` : '💸 PERDEU!',
            resultText: `Você: ${playerValue} | Dealer: ${dealerValue}`
        };
    }
}
