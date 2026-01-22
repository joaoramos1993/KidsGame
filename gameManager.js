// GameManager - Orchestrates different game modes
class GameManager {
    constructor() {
        // UI Elements
        this.startBtn = document.getElementById('startBtn');
        this.soundToggle = document.getElementById('soundToggle');
        this.modeToggle = document.getElementById('modeToggle');
        this.gameArea = document.getElementById('gameArea');
        this.celebration = document.getElementById('celebration');
        
        // Audio context
        this.soundEnabled = true;
        this.audioContext = null;
        
        // Current game instance
        this.currentGame = null;
        this.currentGameType = 'findEmojiChallenge'; // 'findEmojiChallenge', 'simpleLevels', or 'memory'
        
        this.init();
    }
    
    init() {
        console.log('Initializing GameManager...');
        
        // Create audio context
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            this.soundEnabled = false;
        }
        
        // Event listeners
        this.startBtn.addEventListener('click', () => this.toggleGame());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        this.modeToggle.addEventListener('click', () => this.toggleGameType());
        
        // Load default game (FindEmojiGame Challenge mode)
        this.loadGame('findEmojiChallenge');
        
        console.log('GameManager initialized');
    }
    
    loadGame(gameType) {
        // Clean up current game if exists
        if (this.currentGame) {
            this.currentGame.cleanup();
        }
        
        this.currentGameType = gameType;
        
        // Create new game instance
        if (gameType === 'findEmojiChallenge') {
            this.currentGame = new FindEmojiGame(this, true); // challenge mode
            this.modeToggle.textContent = 'Modo: Desafio 🎯';
        } else if (gameType === 'simpleLevels') {
            this.currentGame = new SimpleLevelsGame(this); // levels mode
            this.modeToggle.textContent = 'Modo: Níveis 🎈';
        } else if (gameType === 'memory') {
            this.currentGame = new MemoryGame(this);
            this.modeToggle.textContent = 'Modo: Memória 🧠';
        }
    }
    
    toggleGameType() {
        if (this.currentGame && this.currentGame.isPlaying) {
            this.currentGame.stop();
            // Reset start button to initial state
            this.startBtn.textContent = 'Começar Jogo 🎮';
            this.startBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        }
        
        // Cycle through 3 game modes: challenge -> levels -> memory -> challenge
        let newGameType;
        if (this.currentGameType === 'findEmojiChallenge') {
            newGameType = 'simpleLevels';
        } else if (this.currentGameType === 'simpleLevels') {
            newGameType = 'memory';
        } else {
            newGameType = 'findEmojiChallenge';
        }
        
        this.loadGame(newGameType);
    }
    
    toggleGame() {
        if (this.currentGame) {
            if (this.currentGame.isPlaying) {
                this.currentGame.stop();
                this.startBtn.textContent = 'Começar Jogo 🎮';
                this.startBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            } else {
                // Resume audio context
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                this.currentGame.start();
                this.startBtn.textContent = 'Parar Jogo 🛑';
                this.startBtn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            }
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? 'Som: Ligado 🔊' : 'Som: Desligado 🔇';
    }
    
    showCelebration(message = '🎉 Muito Bem! 🎉') {
        this.celebration.querySelector('.celebration-text').textContent = message;
        this.celebration.classList.add('active');
        setTimeout(() => {
            this.celebration.classList.remove('active');
        }, 2000);
    }
    
    clearGameArea() {
        this.gameArea.innerHTML = '';
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    try {
        new GameManager();
    } catch (error) {
        console.error('Error initializing GameManager:', error);
    }
});
