const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const framesPerSecond = 30;
let ballX = 75;
let ballY = 75;
let ballSpeedX = 5;
let ballSpeedY = 5;
let mouseX = 0;
let mouseY = 0;

const TRACK_GAP = 2;
const TRACK_W = 40;
const TRACK_H = 40;
const TRACK_COLS = 20;
const TRACK_ROWS = 15;
const TRACK_COUNT = TRACK_COLS * TRACK_ROWS;
let tracksLeft = 0;
let trackGrid = new Array(TRACK_COUNT);

trackReset();
ballReset();

setInterval(updateAll, 1000/framesPerSecond)

canvas.addEventListener('mousemove', updateMousePos);

function rowColToArrayIndex(col, row) {
	return col + TRACK_COLS * row ;
}

function drawTracks() {
	for(var eachRow = 0; eachRow < TRACK_ROWS; eachRow++) {
		for(var eachCol = 0; eachCol < TRACK_COLS; eachCol++) {
			// obtains the base row and adds the offset to get the position.
			let arrayIndex = rowColToArrayIndex(eachCol, eachRow);
			if(trackGrid[arrayIndex]) {
				colorRect(TRACK_W * eachCol, 
					TRACK_H * eachRow, 
					TRACK_W - TRACK_GAP, 
					TRACK_H - TRACK_GAP, 
					'blue');	
			}
		}
	}
}

function trackReset() {
	tracksLeft = 0;
	for(let i = 0;i < TRACK_COUNT; i++) {
		trackGrid[i] = true;
		tracksLeft++;
	}
}

function updateMousePos(event) {
	const rect = canvas.getBoundingClientRect();
	const root = document.documentElement;
	mouseX = event.clientX - rect.left - root.scrollLeft;
	mouseY = event.clientY - rect.top - root.scrollTop;
	/* just for testing!
	ballX = mouseX;
	ballY = mouseY;
	ballSpeedX = 3;
	ballSpeedY = -4*/
}
function updateAll() {
	moveAll();
	drawAll();
}

function ballReset() {
	ballX = canvas.width / 2;
	ballY = canvas.height / 2;
}

function ballMove() {

	ballY += ballSpeedY;
	ballX += ballSpeedX;
	if(ballX > canvas.width && ballSpeedX > 0.0)
	{
		ballSpeedX*=-1;
	}
	if(ballX < 0 && ballSpeedX < 0.0)
	{
		ballSpeedX*=-1;
	}
	if(ballY < 0 && ballSpeedY < 0.0)
	{
		ballSpeedY*=-1;
	}
	if(ballY > canvas.height)
	{
		ballReset();
		trackReset();
	}
}

function isTrackAtColRow(col, row) {
	if(col >= 0 &&
		col < TRACK_COLS &&
		row >= 0 &&
		row < TRACK_ROWS) {
			let trackIndexUnderCoord = rowColToArrayIndex(col, row);
			return trackGrid[trackIndexUnderCoord];
	} else {
		return false;
	}
}

function ballTrackHandling() {
	let ballTrackCol = Math.floor(ballX / TRACK_W); 
	let ballTrackRow = Math.floor(ballY / TRACK_H);
	let trackIndexUnderBall = rowColToArrayIndex(ballTrackCol,ballTrackRow);
	if(ballTrackCol >= 0 &&
		ballTrackCol < TRACK_COLS &&
		ballTrackRow >= 0 &&
		ballTrackRow < TRACK_ROWS) {
		if(isTrackAtColRow(ballTrackCol, ballTrackRow)){
			trackGrid[trackIndexUnderBall] = false;
			tracksLeft--;
			let prevBallX = ballX - ballSpeedX;
			let prevBallY = ballY - ballSpeedY;
			let prevTrackCol = Math.floor(prevBallX / TRACK_W);
			let prevTrackRow = Math.floor(prevBallY / TRACK_H);
			let bothTestFailed = true;
			if(prevTrackCol != ballTrackCol) {
				if(!isTrackAtColRow(prevTrackCol,prevTrackRow)) {
					ballSpeedX *= -1;
					bothTestFailed = false;
				}
			}
			if(prevTrackRow != ballTrackRow) {
				if(!isTrackAtColRow(prevTrackCol,prevTrackRow)) {
					ballSpeedY *= -1;
					bothTestFailed = false;
				}
			}

			if(bothTestFailed) {
				ballSpeedX *= -1;
				ballSpeedY *= -1;
			}
		}
	}
}

function moveAll() {
	ballMove();
	ballTrackHandling();
}

function drawAll() {
	colorRect(0, 0, canvas.width, canvas.height, 'black');
	colorCircle(ballX, ballY, 10 , 'white');
	drawTracks();
}

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
	ctx.fillStyle = fillColor; 
	ctx.fillRect(topLeftX, topLeftY, boxWidth, boxHeight); 
}

function colorCircle(centerX, centerY, radius, fillColor) {
	ctx.fillStyle = fillColor;
	ctx.beginPath();
	ctx.arc(centerX,centerY, radius, 0, Math.PI*2, true);
	ctx.fill();
	ctx.closePath();
}

function colorText(showWords, textX, textY, fillColor) {
	ctx.fillStyle = fillColor;
	ctx.fillText(showWords, textX, textY);
}