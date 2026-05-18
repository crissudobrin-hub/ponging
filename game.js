// Wait for DOM to load before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Get canvas and context
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Game variables
    let gameRunning = false;
    let playerScore = 0;
    let computerScore = 0;
    
    // Paddle properties
    const paddle = {
        width: 10,
        height: 80,
        speed: 6
    };
    
    // Player paddle (left side - green)
    const playerPaddle = {
        x: 20,
        y: canvas.height / 2 - paddle.height / 2,
        width: paddle.width,
        height: paddle.height,
        speed: paddle.speed,
        dy: 0,
        mouseY: canvas.height / 2
    };
    
    // Computer paddle (right side - red)
    const computerPaddle = {
        x: canvas.width - 30,
        y: canvas.height / 2 - paddle.height / 2,
        width: paddle.width,
        height: paddle.height,
        speed: paddle.speed * 0.8
    };
    
    // Ball properties
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 8,
        dx: 5,
        dy: 5,
        speed: 5,
        maxSpeed: 8
    };
    
    // Keyboard input
    const keys = {};
    
    // Event listeners
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        playerPaddle.mouseY = e.clientY - rect.top;
    });
    
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('resetBtn').addEventListener('click', resetScore);
    
    // Game functions
    function startGame() {
        gameRunning = !gameRunning;
        document.getElementById('startBtn').textContent = gameRunning ? '⏸ Pause Game' : '▶ Resume Game';
    }
    
    function resetScore() {
        playerScore = 0;
        computerScore = 0;
        gameRunning = false;
        document.getElementById('startBtn').textContent = '▶ Start Game';
        updateScoreboard();
        resetBall();
    }
    
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 5;
        const angle = (Math.random() - 0.5) * Math.PI / 3;
        ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1) * Math.cos(angle);
        ball.dy = ball.speed * Math.sin(angle);
    }
    
    function updateScoreboard() {
        document.getElementById('playerScore').textContent = playerScore;
        document.getElementById('computerScore').textContent = computerScore;
    }
    
    function updatePlayerPaddle() {
        // Mouse control
        if (playerPaddle.mouseY > playerPaddle.height / 2 && 
            playerPaddle.mouseY < canvas.height - playerPaddle.height / 2) {
            playerPaddle.y = playerPaddle.mouseY - playerPaddle.height / 2;
        }
    
        // Arrow key control
        if (keys['ArrowUp'] && playerPaddle.y > 0) {
            playerPaddle.y -= playerPaddle.speed;
        }
        if (keys['ArrowDown'] && playerPaddle.y < canvas.height - playerPaddle.height) {
            playerPaddle.y += playerPaddle.speed;
        }
    
        // Boundary collision
        if (playerPaddle.y < 0) {
            playerPaddle.y = 0;
        }
        if (playerPaddle.y + playerPaddle.height > canvas.height) {
            playerPaddle.y = canvas.height - playerPaddle.height;
        }
    }
    
    function updateComputerPaddle() {
        // AI - tracks ball position with reaction threshold
        const computerCenter = computerPaddle.y + computerPaddle.height / 2;
        const ballCenter = ball.y;
        const reactionThreshold = 35;
    
        if (computerCenter < ballCenter - reactionThreshold) {
            computerPaddle.y += computerPaddle.speed;
        } else if (computerCenter > ballCenter + reactionThreshold) {
            computerPaddle.y -= computerPaddle.speed;
        }
    
        // Boundary collision
        if (computerPaddle.y < 0) {
            computerPaddle.y = 0;
        }
        if (computerPaddle.y + computerPaddle.height > canvas.height) {
            computerPaddle.y = canvas.height - computerPaddle.height;
        }
    }
    
    function updateBall() {
        ball.x += ball.dx;
        ball.y += ball.dy;
    
        // Top and bottom wall collision
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.dy = -ball.dy;
            ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
        }
    
        // Paddle collision detection
        if (checkPaddleCollision(playerPaddle)) {
            ball.dx = Math.abs(ball.dx);
            ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
            addPaddleEffect(playerPaddle);
        }
    
        if (checkPaddleCollision(computerPaddle)) {
            ball.dx = -Math.abs(ball.dx);
            ball.x = computerPaddle.x - ball.radius;
            addPaddleEffect(computerPaddle);
        }
    
        // Score detection
        if (ball.x - ball.radius < 0) {
            computerScore++;
            updateScoreboard();
            resetBall();
        }
    
        if (ball.x + ball.radius > canvas.width) {
            playerScore++;
            updateScoreboard();
            resetBall();
        }
    }
    
    function checkPaddleCollision(paddle) {
        return (
            ball.x - ball.radius < paddle.x + paddle.width &&
            ball.x + ball.radius > paddle.x &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.y + ball.radius > paddle.y
        );
    }
    
    function addPaddleEffect(paddle) {
        // Add spin effect based on where ball hits paddle
        const paddleCenter = paddle.y + paddle.height / 2;
        const ballDistanceFromCenter = ball.y - paddleCenter;
        const maxAngle = 0.6; // Maximum angle in radians (~35 degrees)
        
        const angle = (ballDistanceFromCenter / (paddle.height / 2)) * maxAngle;
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        
        ball.dy = Math.sin(angle) * speed;
        ball.dx = Math.cos(angle) * speed * (ball.dx > 0 ? 1 : -1);
    
        // Increase speed slightly on each paddle hit (cap at maxSpeed)
        const newSpeed = Math.min(speed + 0.5, ball.maxSpeed);
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (currentSpeed > 0) {
            ball.dx = (ball.dx / currentSpeed) * newSpeed;
            ball.dy = (ball.dy / currentSpeed) * newSpeed;
        }
    }
    
    function drawPaddle(paddle, color = '#ffd700') {
        // Draw main paddle
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    function drawBall() {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    function drawCenterLine() {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    function draw() {
        // Clear canvas with gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#0f1729');
        gradient.addColorStop(0.5, '#1a1a3a');
        gradient.addColorStop(1, '#0f1729');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        // Draw game elements
        drawCenterLine();
        drawPaddle(playerPaddle, '#22c55e');     // Green for player
        drawPaddle(computerPaddle, '#ef4444');   // Red for computer
        drawBall();
    }
    
    function update() {
        if (gameRunning) {
            updatePlayerPaddle();
            updateComputerPaddle();
            updateBall();
        }
    }
    
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    // Start the game loop
    gameLoop();
});
