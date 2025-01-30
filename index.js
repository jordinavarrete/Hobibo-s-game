function isMobile(){
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

if(isMobile()){
    const enterBtn = document.querySelector("#enterBtn");
    enterBtn.style.display = "block";
    const  body = document.querySelector('body');
    body.style.fontFamily = "Arial";
}

const cells = document.querySelectorAll(".cell");
const restartBtn = document.querySelector("#restartBtn");
const gameContainer = document.querySelector(".gameContainer");
const Title = document.querySelector("#Title");
const multiplayerBtn = document.querySelector(".multiplayer_toggle_btn");
const meAIToggleBtn = document.querySelector(".me_AI_toggle_btn");
let options = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
let tablero = [5, 4, 3, 2, 1];
let tableroCount = 0;
let currentPlayer = "Blue";
let running = false;
let currentLvl = 0;
let multiplayer = false;
let meAI = false;

initializeGame();


function initializeGame() {
    cells.forEach(cell => cell.addEventListener("click", cellClicked));
    restartBtn.addEventListener("click", restartGame);
    multiplayerBtn.addEventListener("click", toggleMultiplayer);
    meAIToggleBtn.addEventListener("click", toggleMeAI);
    document.addEventListener("keydown", (event) => {
        if (event.code === "Enter" && currentLvl != 0 && running) {
            if (!(multiplayer && currentPlayer != "Blue")) {
                changePlayer();
            }
        }
    });
    enterBtn.addEventListener("click",enterFunction);
    running = true;
}

function enterFunction(){
    if (currentLvl != 0 && running) {
        if (!(multiplayer && currentPlayer != "Blue")) {
            changePlayer();
        }
    }
}

function toggleMultiplayer() {
    multiplayer = !multiplayer;
    meAIToggleBtn.style.display = multiplayer ? "block" : "none";
    if(!multiplayer) {
        meAI = false;
    }
    restartGame();
}

function toggleMeAI() {
    meAI = !meAI;
    restartGame();
}

function restartGame() {
    currentPlayer = "Blue";
    options = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
    tablero = [5, 4, 3, 2, 1];
    tableroCount = 0;
    Title.textContent = `Hobibo's Game`;
    cells.forEach(cell => cell.style.backgroundColor = "var(--background-colour)");
    cells.forEach(cell => cell.style.borderColor = "var(--base-colour");
    gameContainer.style.boxShadow = `0 0px 20px blue`;
    currentLvl = 0;
    running = true;
    
    if(meAI){
        currentPlayer = "Red";
        gameContainer.style.boxShadow = `0 0px 20px Red`;
        let move = { Lvl: 0, move: 1 };
        
        updateComputerMove(move);
        changePlayer();
    }
}

function cellClicked() {
    const cellIndex = this.getAttribute("cellIndex");
    if (options[cellIndex] != "" || !running) {
        return;
    }
    if (currentLvl != 0 && currentLvl != getLvl(cellIndex)) return;

    currentLvl = getLvl(cellIndex);
    updateCell(this, cellIndex);
    tablero[currentLvl - 1]--;
    tableroCount++;
    checkWinner();
    if (running) {
        checkLvl();
    }
}

function getLvl(index) {
    if ((index >= 0) && (index < 5)) {
        return 1;
    }
    if ((index >= 5) && (index < 9)) {
        return 2;
    }
    if ((index >= 9) && (index < 12)) {
        return 3;
    }
    if ((index == 12) || (index == 13)) {
        return 4;
    }
    if ((index == 14)) {
        return 5;
    }
}

function updateCell(cell, index) {
    options[index] = currentPlayer;
    cell.style.backgroundColor = "var(--newcell-colour)";
    cell.style.borderColor = `${currentPlayer}`;
}

function changePlayer() {
    currentPlayer = (currentPlayer == "Blue") ? "Red" : "Blue";
    gameContainer.style.boxShadow = `0 0px 20px ${currentPlayer}`;
    currentLvl = 0;
    if (multiplayer) {
        if (currentPlayer == "Red") {
            setTimeout(computerMove, 500);
        }
    }
}

function checkWinner() {
    let count = 0;
    let winCell;
    for (let i = 0; i < options.length; i++) {
        if (options[i] == "") {
            count++;
            winCell = i;
        }
    }
    if (count == 1) {
        running = false;
        Title.textContent = `${currentPlayer} wins`;
        cells[winCell].style.backgroundColor = `${currentPlayer}`;
        cells[winCell].style.borderColor = `${currentPlayer}`;
    }
}

function checkLvl() {
    if (currentLvl == 0) return;
    if (tablero[currentLvl - 1] == 0) changePlayer();
}

function computerMove() {
    if (!running || currentPlayer != "Red") return;

    let bestScore = -Infinity;
    let bestMove;
    for (let Lvl = 0; Lvl < 5; Lvl++) {
        if (tablero[Lvl] === 0) continue;
        for (let move = 1; move <= tablero[Lvl]; move++) {
            tablero[Lvl] -= move;
            let score = minimax(tablero, 0, false);
            tablero[Lvl] += move;
            if (score > bestScore) {
                bestScore = score;
                bestMove = { Lvl, move };
            }
        }
    }
    if (tableroCount + bestMove.move === 15) bestMove.move--;
    updateComputerMove(bestMove);
    checkWinner();
    if (running) {
        changePlayer();
    }
}

function updateComputerMove(bestMove) {
    tablero[bestMove.Lvl] -= bestMove.move;
    tableroCount += bestMove.move;
    let count = bestMove.move;
    for (let i = 0; i < options.length; i++) {
        if (bestMove.Lvl === getLvl(i) - 1 && count > 0 && options[i] === '') {
            updateCell(cells[i], i);
            count--;
        }
    }
}

const scores = {
    "Red": 1,
    "Blue": -1
};

function minimax(tablero, depth, isMaximizing) {
    let result = checkMinimaxWinner(tablero, isMaximizing);
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let Lvl = 0; Lvl < 5; Lvl++) {
            if (tablero[Lvl] === 0) continue;
            for (let move = 1; move <= tablero[Lvl]; move++) {
                tablero[Lvl] -= move;
                let score = minimax(tablero, depth + 1, false);
                tablero[Lvl] += move;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let Lvl = 0; Lvl < 5; Lvl++) {
            if (tablero[Lvl] === 0) continue;
            for (let move = 1; move <= tablero[Lvl]; move++) {
                tablero[Lvl] -= move;
                let score = minimax(tablero, depth + 1, true);
                tablero[Lvl] += move;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkMinimaxWinner(board, isMaximizing) {
    let count = board.reduce((acc, val) => acc + val, 0);
    if (count === 1) {
        return isMaximizing ? "Blue" : "Red";
    }
    return null;
}
