const gameboard = document.querySelector("#gameboard");
const ctx = gameboard.getContext("2d");
const scoretext = document.querySelector("#score");
const resetbtn = document.querySelector("#btn");
const gamewidth = 400;  
const gameheight = 400; 
const boardbackground = "white";
const unitsize = 25;

let gameTime = 0;
let timeRemaining = 0;
let timerInterval;


const gameSetup = document.querySelector("#game-setup");
const gameContainer = document.querySelector("#game-container");
const timerDisplay = document.querySelector("#timer");
const timeButtons = document.querySelectorAll(".time-btn");

timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        gameTime = parseInt(btn.dataset.time);
        timeRemaining = gameTime;
        gameSetup.style.display = 'none';
        gameContainer.style.display = 'flex';
        startGame();
    });
});

window.addEventListener('keydown', function(e) {
    if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

class Snake {
    constructor(initialX, initialY, color, borderColor) {
        this.color = color;
        this.borderColor = borderColor;
        this.xVelocity = unitsize;
        this.yVelocity = 0;
        this.score = 0;
        this.body = [
            { x: initialX + unitsize * 4, y: initialY },
            { x: initialX + unitsize * 3, y: initialY },
            { x: initialX + unitsize * 2, y: initialY },
            { x: initialX + unitsize, y: initialY },
            { x: initialX, y: initialY },
        ];
    }

    move() {
        const head = { 
            x: this.body[0].x + this.xVelocity, 
            y: this.body[0].y + this.yVelocity 
        };
        this.body.unshift(head);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.borderColor;
        for (let i = 1; i < this.body.length; i++) {
            ctx.fillRect(this.body[i].x, this.body[i].y, unitsize, unitsize);
            ctx.strokeRect(this.body[i].x, this.body[i].y, unitsize, unitsize);
        }

        const head = this.body[0];
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.borderColor;

        ctx.save();
        
        ctx.translate(head.x + unitsize/2, head.y + unitsize/2);
        let angle = 0;
        if (this.xVelocity > 0) angle = 0;
        if (this.xVelocity < 0) angle = Math.PI;
        if (this.yVelocity > 0) angle = Math.PI/2;
        if (this.yVelocity < 0) angle = -Math.PI/2;
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(unitsize/2, 0);
        ctx.lineTo(-unitsize/2, -unitsize/2);
        ctx.lineTo(-unitsize/2, unitsize/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(0, -unitsize/4, unitsize/8, 0, Math.PI * 2);
        ctx.arc(0, unitsize/4, unitsize/8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(unitsize/8, -unitsize/4, unitsize/16, 0, Math.PI * 2);
        ctx.arc(unitsize/8, unitsize/4, unitsize/16, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    checkCollision(otherSnake) {
        // Wall collision
        if (this.body[0].x < 0 || 
            this.body[0].x >= gamewidth ||
            this.body[0].y < 0 || 
            this.body[0].y >= gameheight) {
            this.score = Math.max(0, this.score - 1);
            this.resetPosition();
            return 'wall';
        }

        // Self collision
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].x === this.body[0].x && 
                this.body[i].y === this.body[0].y) {
                this.score = Math.max(0, this.score - 1);
                this.resetPosition();
                return 'self';
            }
        }

        // Snake collision
        if (otherSnake) {
            if (this.body[0].x === otherSnake.body[0].x && 
                this.body[0].y === otherSnake.body[0].y) {
                this.score = Math.max(0, this.score - 1);
                otherSnake.score = Math.max(0, otherSnake.score - 1);
                this.resetPosition();
                otherSnake.resetPosition();
                return 'head';
            }
        }

        return false;
    }

    resetPosition() {
        this.body = this.body.slice(0, 5);
        if (this === snake1) {
            this.body = Array(5).fill(0).map((_, i) => ({
                x: unitsize * (4 - i),
                y: 0
            }));
        } else {
            this.body = Array(5).fill(0).map((_, i) => ({
                x: unitsize * (4 - i),
                y: gameheight - unitsize
            }));
        }
        this.xVelocity = unitsize;
        this.yVelocity = 0;
    }
}

let running = false;
let foodX, foodY;
const snake1 = new Snake(0, 0, "aqua", "black");
const snake2 = new Snake(0, gameheight - unitsize, "lime", "darkgreen");

window.addEventListener("keydown", changeDirection);
resetbtn.addEventListener("click", resetgame);

function changeDirection(e) {
    const key = e.keyCode;
    
    if (key === 65 && snake1.xVelocity !== unitsize) { 
        snake1.xVelocity = -unitsize;
        snake1.yVelocity = 0;
    } else if (key === 87 && snake1.yVelocity !== unitsize) { 
        snake1.xVelocity = 0;
        snake1.yVelocity = -unitsize;
    } else if (key === 68 && snake1.xVelocity !== -unitsize) { 
        snake1.xVelocity = unitsize;
        snake1.yVelocity = 0;
    } else if (key === 83 && snake1.yVelocity !== -unitsize) { 
        snake1.xVelocity = 0;
        snake1.yVelocity = unitsize;
    }
    
    if (key === 37 && snake2.xVelocity !== unitsize) { 
        snake2.xVelocity = -unitsize;
        snake2.yVelocity = 0;
    } else if (key === 38 && snake2.yVelocity !== unitsize) { 
        snake2.xVelocity = 0;
        snake2.yVelocity = -unitsize;
    } else if (key === 39 && snake2.xVelocity !== -unitsize) { 
        snake2.xVelocity = unitsize;
        snake2.yVelocity = 0;
    } else if (key === 40 && snake2.yVelocity !== -unitsize) { 
        snake2.xVelocity = 0;
        snake2.yVelocity = unitsize;
    }
}

function startGame() {
    running = true;
    createfood();
    startTimer();
    nexttick();
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function endGame() {
    running = false;
    clearInterval(timerInterval);
    displaygameover();
}

function gamestart() {
    running = true;
    createfood();
    nexttick();
}

function nexttick() {
    if (running) {
        setTimeout(() => {
            clearboard();
            drawfood();
            
            snake1.move();
            snake2.move();
            
            if (snake1.body[0].x === foodX && snake1.body[0].y === foodY) {
                snake1.score++;
                createfood();
            } else {
                snake1.body.pop();
            }
            
            if (snake2.body[0].x === foodX && snake2.body[0].y === foodY) {
                snake2.score++;
                createfood();
            } else {
                snake2.body.pop();
            }
            
            snake1.checkCollision(snake2);
            snake2.checkCollision(snake1);
            
            snake1.draw();
            snake2.draw();
            
            updateScores();
            
            if (running) {
                nexttick();
            }
        }, 75);
    }
}

function clearboard() {
  ctx.fillStyle = boardbackground;
  ctx.fillRect(0, 0, gamewidth, gameheight);
}

function createfood() {
  function randomfood(min, max) {
    const randnum =
      Math.round((Math.random() * (max - min) + min) / unitsize) * unitsize;
    return randnum;
  }
  foodX = randomfood(0, gamewidth - unitsize);
  foodY = randomfood(0, gamewidth - unitsize);
}

function drawfood() {
    ctx.fillStyle = "#E74C3C";
    ctx.beginPath();
    ctx.arc(
        foodX + unitsize/2, 
        foodY + unitsize/2, 
        unitsize/2, 
        0, 
        2 * Math.PI
    );
    ctx.fill();
}

function displaygameover() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, gamewidth, gameheight);
    
    ctx.font = "bold 50px Poppins";
    ctx.fillStyle = "#ECF0F1";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", gamewidth / 2, gameheight / 2);
    
    ctx.font = "30px Poppins";
    if (snake1.score > snake2.score) {
        ctx.fillStyle = "#3498DB";
        ctx.fillText("Player 1 Wins!", gamewidth / 2, gameheight / 2 + 60);
    } else if (snake2.score > snake1.score) {
        ctx.fillStyle = "#2ECC71";
        ctx.fillText("Player 2 Wins!", gamewidth / 2, gameheight / 2 + 60);
    } else {
        ctx.fillStyle = "#ECF0F1";
        ctx.fillText("It's a Tie!", gamewidth / 2, gameheight / 2 + 60);
    }
    
    setTimeout(() => {
        gameSetup.style.display = 'block';
        gameContainer.style.display = 'none';
    }, 3000);
}

function resetgame() {
    clearInterval(timerInterval);
    gameSetup.style.display = 'block';
    gameContainer.style.display = 'none';
    snake1.score = 0;
    snake2.score = 0;
    snake1.resetPosition();
    snake2.resetPosition();
    updateScores();
}

function updateScores() {
    scoretext.textContent = `P1: ${snake1.score} | P2: ${snake2.score}`;
}
