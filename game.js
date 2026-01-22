// Kids Game - Simple and Fun for Toddlers
class KidsGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.celebration = document.getElementById('celebration');
        this.startBtn = document.getElementById('startBtn');
        this.soundToggle = document.getElementById('soundToggle');
        this.modeToggle = document.getElementById('modeToggle');
        this.challengePrompt = document.getElementById('challengePrompt');
        this.targetEmojiDisplay = document.getElementById('targetEmoji');
        this.scoreDisplay = document.getElementById('score');
        
        this.isPlaying = false;
        this.soundEnabled = true;
        this.challengeMode = false;
        this.shapes = [];
        this.spawnInterval = null;
        this.targetEmoji = null;
        this.score = 0;
        
        // Categorized emojis with their sounds
        this.emojiCategories = {
            animals: {
                emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🦆', '🦉', '🐝', '🦋', '🐞', '🐠', '🐡', '🐙'],
                sounds: {
                    '🐶': 'bark', '🐱': 'meow', '🐭': 'squeak', '🐹': 'squeak',
                    '🐰': 'hop', '🦊': 'bark', '🐻': 'growl', '🐼': 'growl',
                    '🐨': 'grunt', '🐯': 'roar', '🦁': 'roar', '🐮': 'moo',
                    '🐷': 'oink', '🐸': 'ribbit', '🐵': 'monkey', '🐔': 'cluck',
                    '🦆': 'quack', '🦉': 'hoot', '🐝': 'buzz', '🦋': 'flutter',
                    '🐞': 'buzz', '🐠': 'bubble', '🐡': 'bubble', '🐙': 'bubble'
                }
            },
            magic: {
                emojis: ['⭐', '🌟', '✨', '💫', '🌈', '☀️', '🌙', '⚡'],
                sound: 'sparkle'
            },
            hearts: {
                emojis: ['❤️', '💛', '💚', '💙', '💜', '🧡', '🎈', '🎁'],
                sound: 'love'
            },
            fruits: {
                emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒'],
                sound: 'pop'
            }
        };
        
        // Flatten all emojis into one array
        this.emojis = [];
        Object.values(this.emojiCategories).forEach(category => {
            this.emojis = this.emojis.concat(category.emojis);
        });
        
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
        ];
        
        this.init();
    }
    
    init() {
        this.startBtn.addEventListener('click', () => this.toggleGame());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        this.modeToggle.addEventListener('click', () => this.toggleMode());
        
        // Create audio context for sounds (using Web Audio API)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    toggleMode() {
        this.challengeMode = !this.challengeMode;
        this.modeToggle.textContent = this.challengeMode ? 'Modo: Desafio 🎯' : 'Modo: Livre 🎲';
        
        if (this.challengeMode) {
            this.modeToggle.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        } else {
            this.modeToggle.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        }
        
        // Reset game if playing
        if (this.isPlaying) {
            this.stopGame();
        }
    }
    
    toggleGame() {
        if (this.isPlaying) {
            this.stopGame();
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        this.isPlaying = true;
        this.startBtn.textContent = 'Parar Jogo 🛑';
        this.startBtn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        
        // Clear any existing shapes
        this.clearShapes();
        
        if (this.challengeMode) {
            // Challenge mode: show prompt and reset score
            this.score = 0;
            this.updateScore();
            this.challengePrompt.classList.add('active');
            this.startChallenge();
        } else {
            // Free play mode
            this.challengePrompt.classList.remove('active');
            // Spawn shapes continuously
            this.spawnShape();
            this.spawnInterval = setInterval(() => {
                if (this.shapes.length < 5) { // Max 5 shapes at a time
                    this.spawnShape();
                }
            }, 2000);
        }
    }
    
    startChallenge() {
        // Pick a random target emoji
        this.targetEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
        this.targetEmojiDisplay.textContent = this.targetEmoji;
        
        // Clear existing shapes
        this.clearShapes();
        
        // Create 4 emojis: 1 correct + 3 random different ones
        const emojisToShow = [this.targetEmoji];
        
        // Get 3 different random emojis
        while (emojisToShow.length < 4) {
            const randomEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
            if (!emojisToShow.includes(randomEmoji)) {
                emojisToShow.push(randomEmoji);
            }
        }
        
        // Shuffle the array
        for (let i = emojisToShow.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [emojisToShow[i], emojisToShow[j]] = [emojisToShow[j], emojisToShow[i]];
        }
        
        // Position them in a grid
        const positions = [
            { x: '20%', y: '20%' },
            { x: '60%', y: '20%' },
            { x: '20%', y: '60%' },
            { x: '60%', y: '60%' }
        ];
        
        emojisToShow.forEach((emoji, index) => {
            this.spawnChallengeShape(emoji, positions[index]);
        });
    }
    
    spawnChallengeShape(emoji, position) {
        const shape = document.createElement('div');
        shape.className = 'shape emoji-shape';
        shape.textContent = emoji;
        shape.dataset.emoji = emoji;
        
        shape.style.left = position.x;
        shape.style.top = position.y;
        shape.style.transform = 'translate(-50%, -50%)';
        
        // Add click event for challenge mode
        shape.addEventListener('click', () => this.handleChallengeClick(shape));
        
        this.gameArea.appendChild(shape);
        this.shapes.push(shape);
    }
    
    handleChallengeClick(shape) {
        const emoji = shape.dataset.emoji;
        
        if (emoji === this.targetEmoji) {
            // Correct!
            this.score += 10;
            this.updateScore();
            
            if (this.soundEnabled) {
                this.playSoundForEmoji(emoji);
            }
            
            // Animate and celebrate
            shape.style.animation = 'appear 0.3s ease-out reverse';
            
            setTimeout(() => {
                this.showCelebration();
                // Start next challenge after celebration
                setTimeout(() => {
                    if (this.isPlaying) {
                        this.startChallenge();
                    }
                }, 700);
            }, 300);
        } else {
            // Wrong!
            if (this.soundEnabled) {
                this.playErrorSound();
            }
            
            // Shake the shape
            shape.classList.add('shake');
            setTimeout(() => {
                shape.classList.remove('shake');
            }, 500);
        }
    }
    
    updateScore() {
        this.scoreDisplay.textContent = this.score;
    }
    
    stopGame() {
        this.isPlaying = false;
        this.startBtn.textContent = 'Começar Jogo 🎮';
        this.startBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        
        clearInterval(this.spawnInterval);
        this.clearShapes();
        this.challengePrompt.classList.remove('active');
    }
    
    spawnShape() {
        const shape = document.createElement('div');
        shape.className = 'shape emoji-shape';
        
        // Random emoji
        const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
        shape.textContent = emoji;
        shape.dataset.emoji = emoji; // Store emoji for sound identification
        
        // Random position (avoiding edges)
        const maxX = this.gameArea.clientWidth - 150;
        const maxY = this.gameArea.clientHeight - 150;
        const x = Math.random() * maxX + 20;
        const y = Math.random() * maxY + 20;
        
        shape.style.left = x + 'px';
        shape.style.top = y + 'px';
        
        // Add click event
        shape.addEventListener('click', () => this.handleShapeClick(shape));
        
        // Add to DOM and track it
        this.gameArea.appendChild(shape);
        this.shapes.push(shape);
        
        // Auto-remove after 5 seconds if not clicked
        setTimeout(() => {
            if (shape.parentNode) {
                this.removeShape(shape);
            }
        }, 5000);
    }
    
    handconst emoji = shape.dataset.emoji;
        
        // Play specific sound for this emoji
        if (this.soundEnabled) {
            this.playSoundForEmoji(emojied) {
            this.playSound();
        }
        
        // Animate and remove
        shape.style.animation = 'appear 0.3s ease-out reverse';
        
        setTimeout(() => {
            this.removeShape(shape);
            this.showCelebration();
        }, 300);
    }
    
    removeShape(shape) {
        const index = this.shapes.indexOf(shape);
        if (index > -1) {
            this.shapes.splice(index, 1);
        }
        if (shape.parentNode) {
            shape.parentNode.removeChild(shape);
        }
    }
    
    clearShapes() {
        this.shapes.forEach(shape => {
            if (shape.parentNode) {
                shape.parentNode.removeChild(shape);
            }
        });
        this.shapes = [];
    }
    
    showCelebration() {
        this.celebration.classList.add('active');
        
        // Change background color randomly
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.celebration.style.background = color;
        
        setTimeout(() => {
            this.celebration.classList.remove('active');
        }, 600);
    }
    
    playSoundForEmoji(emoji) {
        // Find which category and sound this emoji belongs to
        let soundType = 'default';
        
        // Check animals first (they have specific sounds)
        if (this.emojiCategories.animals.sounds[emoji]) {
            soundType = this.emojiCategories.animals.sounds[emoji];
        } else {
            // Check other categories
            for (const [category, data] of Object.entries(this.emojiCategories)) {
                if (data.emojis.includes(emoji) && data.sound) {
                    soundType = data.sound;
                    break;
                }
            }
        }
        
        // Play the appropriate sound
        switch(soundType) {
            case 'meow':
                this.playMeow();
                break;
            case 'bark':
                this.playBark();
                break;
            case 'moo':
                this.playMoo();
                break;
            case 'oink':
                this.playOink();
                break;
            case 'roar':
                this.playRoar();
                break;
            case 'cluck':
                this.playCluck();
                break;
            case 'quack':
                this.playQuack();
                break;
            case 'ribbit':
                this.playRibbit();
                break;
            case 'squeak':
                this.playSqueak();
                break;
            case 'buzz':
                this.playBuzz();
                break;
            case 'bubble':
                this.playBubble();
                break;
            case 'hoot':
                this.playHoot();
                break;
            case 'monkey':
                this.playMonkey();
                break;
            case 'growl':
                this.playGrowl();
                break;
            case 'hop':
                this.playHop();
                break;
            case 'grunt':
                this.playGrunt();
                break;
            case 'flutter':
                this.playFlutter();
                break;
            case 'sparkle':
                this.playSparkle();
                break;
            case 'love':
                this.playLove();
                break;
            case 'pop':
                this.playPop();
                break;
            default:
                this.playDefault();
        }
    }
    
    // Animal Sounds
    playMeow() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.25);
    }
    
    playBark() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.12);
    }
    
    playMoo() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }
    
    playOink() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playRoar() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        
        osc.start(now);
        osc.stop(now + 0.6);
    }
    
    playCluck() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }
    
    playQuack() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    playRibbit() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    playSqueak() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playBuzz() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }
    
    playBubble() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playHoot() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.35);
    }
    
    playMonkey() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.25);
    }
    
    playGrowl() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
    }
    
    playHop() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }
    
    playGrunt() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    playFlutter() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    // Non-animal sounds
    playSparkle() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }
    
    playLove() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
    }
    
    playPop() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playDefault() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        const frequencies = [523.25, 587.33, 659.25, 783.99, 880.00];
        osc.frequency.value = frequencies[Math.floor(Math.random() * frequencies.length)];
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }
    
    playErrorSound() {
        // Create a descending "buzz" sound for wrong answer
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.35);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? 'Som: Ligado 🔊' : 'Som: Desligado 🔇';
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new KidsGame();
});
