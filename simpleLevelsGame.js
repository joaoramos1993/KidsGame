// Simple Levels Game - 10 Progressive Levels
class SimpleLevelsGame {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.gameArea = gameManager.gameArea;
        this.audioContext = gameManager.audioContext;
        
        this.challengePrompt = document.getElementById('challengePrompt');
        this.targetEmojiDisplay = document.getElementById('targetEmoji');
        
        this.isPlaying = false;
        this.currentLevel = 1;
        this.shapes = [];
        this.targetEmoji = null;
        this.foundCount = 0; // How many targets found in current level
        this.targetCount = 1; // How many targets to find in current level
        
        // Timer tracking
        this.startTime = null;
        this.endTime = null;
        
        // Load best time from localStorage
        this.bestTime = localStorage.getItem('simpleLevelsBestTime') || null;
        
        // Full emoji pool (original before reduction)
        this.emojiCategories = {
            animals: {
                emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', 
                         '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🐺', '🦁', '🐴', '🦄'],
                sounds: {
                    '🐶': 'bark', '🐱': 'meow', '🐭': 'squeak', '🐹': 'squeak',
                    '🐰': 'hop', '🦊': 'bark', '🐻': 'growl', '🐼': 'growl',
                    '🐨': 'grunt', '🐯': 'roar', '🦁': 'roar', '🐮': 'moo',
                    '🐷': 'oink', '🐸': 'ribbit', '🐵': 'monkey', '🐔': 'cluck',
                    '🐧': 'squeak', '🐦': 'flutter', '🐤': 'cluck', '🐣': 'cluck',
                    '🐺': 'growl', '🐴': 'grunt', '🦄': 'sparkle'
                }
            },
            magic: {
                emojis: ['⭐', '🌟', '✨', '💫', '🌠', '🔮'],
                sound: 'sparkle'
            },
            hearts: {
                emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍'],
                sound: 'love'
            },
            fruits: {
                emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒'],
                sound: 'pop'
            }
        };
        
        // Flatten all emojis
        this.allEmojis = [];
        Object.values(this.emojiCategories).forEach(category => {
            this.allEmojis = this.allEmojis.concat(category.emojis);
        });
        
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
        ];
        
        // Level configurations
        this.levelConfigs = [
            { level: 1, gridSize: 4, cols: 2, rows: 2, targets: 1, emojiSize: 80 },      // 2x2
            { level: 2, gridSize: 8, cols: 4, rows: 2, targets: 1, emojiSize: 70 },      // 4x2
            { level: 3, gridSize: 16, cols: 4, rows: 4, targets: 2, emojiSize: 65 },     // 4x4 - HARDER
            { level: 4, gridSize: 16, cols: 4, rows: 4, targets: 2, emojiSize: 65 },     // 4x4
            { level: 5, gridSize: 32, cols: 8, rows: 4, targets: 3, emojiSize: 60 },     // 8x4 - HARDER
            { level: 6, gridSize: 32, cols: 8, rows: 4, targets: 3, emojiSize: 60 },     // 8x4 - targets can repeat
            { level: 7, gridSize: 32, cols: 8, rows: 4, targets: 4, emojiSize: 55 },     // 8x4 - HARDER + repeats
            { level: 8, gridSize: 32, cols: 8, rows: 4, targets: 4, emojiSize: 55 },     // 8x4 - repeats
            { level: 9, gridSize: 64, cols: 8, rows: 8, targets: 5, emojiSize: 50 },     // 8x8
            { level: 10, gridSize: 64, cols: 8, rows: 8, targets: 6, emojiSize: 50 }     // 8x8
        ];
    }
    
    start() {
        this.isPlaying = true;
        this.currentLevel = 1;
        this.startTime = Date.now();
        this.endTime = null;
        this.startLevel();
    }
    
    startLevel() {
        // Clear previous level
        this.clearShapes();
        
        // Pick target emoji
        this.targetEmoji = this.allEmojis[Math.floor(Math.random() * this.allEmojis.length)];
        
        // Get level config
        const config = this.levelConfigs[this.currentLevel - 1];
        
        // From level 6 onwards, target can appear multiple times
        this.targetCount = (this.currentLevel >= 6) ? config.targets : 1;
        this.foundCount = 0;
        
        // Show prompt with target
        this.challengePrompt.classList.add('active');
        this.updateTargetDisplay();
        
        // Spawn grid
        this.spawnLevelGrid(config);
    }
    
    spawnLevelGrid(config) {
        const gameWidth = this.gameArea.clientWidth;
        const gameHeight = this.gameArea.clientHeight;
        
        // Calculate size to occupy 70% of game area
        const targetGridWidth = gameWidth * 0.7;
        const targetGridHeight = gameHeight * 0.7;
        
        // Calculate maximum shape size that fits within 70% area
        const spacing = 20;
        const maxWidthPerShape = (targetGridWidth - spacing * (config.cols - 1)) / config.cols;
        const maxHeightPerShape = (targetGridHeight - spacing * (config.rows - 1)) / config.rows;
        const shapeSize = Math.min(maxWidthPerShape, maxHeightPerShape, config.emojiSize);
        
        // Calculate grid dimensions
        const totalWidth = shapeSize * config.cols + spacing * (config.cols - 1);
        const totalHeight = shapeSize * config.rows + spacing * (config.rows - 1);
        const startX = (gameWidth - totalWidth) / 2;
        const startY = (gameHeight - totalHeight) / 2;
        
        // Create positions array
        const positions = [];
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                positions.push({
                    x: startX + col * (shapeSize + spacing),
                    y: startY + row * (shapeSize + spacing)
                });
            }
        }
        
        // Create emoji options
        const options = [];
        
        // Add target emojis (1 for levels 1-5, multiple for levels 6-10)
        for (let i = 0; i < this.targetCount; i++) {
            options.push(this.targetEmoji);
        }
        
        // Fill remaining with random emojis (different from target)
        while (options.length < config.gridSize) {
            const randomEmoji = this.allEmojis[Math.floor(Math.random() * this.allEmojis.length)];
            if (randomEmoji !== this.targetEmoji) {
                options.push(randomEmoji);
            }
        }
        
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        
        // Create shapes
        options.forEach((emoji, index) => {
            const shape = document.createElement('div');
            shape.className = 'shape emoji-shape';
            shape.textContent = emoji;
            shape.dataset.emoji = emoji;
            
            shape.style.left = positions[index].x + 'px';
            shape.style.top = positions[index].y + 'px';
            shape.style.fontSize = config.emojiSize + 'px';
            shape.style.width = shapeSize + 'px';
            shape.style.height = shapeSize + 'px';
            
            shape.addEventListener('click', () => {
                this.handleShapeClick(shape);
            });
            
            this.gameArea.appendChild(shape);
            this.shapes.push(shape);
        });
    }
    
    handleShapeClick(shape) {
        const emoji = shape.dataset.emoji;
        
        if (emoji === this.targetEmoji && !shape.classList.contains('found')) {
            // Correct!
            shape.classList.add('found');
            this.foundCount++;
            
            // Play sound
            if (this.gameManager.soundEnabled) {
                this.playSoundForEmoji(emoji);
            }
            
            // Remove the shape with animation
            shape.style.transform = 'scale(0)';
            shape.style.opacity = '0';
            
            // Update display to show progress
            this.updateTargetDisplay();
            
            // Check if level complete
            if (this.foundCount >= this.targetCount) {
                // Level complete!
                setTimeout(() => {
                    this.levelComplete();
                }, 500);
            }
        } else {
            // Wrong! Play error sound and shake
            if (this.gameManager.soundEnabled) {
                this.playErrorSound();
            }
            
            shape.classList.add('shake');
            setTimeout(() => shape.classList.remove('shake'), 500);
        }
    }
    
    levelComplete() {
        this.gameManager.showCelebration();
        
        setTimeout(() => {
            if (this.currentLevel >= 10) {
                // Game complete!
                this.gameComplete();
            } else {
                // Next level
                this.currentLevel++;
                this.startLevel();
            }
        }, 1000);
    }
    
    gameComplete() {
        this.stop();
        this.endTime = Date.now();
        const totalTime = Math.floor((this.endTime - this.startTime) / 1000); // in seconds
        
        // Check if new best time
        let isNewBest = false;
        if (this.bestTime === null || totalTime < parseInt(this.bestTime)) {
            this.bestTime = totalTime;
            localStorage.setItem('simpleLevelsBestTime', totalTime);
            isNewBest = true;
        }
        
        this.gameManager.showCelebration();
        
        // Show final message with time
        setTimeout(() => {
            const minutes = Math.floor(totalTime / 60);
            const seconds = totalTime % 60;
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            const bestMinutes = Math.floor(this.bestTime / 60);
            const bestSeconds = this.bestTime % 60;
            const bestTimeStr = `${bestMinutes}:${bestSeconds.toString().padStart(2, '0')}`;
            
            this.targetEmojiDisplay.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 1.5em; margin-bottom: 10px;">🎉 Completaste todos os 10 níveis! 🎉</div>
                    <div style="font-size: 1.2em; margin-bottom: 5px;">⏱️ Tempo: ${timeStr}</div>
                    <div style="font-size: 1em; color: #FFD700;">🏆 Melhor: ${bestTimeStr}${isNewBest ? ' (NOVO RECORDE!)' : ''}</div>
                </div>
            `;
        }, 500);
        
        // Reset button
        setTimeout(() => {
            this.gameManager.startBtn.textContent = 'Começar Jogo 🎮';
            this.gameManager.startBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        }, 2000);
    }
    
    updateTargetDisplay() {
        let bestTimeStr = '';
        if (this.bestTime !== null) {
            const bestMinutes = Math.floor(this.bestTime / 60);
            const bestSeconds = this.bestTime % 60;
            bestTimeStr = ` | 🏆 ${bestMinutes}:${bestSeconds.toString().padStart(2, '0')}`;
        }
        
        if (this.currentLevel >= 6) {
            // Show progress for levels with multiple targets
            this.targetEmojiDisplay.innerHTML = `
                <span style="font-size: 1.5em;">${this.targetEmoji}</span>
                <span style="font-size: 0.8em; margin-left: 10px;">
                    Nível ${this.currentLevel} - Encontra ${this.targetCount - this.foundCount} mais!${bestTimeStr}
                </span>
            `;
        } else {
            this.targetEmojiDisplay.innerHTML = `
                <span style="font-size: 1.5em;">${this.targetEmoji}</span>
                <span style="font-size: 0.8em; margin-left: 10px;">Nível ${this.currentLevel}/10${bestTimeStr}</span>
            `;
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
    
    stop() {
        this.isPlaying = false;
        this.clearShapes();
        this.challengePrompt.classList.remove('active');
    }
    
    cleanup() {
        this.stop();
    }
    
    // Sound methods
    playSoundForEmoji(emoji) {
        let soundType = 'default';
        
        if (this.emojiCategories.animals.sounds[emoji]) {
            soundType = this.emojiCategories.animals.sounds[emoji];
        } else {
            for (const [category, data] of Object.entries(this.emojiCategories)) {
                if (data.emojis.includes(emoji) && data.sound) {
                    soundType = data.sound;
                    break;
                }
            }
        }
        
        switch(soundType) {
            case 'meow': this.playMeow(); break;
            case 'bark': this.playBark(); break;
            case 'moo': this.playMoo(); break;
            case 'oink': this.playOink(); break;
            case 'roar': this.playRoar(); break;
            case 'cluck': this.playCluck(); break;
            case 'quack': this.playQuack(); break;
            case 'ribbit': this.playRibbit(); break;
            case 'squeak': this.playSqueak(); break;
            case 'buzz': this.playBuzz(); break;
            case 'bubble': this.playBubble(); break;
            case 'hoot': this.playHoot(); break;
            case 'monkey': this.playMonkey(); break;
            case 'growl': this.playGrowl(); break;
            case 'hop': this.playHop(); break;
            case 'grunt': this.playGrunt(); break;
            case 'flutter': this.playFlutter(); break;
            case 'sparkle': this.playSparkle(); break;
            case 'love': this.playLove(); break;
            case 'pop': this.playPop(); break;
            default: this.playDefault();
        }
    }
    
    playMeow() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playBark() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'square';
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(200, now);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playMoo() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.3);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }
    
    playOink() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.1);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playRoar() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.4);
        
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
    }
    
    playCluck() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(1000, now);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    playQuack() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(400, now);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playRibbit() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playSqueak() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    playBuzz() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(250, now);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    playBubble() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playHoot() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(250, now + 0.2);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    playMonkey() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.05);
        osc.frequency.linearRampToValueAtTime(600, now + 0.1);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playGrowl() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(120, now);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }
    
    playHop() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    playGrunt() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(180, now);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playFlutter() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        for (let i = 0; i < 3; i++) {
            const time = now + i * 0.05;
            osc.frequency.setValueAtTime(1000, time);
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
        }
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playSparkle() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    playLove() {
        const osc = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(523, now);
        osc2.frequency.setValueAtTime(659, now);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.3);
        osc2.stop(now + 0.3);
    }
    
    playPop() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        gain.gain.setValueAtTime(0.3, now);
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
        osc.frequency.setValueAtTime(440, now);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    playErrorSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.type = 'sawtooth';
        const now = this.audioContext.currentTime;
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
}
