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
        this.categorySelector = document.getElementById('categorySelector');
        this.categoryAnimalsBtn = document.getElementById('categoryAnimals');
        this.categoryOthersBtn = document.getElementById('categoryOthers');
        
        this.isPlaying = false;
        this.soundEnabled = true;
        this.challengeMode = true;
        this.selectedCategory = 'animals'; // 'animals' or 'others'
        this.shapes = [];
        this.spawnInterval = null;
        this.targetEmojis = []; // Array of 4 target emojis
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
        this.startBtn.addEventListener('click', () => {
            this.toggleGame();
        });
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        this.modeToggle.addEventListener('click', () => this.toggleMode());
        this.categoryAnimalsBtn.addEventListener('click', () => this.selectCategory('animals'));
        this.categoryOthersBtn.addEventListener('click', () => this.selectCategory('others'));
        
        // Create audio context for sounds (using Web Audio API)
        // Audio context may be suspended, will resume on first user interaction
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            this.soundEnabled = false;
        }
    }
    
    toggleMode() {
        this.challengeMode = !this.challengeMode;
        this.modeToggle.textContent = this.challengeMode ? 'Modo: Desafio 🎯' : 'Modo: Simples 🎈';
        
        if (this.challengeMode) {
            this.modeToggle.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            this.categorySelector.style.display = 'flex'; // Show category selector
        } else {
            this.modeToggle.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            this.categorySelector.style.display = 'none'; // Hide category selector
        }
        
        // Reset game if playing
        if (this.isPlaying) {
            this.stopGame();
        }
    }
    
    selectCategory(category) {
        this.selectedCategory = category;
        
        // Update button styles
        if (category === 'animals') {
            this.categoryAnimalsBtn.classList.add('active');
            this.categoryOthersBtn.classList.remove('active');
        } else {
            this.categoryAnimalsBtn.classList.remove('active');
            this.categoryOthersBtn.classList.add('active');
        }
        
        // If game is playing in challenge mode, restart with new category
        if (this.isPlaying && this.challengeMode) {
            this.score = 0;
            this.updateScore();
            this.clearShapes();
            this.pickNewTarget();
        }
    }
    
    toggleGame() {
        if (this.isPlaying) {
            this.stopGame();
        } else {
            // Set initial button style based on mode
            if (this.challengeMode) {
                this.modeToggle.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            }
            this.startGame();
        }
    }
    
    startGame() {
        // Resume audio context if suspended (required by browsers)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isPlaying = true;
        this.startBtn.textContent = 'Parar Jogo 🛑';
        this.startBtn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        
        // Clear any existing shapes
        this.clearShapes();
        
        if (this.challengeMode) {
            // Challenge mode: show prompt with 4 targets, reset score, spawn continuously
            this.score = 0;
            this.updateScore();
            this.challengePrompt.classList.add('active');
            this.pickNewTarget();
            
            // Spawn shapes continuously
            this.spawnShape();
            this.spawnInterval = setInterval(() => {
                if (this.shapes.length < 8) {
                    this.spawnShape();
                }
            }, 1000);
        } else {
            // Simple mode: show prompt with 1 target, reset score
            this.score = 0;
            this.updateScore();
            this.challengePrompt.classList.add('active');
            this.pickSimpleTarget();
            
            // Spawn 4 fixed options for simple mode
            this.spawnSimpleOptions();
        }
    }
    
    startChallenge() {
        // No longer used - keeping for compatibility
    }
    
    pickNewTarget() {
        // Pick 4 different random emojis as targets (Challenge mode)
        // Use only selected category
        let availableEmojis;
        if (this.selectedCategory === 'animals') {
            availableEmojis = this.emojiCategories.animals.emojis;
        } else {
            // Combine magic, hearts, and fruits
            availableEmojis = [
                ...this.emojiCategories.magic.emojis,
                ...this.emojiCategories.hearts.emojis,
                ...this.emojiCategories.fruits.emojis
            ];
        }
        
        this.targetEmojis = [];
        while (this.targetEmojis.length < 4) {
            const randomEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
            if (!this.targetEmojis.includes(randomEmoji)) {
                this.targetEmojis.push(randomEmoji);
            }
        }
        this.updateTargetDisplay();
    }
    
    pickSimpleTarget() {
        // Pick 1 correct target and 3 wrong options (Simple mode)
        const correctEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
        this.targetEmojis = [correctEmoji]; // Only 1 correct answer
        
        // Pick 3 different wrong options
        this.simpleOptions = [correctEmoji];
        while (this.simpleOptions.length < 4) {
            const randomEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
            if (!this.simpleOptions.includes(randomEmoji)) {
                this.simpleOptions.push(randomEmoji);
            }
        }
        
        // Shuffle the options so correct answer isn't always first
        this.simpleOptions.sort(() => Math.random() - 0.5);
        
        this.updateTargetDisplay();
    }
    
    updateTargetDisplay() {
        this.targetEmojiDisplay.textContent = this.targetEmojis.join(' ');
    }
    
    replaceFoundTarget(foundEmoji) {
        // Replace the found emoji with a new random one (Challenge mode only)
        const index = this.targetEmojis.indexOf(foundEmoji);
        if (index > -1) {
            let newEmoji;
            do {
                newEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
            } while (this.targetEmojis.includes(newEmoji));
            
            this.targetEmojis[index] = newEmoji;
            this.updateTargetDisplay();
        }
    }
    
    spawnSimpleOptions() {
        // Clear any existing shapes first
        this.clearShapes();
        
        // Calculate positions for 4 options in a grid
        const gameWidth = this.gameArea.clientWidth;
        const gameHeight = this.gameArea.clientHeight;
        const shapeSize = 120;
        const spacing = 40;
        
        // Calculate grid positions (2x2 grid centered)
        const totalWidth = shapeSize * 2 + spacing;
        const totalHeight = shapeSize * 2 + spacing;
        const startX = (gameWidth - totalWidth) / 2;
        const startY = (gameHeight - totalHeight) / 2;
        
        const positions = [
            { x: startX, y: startY }, // top-left
            { x: startX + shapeSize + spacing, y: startY }, // top-right
            { x: startX, y: startY + shapeSize + spacing }, // bottom-left
            { x: startX + shapeSize + spacing, y: startY + shapeSize + spacing } // bottom-right
        ];
        
        // Create 4 shapes with the selected emojis
        this.simpleOptions.forEach((emoji, index) => {
            const shape = document.createElement('div');
            shape.className = 'shape emoji-shape';
            shape.textContent = emoji;
            shape.dataset.emoji = emoji;
            
            shape.style.left = positions[index].x + 'px';
            shape.style.top = positions[index].y + 'px';
            shape.style.fontSize = '80px'; // Larger for easier clicking
            
            // Add click event
            shape.addEventListener('click', () => {
                this.handleSimpleShapeClick(shape);
            });
            
            this.gameArea.appendChild(shape);
            this.shapes.push(shape);
        });
    }
    
    handleSimpleShapeClick(shape) {
        const emoji = shape.dataset.emoji;
        
        if (this.targetEmojis.includes(emoji)) {
            // Correct!
            this.score += 10;
            this.updateScore();
            
            // Play specific sound for this emoji
            if (this.soundEnabled) {
                this.playSoundForEmoji(emoji);
            }
            
            // Show celebration
            this.showCelebration();
            
            // Pick new target and respawn options
            setTimeout(() => {
                this.pickSimpleTarget();
                this.spawnSimpleOptions();
            }, 500);
        } else {
            // Wrong! Play error sound and shake
            if (this.soundEnabled) {
                this.playErrorSound();
            }
            
            // Add shake animation
            shape.classList.add('shake');
            setTimeout(() => shape.classList.remove('shake'), 500);
        }
    }
    
    spawnChallengeShape(emoji, position) {
        // No longer used - keeping for compatibility
    }
    
    handleChallengeClick(shape) {
        // No longer used - replaced by handleChallengeShapeClick
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
        
        // Select emoji based on mode and category
        let emoji;
        if (this.challengeMode) {
            // In challenge mode, use selected category
            let availableEmojis;
            if (this.selectedCategory === 'animals') {
                availableEmojis = this.emojiCategories.animals.emojis;
            } else {
                availableEmojis = [
                    ...this.emojiCategories.magic.emojis,
                    ...this.emojiCategories.hearts.emojis,
                    ...this.emojiCategories.fruits.emojis
                ];
            }
            emoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
        } else {
            // In simple mode, use all emojis
            emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
        }
        
        shape.textContent = emoji;
        shape.dataset.emoji = emoji; // Store emoji for sound identification
        
        // Random position (avoiding edges)
        const maxX = this.gameArea.clientWidth - 150;
        const maxY = this.gameArea.clientHeight - 150;
        const x = Math.random() * maxX + 20;
        const y = Math.random() * maxY + 20;
        
        shape.style.left = x + 'px';
        shape.style.top = y + 'px';
        
        // Add click event - different behavior for challenge mode
        shape.addEventListener('click', () => {
            if (this.challengeMode) {
                this.handleChallengeShapeClick(shape);
            } else {
                this.handleShapeClick(shape);
            }
        });
        
        // Add to DOM and track it
        this.gameArea.appendChild(shape);
        this.shapes.push(shape);
        
        // Auto-remove after 3 seconds if not clicked
        setTimeout(() => {
            if (shape.parentNode) {
                this.removeShape(shape);
            }
        }, 3000);
    }
    
    handleShapeClick(shape) {
        const emoji = shape.dataset.emoji;
        
        // Play specific sound for this emoji
        if (this.soundEnabled) {
            this.playSoundForEmoji(emoji);
        }
        
        // Animate and remove
        shape.style.animation = 'appear 0.3s ease-out reverse';
        
        setTimeout(() => {
            this.removeShape(shape);
            this.showCelebration();
        }, 300);
    }
    
    handleChallengeShapeClick(shape) {
        const emoji = shape.dataset.emoji;
        
        if (this.targetEmojis.includes(emoji)) {
            // Correct!
            this.score += 10;
            this.updateScore();
            
            if (this.soundEnabled) {
                this.playSoundForEmoji(emoji);
            }
            
            // Animate and remove
            shape.style.animation = 'appear 0.3s ease-out reverse';
            
            setTimeout(() => {
                this.removeShape(shape);
                this.showCelebration();
                // Replace this target with a new one
                setTimeout(() => {
                    if (this.isPlaying) {
                        this.replaceFoundTarget(emoji);
                    }
                }, 700);
            }, 300);
        } else {
            // Wrong! Play error sound and shake
            if (this.soundEnabled) {
                this.playErrorSound();
            }
            
            // Shake the shape but don't remove it
            shape.classList.add('shake');
            setTimeout(() => {
                shape.classList.remove('shake');
            }, 500);
        }
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
        // Create a distinctive "wrong" sound - two quick low buzzes
        const now = this.audioContext.currentTime;
        
        // First buzz
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(200, now);
        osc1.frequency.exponentialRampToValueAtTime(150, now + 0.15);
        gain1.gain.setValueAtTime(0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc1.start(now);
        osc1.stop(now + 0.15);
        
        // Second buzz (lower)
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(180, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(130, now + 0.3);
        gain2.gain.setValueAtTime(0.4, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc2.start(now + 0.15);
        osc2.stop(now + 0.3);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? 'Som: Ligado 🔊' : 'Som: Desligado 🔇';
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    try {
        new KidsGame();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});
