// Memory Game - Match pairs of emojis
class MemoryGame {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.gameArea = gameManager.gameArea;
        this.audioContext = gameManager.audioContext;
        
        this.isPlaying = false;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 2; // Start with 2 pairs for testing
        this.startTime = null;
        this.bestTime = this.loadBestTime();
        
        // Emojis from categories
        this.availableEmojis = [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
            '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
            '⭐', '🌟', '✨', '💫', '🌈', '☀️', '🌙', '⚡',
            '❤️', '💛', '💚', '💙', '💜', '🧡', '🎈', '🎁',
            '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒'
        ];
        
        this.setupUI();
    }
    
    setupUI() {
        // Hide challenge prompt and category selector from FindEmojiGame
        const challengePrompt = document.getElementById('challengePrompt');
        const categorySelector = document.getElementById('categorySelector');
        const targetEmojiDisplay = document.getElementById('targetEmoji');
        
        if (challengePrompt) challengePrompt.classList.remove('active');
        if (categorySelector) categorySelector.style.display = 'none';
        
        // Show best time in the target display area
        if (targetEmojiDisplay) {
            if (this.bestTime) {
                targetEmojiDisplay.innerHTML = `<span style="font-size: 1.2em;">🧠 Jogo da Memória</span><br><span style="font-size: 0.9em; color: #FFD700;">🏆 Melhor: ${this.bestTime}s</span>`;
            } else {
                targetEmojiDisplay.innerHTML = `<span style="font-size: 1.2em;">🧠 Jogo da Memória</span>`;
            }
        }
    }
    
    start() {
        this.isPlaying = true;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.startTime = Date.now();
        
        // Memory game doesn't need challenge prompt, just update the display
        const targetEmojiDisplay = document.getElementById('targetEmoji');
        
        if (targetEmojiDisplay) {
            let bestTimeStr = this.bestTime ? ` | 🏆 ${this.bestTime}s` : '';
            targetEmojiDisplay.innerHTML = `<span style="font-size: 1.2em;">Encontra os pares!${bestTimeStr}</span>`;
        }
        
        this.gameManager.clearGameArea();
        this.createMemoryCards();
    }
    
    createMemoryCards() {
        // Select random emojis for pairs
        const selectedEmojis = [];
        const shuffled = [...this.availableEmojis].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < this.totalPairs; i++) {
            selectedEmojis.push(shuffled[i]);
        }
        
        // Create pairs (2 of each emoji)
        const cardEmojis = [...selectedEmojis, ...selectedEmojis];
        cardEmojis.sort(() => Math.random() - 0.5); // Shuffle
        
        // Calculate grid layout for 4 cards (2x2)
        const gameWidth = this.gameArea.clientWidth;
        const gameHeight = this.gameArea.clientHeight;
        const cardSize = 120;
        const spacing = 20;
        
        const cols = 2;
        const rows = Math.ceil(cardEmojis.length / cols);
        
        const totalWidth = cols * cardSize + (cols - 1) * spacing;
        const totalHeight = rows * cardSize + (rows - 1) * spacing;
        const startX = (gameWidth - totalWidth) / 2;
        const startY = (gameHeight - totalHeight) / 2;
        
        // Create cards
        cardEmojis.forEach((emoji, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            
            const x = startX + col * (cardSize + spacing);
            const y = startY + row * (cardSize + spacing);
            
            card.style.left = x + 'px';
            card.style.top = y + 'px';
            card.style.width = cardSize + 'px';
            card.style.height = cardSize + 'px';
            
            // Card front (hidden emoji)
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            cardFront.textContent = emoji;
            
            // Card back (question mark)
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.textContent = '?';
            
            card.appendChild(cardFront);
            card.appendChild(cardBack);
            
            card.addEventListener('click', () => this.handleCardClick(card));
            
            this.gameArea.appendChild(card);
            this.cards.push(card);
        });
    }
    
    handleCardClick(card) {
        // Ignore if card already flipped or matched
        if (card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        // Ignore if already flipping 2 cards
        if (this.flippedCards.length >= 2) {
            return;
        }
        
        // Flip the card
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        // Play sound
        if (this.gameManager.soundEnabled) {
            this.playFlipSound();
        }
        
        // Check for match when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 600);
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const emoji1 = card1.dataset.emoji;
        const emoji2 = card2.dataset.emoji;
        
        if (emoji1 === emoji2) {
            // Match!
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            
            if (this.gameManager.soundEnabled) {
                this.playSuccessSound();
            }
            
            // Remove matched cards after animation
            setTimeout(() => {
                card1.style.opacity = '0';
                card2.style.opacity = '0';
                setTimeout(() => {
                    card1.remove();
                    card2.remove();
                }, 300);
            }, 500);
            
            // Check if game is complete
            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => this.gameComplete(), 1000);
            }
        } else {
            // No match - flip back
            if (this.gameManager.soundEnabled) {
                this.playErrorSound();
            }
            
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 1000);
        }
        
        this.flippedCards = [];
    }
    
    gameComplete() {
        const endTime = Date.now();
        const timeTaken = Math.floor((endTime - this.startTime) / 1000); // seconds
        
        // Check if new best time
        let isNewBest = false;
        if (!this.bestTime || timeTaken < this.bestTime) {
            this.bestTime = timeTaken;
            this.saveBestTime(timeTaken);
            isNewBest = true;
        }
        
        this.gameManager.showCelebration();
        
        // Show final message with time and best score
        const targetEmojiDisplay = document.getElementById('targetEmoji');
        if (targetEmojiDisplay) {
            setTimeout(() => {
                targetEmojiDisplay.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 1.5em; margin-bottom: 10px;">🎉 Parabéns! 🎉</div>
                        <div style="font-size: 1.2em; margin-bottom: 5px;">⏱️ Tempo: ${timeTaken}s</div>
                        <div style="font-size: 1em; color: #FFD700;">🏆 Melhor: ${this.bestTime}s${isNewBest ? ' (NOVO RECORDE!)' : ''}</div>
                    </div>
                `;
            }, 500);
        }
        
        setTimeout(() => {
            this.stop();
            // Reset start button
            this.gameManager.startBtn.textContent = 'Começar Jogo 🎮';
            this.gameManager.startBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            
            // Show best time again after game ends
            this.setupUI();
        }, 2500);
    }
    
    playFlipSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.frequency.value = 400;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }
    
    playSuccessSound() {
        const now = this.audioContext.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.2, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        });
    }
    
    playErrorSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'square';
        osc.frequency.value = 200;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    loadBestTime() {
        const saved = localStorage.getItem('memoryGameBestTime');
        return saved ? parseInt(saved) : null;
    }
    
    saveBestTime(time) {
        localStorage.setItem('memoryGameBestTime', time.toString());
    }
    
    showBestTime() {
        // Could display in UI if needed
        console.log('Best time:', this.bestTime + 's');
    }
    
    stop() {
        this.isPlaying = false;
        this.gameManager.clearGameArea();
        this.cards = [];
        this.flippedCards = [];
        
        // Hide challenge prompt when stopping
        const challengePrompt = document.getElementById('challengePrompt');
        if (challengePrompt) challengePrompt.classList.remove('active');
    }
    
    cleanup() {
        this.stop();
    }
}
