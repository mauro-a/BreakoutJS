import $ from 'jquery';

// fix pad ball bug

const game = (function() {

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const framesPerSecond = 30;
    let ballX = 75;
    let ballY = 75;
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    const PADDLE_DIST_FROM_EDGE = 60;
    const PADDLE_WIDTH = 100;
    const PADDLE_THICKNESS = 10;
    let paddleX = 400;
    let mouseX = 0;
    let mouseY = 0;

    const BRICK_GAP = 2;
    const BRICK_W = 80;
    const BRICK_H = 20;
    const BRICK_COLS = 10;
    const BRICK_ROWS = 14;
    const BRICK_COUNT = BRICK_COLS * BRICK_ROWS;
    let bricksLeft = 0;
    let brickGrid = new Array(BRICK_COUNT);
    let startMovingBall = false;
    let lives = 3;
    brickReset();
    ballReset();

    setInterval(updateAll, 1000 / framesPerSecond)


    canvas.addEventListener('mousemove', updateMousePos);
    canvas.addEventListener('click', function(event) {
    	console.log('LISTENER');
    	startMovingBall = true;
    });


    function rowColToArrayIndex(col, row) {
        return col + BRICK_COLS * row;
    }

    function drawBricks() {
        for (var eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
            for (var eachCol = 0; eachCol < BRICK_COLS; eachCol++) {
                // obtains the base row and adds the offset to get the position.
                let arrayIndex = rowColToArrayIndex(eachCol, eachRow);
                if (brickGrid[arrayIndex]) {
                    colorRect(BRICK_W * eachCol,
                        BRICK_H * eachRow,
                        BRICK_W - BRICK_GAP,
                        BRICK_H - BRICK_GAP,
                        'blue');
                }
            }
        }
    }

    function brickReset() {
        bricksLeft = 0;
        let i;
        for (i = 0; i < 3 * BRICK_COLS; i++) {
            brickGrid[i] = false;
        }
        for (; i < BRICK_COUNT; i++) {
            brickGrid[i] = true;
            bricksLeft++;
        }
    }

    function updateMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        const root = document.documentElement;
        mouseX = event.clientX - rect.left - root.scrollLeft;
        mouseY = event.clientY - rect.top - root.scrollTop;
        paddleX = mouseX - PADDLE_WIDTH / 2;
        // ballX = mouseX;
        // ballY = mouseY;
        // ballSpeedX = 3;
        // ballSpeedY = -4
    }

    function updateAll() {
        moveAll();
        drawAll();
    }

    function ballReset() {
        ballX = paddleX / 2;
        ballY = canvas.height - PADDLE_DIST_FROM_EDGE - PADDLE_THICKNESS;
        startMovingBall = false;

    }

    function ballMove() {
        if (startMovingBall) {

            ballY += ballSpeedY;
            ballX += ballSpeedX;
            if (ballX > canvas.width && ballSpeedX > 0.0) {
                ballSpeedX *= -1;
            }
            if (ballX < 0 && ballSpeedX < 0.0) {
                ballSpeedX *= -1;
            }
            if (ballY < 0 && ballSpeedY < 0.0) {
                ballSpeedY *= -1;
            }
            if ((ballY > canvas.height) && (lives > 0)) {
            	lives--;
            	// add the visual counter
                ballReset();
            }
            if(lives === 0) {
            	lives = 3;
            	// Game over message
            	ballReset();
                brickReset();
            }
        }
    }

    function isBrickAtColRow(col, row) {
        if (col >= 0 &&
            col < BRICK_COLS &&
            row >= 0 &&
            row < BRICK_ROWS) {
            let brickIndexUnderCoord = rowColToArrayIndex(col, row);
            return brickGrid[brickIndexUnderCoord];
        } else {
            return false;
        }
    }

    function ballBrickHandling() {
        let ballBrickCol = Math.floor(ballX / BRICK_W);
        let ballBrickRow = Math.floor(ballY / BRICK_H);
        let brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);
        if (ballBrickCol >= 0 &&
            ballBrickCol < BRICK_COLS &&
            ballBrickRow >= 0 &&
            ballBrickRow < BRICK_ROWS) {
            if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
                brickGrid[brickIndexUnderBall] = false;
                bricksLeft--;
                let prevBallX = ballX - ballSpeedX;
                let prevBallY = ballY - ballSpeedY;
                let prevBrickCol = Math.floor(prevBallX / BRICK_W);
                let prevBrickRow = Math.floor(prevBallY / BRICK_H);
                let bothTestFailed = true;
                if (prevBrickCol != ballBrickCol) {
                    if (!isBrickAtColRow(prevBrickCol, prevBrickRow)) {
                        ballSpeedX *= -1;
                        bothTestFailed = false;
                    }
                }
                if (prevBrickRow != ballBrickRow) {
                    if (!isBrickAtColRow(prevBrickCol, prevBrickRow)) {
                        ballSpeedY *= -1;
                        bothTestFailed = false;
                    }
                }

                if (bothTestFailed) {
                    ballSpeedX *= -1;
                    ballSpeedY *= -1;
                }
            }
        }
    }

    function ballPaddleHandling() {
        let paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
        let paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
        let paddleLeftEdgeX = paddleX;
        let paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;

        if (ballY > paddleTopEdgeY && //below the top of paddle
            ballY < paddleBottomEdgeY && // above bottom of paddle
            ballX > paddleLeftEdgeX && // right of the left side of paddle
            ballX < paddleRightEdgeX) { // left of the right side of paddle
            ballSpeedY *= -1;

            let centerOfPaddleX = paddleX + PADDLE_WIDTH / 2;
            let ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
            ballSpeedX = ballDistFromPaddleCenterX * 0.35;
            if (bricksLeft == 0) {
                brickReset();
                ballReset();
            }

        }
        if(!startMovingBall) {
	       	ballX = paddleX + PADDLE_WIDTH / 2;
        }

    }

    function moveAll() {
        ballMove();
        ballBrickHandling();
        ballPaddleHandling();
    }

    function drawAll() {
        colorRect(0, 0, canvas.width, canvas.height, 'black');
        colorCircle(ballX, ballY, 10, 'white');
        colorRect(paddleX, canvas.height - PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'white');
        drawBricks();
    }

    function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
    }

    function colorCircle(centerX, centerY, radius, fillColor) {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();
    }

    function colorText(showWords, textX, textY, fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillText(showWords, textX, textY);
    }
});

/* Loads the game, once the user presses the begin button */

$('#startButton').click(function() {
    $('#startScreen').hide();
    game();
});
