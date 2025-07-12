let BOARD_SIZE = 10;
let MIN_NUM = 1;
let MAX_NUM = 99;
const boardEl = document.getElementById('game-board');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');
const leaderboardList = document.getElementById('leaderboard-list');
const settingsPanel = document.getElementById('settings-panel');
const startGameBtn = document.getElementById('start-game');
const nameModal = document.getElementById('name-modal');
const playerNameInput = document.getElementById('player-name');
const submitNameBtn = document.getElementById('submit-name');
const clearLeaderboardBtn = document.getElementById('clear-leaderboard');
let pendingScore = null;

let board = [];
let selected = [];
let score = 0;
let leaderboard = [];

let numMode = 'double'; // 'single' or 'double'
let boardSizeOption = 10;
let leaderboardKey = '';

let timerDuration = 60; // 秒
let timer = null;
let timeLeft = 60;
let gameStartTime = null;
let gameEndTime = null;
const timeRemainingEl = document.getElementById('time-remaining');

function randomNumber() {
  return Math.floor(Math.random() * (MAX_NUM - MIN_NUM + 1)) + MIN_NUM;
}

function initBoard() {
  const total = BOARD_SIZE * BOARD_SIZE;
  if (total % 2 !== 0) {
    alert('棋盘格子数必须为偶数，才能保证全部消除！');
    board = Array.from({length: BOARD_SIZE}, () => Array(BOARD_SIZE).fill(null));
    return;
  }
  // 生成N/2对可消除数字
  let pairs = [];
  for (let i = 0; i < total / 2; i++) {
    let a, b, sum;
    while (true) {
      a = randomNumber();
      // 只允许b在范围内且a!=b
      let minB = MIN_NUM, maxB = MAX_NUM;
      // 枚举所有b
      let candidates = [];
      for (let bb = minB; bb <= maxB; bb++) {
        if (bb !== a && (a + bb) % 10 === 0) candidates.push(bb);
      }
      if (candidates.length > 0) {
        b = candidates[Math.floor(Math.random() * candidates.length)];
        break;
      }
    }
    pairs.push(a, b);
  }
  // 打乱
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  // 填入棋盘
  board = [];
  let idx = 0;
  for (let i = 0; i < BOARD_SIZE; i++) {
    let row = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
      row.push(pairs[idx++]);
    }
    board.push(row);
  }
}

function renderBoard() {
  boardEl.style.setProperty('--board-size', BOARD_SIZE);
  boardEl.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;
  boardEl.innerHTML = '';
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (board[i][j] === null) {
        cell.textContent = '';
        cell.style.background = 'transparent';
        cell.style.boxShadow = 'none';
        cell.style.cursor = 'default';
      } else {
        cell.textContent = board[i][j];
        cell.dataset.row = i;
        cell.dataset.col = j;
        if (selected.some(([r, c]) => r === i && c === j)) {
          cell.classList.add('selected');
        }
        cell.addEventListener('click', () => handleCellClick(i, j));
      }
      boardEl.appendChild(cell);
    }
  }
}

function isAdjacent([r1, c1], [r2, c2]) {
  return (
    (Math.abs(r1 - r2) === 1 && c1 === c2) ||
    (Math.abs(c1 - c2) === 1 && r1 === r2)
  );
}

function handleCellClick(i, j) {
  if (board[i][j] === null) return;
  if (selected.length === 1 && selected[0][0] === i && selected[0][1] === j) {
    selected = [];
    renderBoard();
    return;
  }
  if (selected.length === 0) {
    selected.push([i, j]);
    renderBoard();
    return;
  }
  if (selected.length === 1) {
    // 不再判断相邻，允许任意两个格子
    selected.push([i, j]);
    renderBoard();
    setTimeout(checkAndRemove, 200);
  }
}

function checkAndRemove() {
  const [[r1, c1], [r2, c2]] = selected;
  if ((r1 === r2 && c1 === c2)) {
    selected = [];
    renderBoard();
    return;
  }
  if (board[r1][c1] === null || board[r2][c2] === null) {
    selected = [];
    renderBoard();
    return;
  }
  const sum = board[r1][c1] + board[r2][c2];
  if (sum % 10 === 0) {
    markRemoved([[r1, c1], [r2, c2]]);
    setTimeout(() => {
      removeAndDrop([[r1, c1], [r2, c2]]);
      score += sum;
      updateScore();
      selected = [];
      renderBoard();
      checkGameOver();
    }, 350);
  } else {
    selected = [];
    renderBoard();
  }
}

function markRemoved(cells) {
  const allCells = document.querySelectorAll('.cell');
  cells.forEach(([r, c]) => {
    const idx = r * BOARD_SIZE + c;
    allCells[idx].classList.add('removed');
  });
}

function removeAndDrop(cells) {
  // 标记要消除的格子为null
  cells.forEach(([r, c]) => {
    board[r][c] = null;
  });
  // 对每一列处理下落
  for (let col = 0; col < BOARD_SIZE; col++) {
    let newCol = [];
    // 从下往上收集未被消除的数字
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (board[row][col] !== null) {
        newCol.push(board[row][col]);
      }
    }
    // 补空（顶部补null）
    while (newCol.length < BOARD_SIZE) {
      newCol.push(null);
    }
    // 写回棋盘（从下到上）
    for (let row = BOARD_SIZE - 1, idx = 0; row >= 0; row--, idx++) {
      board[row][col] = newCol[idx];
    }
  }
}

