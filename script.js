const noButton = document.querySelector('.no-button');
const wrongAnswers = document.querySelectorAll('.wrong-answer');

function moveToRandomPosition(button) {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    
    const buttonWidth = button.offsetWidth;
    const buttonHeight = button.offsetHeight;
    
    const padding = 20;
    
    const newX = Math.min(
        Math.max(padding, Math.random() * (viewportWidth - buttonWidth - padding * 2)),
        viewportWidth - buttonWidth - padding
    );
    
    const newY = Math.min(
        Math.max(padding, Math.random() * (viewportHeight - buttonHeight - padding * 2)),
        viewportHeight - buttonHeight - padding
    );
    
    button.style.position = 'fixed';
    button.style.left = `${newX}px`;
    button.style.top = `${newY}px`;
}

// Move "No" button on click
noButton.addEventListener('click', () => moveToRandomPosition(noButton));

// Move wrong answers on click
wrongAnswers.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        moveToRandomPosition(button);
    });
});

// Question progression
// Question 1 to 2
document.querySelector('#question-1 .yes-button').addEventListener('click', () => {
    document.getElementById('question-1').classList.add('hidden');
    document.getElementById('question-2').classList.remove('hidden');
});

// Question 2 to 3
document.querySelector('#question-2 .correct-answer').addEventListener('click', () => {
    document.getElementById('question-2').classList.add('hidden');
    document.getElementById('question-3').classList.remove('hidden');
});

// Question 3 to 4
document.querySelector('#question-3 .correct-answer').addEventListener('click', () => {
    document.getElementById('question-3').classList.add('hidden');
    document.getElementById('question-4').classList.remove('hidden');
});

// Question 4 to 5
document.querySelector('#question-4 .correct-answer').addEventListener('click', () => {
    document.getElementById('question-4').classList.add('hidden');
    document.getElementById('question-5').classList.remove('hidden');
});

// Question 5 to 6
document.querySelector('#question-5 .correct-answer').addEventListener('click', () => {
    document.getElementById('question-5').classList.add('hidden');
    document.getElementById('question-6').classList.remove('hidden');
});

// Question 6 to game
document.querySelector('#question-6 .correct-answer').addEventListener('click', () => {
    document.getElementById('question-6').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    const game = new HeartCatcherGame(10);
    game.start();
});

// Add heart trail functionality
function createHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤️';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    
    document.body.appendChild(heart);
    
    // Remove heart after animation
    heart.addEventListener('animationend', () => {
        heart.remove();
    });
}

// Track mouse movement and create hearts
let lastHeartTime = 0;
document.addEventListener('mousemove', (e) => {
    const currentTime = Date.now();
    // Only create a heart every 50ms to control density
    if (currentTime - lastHeartTime > 50) {
        createHeart(e.clientX, e.clientY);
        lastHeartTime = currentTime;
    }
});

class HeartCatcherGame {
    constructor(targetScore = 10) {
        this.score = 0;
        this.targetScore = targetScore;
        this.basket = document.getElementById('basket');
        this.gameArea = document.getElementById('game');
        this.scoreDisplay = document.getElementById('score-value');
        this.targetScoreDisplay = document.getElementById('target-score');
        this.isPlaying = false;
        this.heartSpeed = 3; // seconds to fall
        this.spawnRate = 1000; // milliseconds between hearts
        this.hearts = [];
        
        this.targetScoreDisplay.textContent = this.targetScore;
        
        // Bind methods
        this.moveBasket = this.moveBasket.bind(this);
        this.spawnHeart = this.spawnHeart.bind(this);
        this.checkCollisions = this.checkCollisions.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.gameOver = this.gameOver.bind(this);
    }
    
    start() {
        this.isPlaying = true;
        this.score = 0;
        this.scoreDisplay.textContent = this.score;
        
        // Start spawning hearts
        this.spawnInterval = setInterval(this.spawnHeart, this.spawnRate);
        
        // Start game loop
        requestAnimationFrame(this.gameLoop);
        
        // Add event listeners
        document.addEventListener('mousemove', this.moveBasket);
    }
    
    moveBasket(e) {
        const gameRect = this.gameArea.getBoundingClientRect();
        const basketWidth = this.basket.offsetWidth;
        let newX = e.clientX - gameRect.left - (basketWidth / 2);
        
        // Keep basket within bounds
        newX = Math.max(0, Math.min(newX, gameRect.width - basketWidth));
        
        this.basket.style.left = `${newX}px`;
    }
    
    spawnHeart() {
        const heart = document.createElement('div');
        heart.className = 'falling-heart';
        heart.textContent = '❤️';
        
        const gameRect = this.gameArea.getBoundingClientRect();
        const heartWidth = 24;
        const randomX = Math.random() * (gameRect.width - heartWidth);
        
        heart.style.left = `${randomX}px`;
        heart.style.animation = `fall ${this.heartSpeed}s linear`;
        
        this.gameArea.appendChild(heart);
        this.hearts.push(heart);
        
        heart.addEventListener('animationend', () => {
            if (!heart.collected) {
                this.gameOver(); // Game over if heart hits ground
            }
            heart.remove();
            this.hearts = this.hearts.filter(h => h !== heart);
        });
    }
    
    checkCollisions() {
        const basketRect = this.basket.getBoundingClientRect();
        
        this.hearts.forEach(heart => {
            const heartRect = heart.getBoundingClientRect();
            
            if (!heart.collected && 
                heartRect.bottom >= basketRect.top &&
                heartRect.top <= basketRect.bottom &&
                heartRect.right >= basketRect.left &&
                heartRect.left <= basketRect.right) {
                
                heart.collected = true;
                heart.remove();
                this.hearts = this.hearts.filter(h => h !== heart);
                this.score++;
                this.scoreDisplay.textContent = this.score;
                
                if (this.score >= this.targetScore) {
                    this.win();
                }
            }
        });
    }
    
    gameLoop() {
        if (this.isPlaying) {
            this.checkCollisions();
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    gameOver() {
        this.stop();
        setTimeout(() => {
            alert('Oh no! A heart was lost! Try again ❤️');
            this.restart();
        }, 100);
    }
    
    restart() {
        this.score = 0;
        this.scoreDisplay.textContent = this.score;
        this.hearts.forEach(heart => heart.remove());
        this.hearts = [];
        this.start();
    }
    
    win() {
        this.isPlaying = false;
        clearInterval(this.spawnInterval);
        document.removeEventListener('mousemove', this.moveBasket);
        
        // Show final Valentine's screen
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('final-screen').classList.remove('hidden');
        
        // Add event listeners for final buttons
        const finalNoButton = document.querySelector('#final-screen .no-button');
        const finalYesButton = document.querySelector('#final-screen .yes-button');
        
        finalNoButton.addEventListener('click', () => moveToRandomPosition(finalNoButton));
        
        finalYesButton.addEventListener('click', () => {
            document.getElementById('final-screen').classList.add('hidden');
            document.getElementById('wahoo-screen').classList.remove('hidden');
        });
    }
    
    stop() {
        this.isPlaying = false;
        clearInterval(this.spawnInterval);
        document.removeEventListener('mousemove', this.moveBasket);
        this.hearts.forEach(heart => heart.remove());
        this.hearts = [];
    }
}

// Make sure wrong answers in question 3 move randomly
document.querySelectorAll('#question-3 .wrong-answer').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        moveToRandomPosition(button);
    });
});

// Add these functions for fireworks

// Add handler for the continue button
document.querySelector('#wahoo-screen .yes-button').addEventListener('click', () => {
    document.getElementById('wahoo-screen').classList.add('hidden');
    startFireworks();
});