function updateScore() {
  scoreEl.textContent = `分数: ${score}`;
}

function updateTimerDisplay() {
  if (timeLeft > 0) {
    timeRemainingEl.textContent = `剩余时间：${timeLeft}s`;
  } else {
    timeRemainingEl.textContent = '';
  }
}

function startTimer() {
  clearInterval(timer);
  timeLeft = timerDuration;
  updateTimerDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      gameEndTime = Date.now();
      checkGameOver(true); // 强制结算
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timeRemainingEl.textContent = '';
}

function checkGameOver(forceEnd = false) {
  if (!hasRemovablePair() || forceEnd) {
    stopTimer();
    // 计算用时
    let usedTime = gameEndTime ? Math.round((gameEndTime - gameStartTime) / 1000) : (timerDuration - timeLeft);
    leaderboard = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
    // 兼容旧数据
    if (leaderboard.length && typeof leaderboard[0] === 'number') {
      leaderboard = leaderboard.map(s => ({name: '匿名', score: s, time: usedTime}));
    }
    let canRank = leaderboard.length < 10 || leaderboard.some(item => score > item.score || (score === item.score && usedTime < (item.time || 99999)));
    if (score > 0 && canRank) {
      pendingScore = score;
      pendingTime = usedTime;
      showNameModal();
    } else {
      updateLeaderboard(usedTime);
      setTimeout(() => {
        alert('游戏结束！\n你的得分：' + score + `\n用时：${usedTime}s`);
      }, 100);
    }
  }
}

function hasRemovablePair() {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === null) continue;
      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
          if ((i !== x || j !== y) && board[x][y] !== null && (board[i][j] + board[x][y]) % 10 === 0) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function showNameModal() {
  nameModal.style.display = 'flex';
  playerNameInput.value = '';
  playerNameInput.focus();
}
function hideNameModal() {
  nameModal.style.display = 'none';
}

submitNameBtn.addEventListener('click', submitPlayerName);
playerNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') submitPlayerName();
});

let pendingTime = 0;
function submitPlayerName() {
  let name = playerNameInput.value.trim();
  if (!name) name = '匿名';
  leaderboard = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
  // 兼容旧数据
  if (leaderboard.length && typeof leaderboard[0] === 'number') {
    leaderboard = leaderboard.map(s => ({name: '匿名', score: s, time: pendingTime}));
  }
  leaderboard.push({name, score: pendingScore, time: pendingTime});
  leaderboard = leaderboard.sort((a, b) => b.score - a.score || a.time - b.time).slice(0, 10);
  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
  hideNameModal();
  renderLeaderboard();
  setTimeout(() => {
    alert('游戏结束！\n你的得分：' + pendingScore + `\n用时：${pendingTime}s`);
  }, 100);
}

function updateLeaderboard(usedTime) {
  leaderboard = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
  // 兼容旧数据
  if (leaderboard.length && typeof leaderboard[0] === 'number') {
    leaderboard = leaderboard.map(s => ({name: '匿名', score: s, time: usedTime}));
  }
  leaderboard.push({name: '匿名', score, time: usedTime});
  leaderboard = leaderboard.sort((a, b) => b.score - a.score || a.time - b.time).slice(0, 10);
  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
  renderLeaderboard();
}
function renderLeaderboard() {
  leaderboard = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
  // 兼容旧数据
  if (leaderboard.length && typeof leaderboard[0] === 'number') {
    leaderboard = leaderboard.map(s => ({name: '匿名', score: s, time: 0}));
  }
  leaderboardList.innerHTML = '';
  leaderboard.forEach((item, idx) => {
    const li = document.createElement('li');
    li.textContent = `第${idx+1}名：${item.name}（${item.score}分，${item.time || 0}s）`;
    leaderboardList.appendChild(li);
  });
}

function restartGame() {
  score = 0;
  selected = [];
  updateScore();
  initBoard();
  renderBoard();
  renderLeaderboard();
  gameStartTime = Date.now();
  gameEndTime = null;
  startTimer();
}

function showSettings() {
  document.body.classList.add('settings-active');
  settingsPanel.style.display = 'block';
}
function hideSettings() {
  document.body.classList.remove('settings-active');
  settingsPanel.style.display = 'none';
}

startGameBtn.addEventListener('click', () => {
  numMode = document.querySelector('input[name="num-mode"]:checked').value;
  boardSizeOption = parseInt(document.querySelector('input[name="board-size"]:checked').value, 10);
  BOARD_SIZE = boardSizeOption;
  if (numMode === 'single') {
    MIN_NUM = 1;
    MAX_NUM = 9;
  } else {
    MIN_NUM = 1;
    MAX_NUM = 99;
  }
  leaderboardKey = `ten_leaderboard_${numMode}_${BOARD_SIZE}`;
  // 读取倒计时
  timerDuration = parseInt(document.querySelector('input[name="timer"]:checked').value, 10);
  restartGame();
  hideSettings();
});

// 重开按钮回到设置面板
restartBtn.addEventListener('click', showSettings);

// 初始化时显示设置面板
showSettings();

if (clearLeaderboardBtn) {
  clearLeaderboardBtn.addEventListener('click', () => {
    if (confirm('确定要清空当前难度和棋盘下的排行榜吗？')) {
      localStorage.removeItem(leaderboardKey);
      renderLeaderboard();
    }
  });
} 