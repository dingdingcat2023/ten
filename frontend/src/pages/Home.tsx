import React, { useState, useEffect } from 'react';
import { Button, NavBar, Modal } from 'antd-mobile';
import GameBoard from '../components/GameBoard';
import { FaTrophy, FaRedo, FaClock } from 'react-icons/fa';
import logo from '../assets/logo.svg';

// 工具函数：生成棋盘
function generateBoard(size: number, min: number, max: number, mode: 'sum10' | 'diff10', diffTarget: number): (number | null)[][] {
  const total = size * size;
  if (total % 2 !== 0) throw new Error('棋盘格子数必须为偶数');
  let pairs: number[] = [];
  for (let i = 0; i < total / 2; i++) {
    let a, b;
    while (true) {
      a = Math.floor(Math.random() * (max - min + 1)) + min;
      let candidates: number[] = [];
      for (let bb = min; bb <= max; bb++) {
        if (bb !== a) {
          if (mode === 'sum10' && (a + bb) % 10 === 0) candidates.push(bb);
          if (mode === 'diff10' && Math.abs(a - bb) === diffTarget) candidates.push(bb);
        }
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
  let board: (number | null)[][] = [];
  let idx = 0;
  for (let i = 0; i < size; i++) {
    let row: (number | null)[] = [];
    for (let j = 0; j < size; j++) {
      row.push(pairs[idx++]);
    }
    board.push(row);
  }
  return board;
}

const defaultSettings = {
  mode: 'sum10' as 'sum10' | 'diff10',
  difficulty: 'double' as 'single' | 'double',
  boardSize: 4,
  timer: 60,
  diffTarget: 10,
};

const Home: React.FC = () => {
  // 设置项可从localStorage读取
  const [settings] = useState(() => {
    const s = localStorage.getItem('ten_settings');
    return s ? JSON.parse(s) : defaultSettings;
  });
  const [board, setBoard] = useState<(number | null)[][]>(() =>
    generateBoard(
      settings.boardSize,
      settings.difficulty === 'single' ? 1 : 1,
      settings.difficulty === 'single' ? 9 : 99,
      settings.mode,
      settings.diffTarget || 10
    )
  );
  const [selected, setSelected] = useState<[number, number][]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timer);
  const [gameOver, setGameOver] = useState(false);
  // NodeJS.Timeout 改为 setInterval 返回值类型
  const [timerId, setTimerId] = useState<ReturnType<typeof setInterval> | null>(null);

  // 启动倒计时
  useEffect(() => {
    if (gameOver) return;
    if (timerId) clearInterval(timerId);
    const id = setInterval(() => {
      setTimeLeft((t: number) => {
        if (t <= 1) {
          clearInterval(id);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    setTimerId(id);
    return () => clearInterval(id);
  }, [settings, gameOver]);

  // 游戏结束弹窗
  useEffect(() => {
    if (gameOver) {
      Modal.show({
        content: `游戏结束！\n你的得分：${score}`,
        closeOnAction: true,
        actions: [
          {
            key: 'restart',
            text: '再来一局',
            primary: true,
            onClick: () => restartGame(),
          },
        ],
      });
    }
  }, [gameOver]);

  // 检查是否还有可消除对
  function hasRemovablePair(bd: (number | null)[][]) {
    const size = bd.length;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (bd[i][j] === null) continue;
        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            if ((i !== x || j !== y) && bd[x][y] !== null) {
              if (settings.mode === 'sum10' && ((bd[i][j]! + bd[x][y]!) % 10 === 0)) return true;
              if (settings.mode === 'diff10' && (Math.abs(bd[i][j]! - bd[x][y]!) === (settings.diffTarget || 10)) && bd[i][j]! !== bd[x][y]!) return true;
            }
          }
        }
      }
    }
    return false;
  }

  // 棋盘点击逻辑
  const handleCellClick = (row: number, col: number) => {
    if (gameOver || board[row][col] === null) return;
    if (selected.length === 1 && selected[0][0] === row && selected[0][1] === col) {
      setSelected([]);
      return;
    }
    if (selected.length === 0) {
      setSelected([[row, col]]);
      return;
    }
    if (selected.length === 1) {
      setSelected([...selected, [row, col]]);
      setTimeout(() => {
        checkAndRemove([[selected[0][0], selected[0][1]], [row, col]]);
      }, 200);
    }
  };

  // 消除判定与下落
  function checkAndRemove(cells: [number, number][]) {
    const [[r1, c1], [r2, c2]] = cells;
    if ((r1 === r2 && c1 === c2) || board[r1][c1] === null || board[r2][c2] === null) {
      setSelected([]);
      return;
    }
    const a = board[r1][c1]!;
    const b = board[r2][c2]!;
    let canRemove = false;
    if (settings.mode === 'sum10') {
      canRemove = (a + b) % 10 === 0;
    } else {
      canRemove = Math.abs(a - b) === (settings.diffTarget || 10) && a !== b;
    }
    if (canRemove) {
      // 标记消除
      const newBoard = board.map(row => [...row]);
      newBoard[r1][c1] = null;
      newBoard[r2][c2] = null;
      // 下落
      for (let col = 0; col < newBoard.length; col++) {
        let newCol: (number | null)[] = [];
        for (let row = newBoard.length - 1; row >= 0; row--) {
          if (newBoard[row][col] !== null) newCol.push(newBoard[row][col]);
        }
        while (newCol.length < newBoard.length) newCol.push(null);
        for (let row = newBoard.length - 1, idx = 0; row >= 0; row--, idx++) {
          newBoard[row][col] = newCol[idx];
        }
      }
      setBoard(newBoard);
      setScore(s => s + (settings.mode === 'sum10' ? a + b : Math.abs(a - b)));
      setSelected([]);
      // 检查是否还有可消除对
      setTimeout(() => {
        if (!hasRemovablePair(newBoard)) {
          setGameOver(true);
        }
      }, 300);
    } else {
      setSelected([]);
    }
  }

  // 重新开始
  function restartGame() {
    setScore(0);
    setSelected([]);
    setTimeLeft(settings.timer);
    setGameOver(false);
    setBoard(
      generateBoard(
        settings.boardSize,
        settings.difficulty === 'single' ? 1 : 1,
        settings.difficulty === 'single' ? 9 : 99,
        settings.mode,
        settings.diffTarget || 10
      )
    );
  }

  // 跳转到设置页
  function gotoSettings() {
    window.location.href = '/settings';
  }

  return (
    <div>
      <NavBar
        back={null}
        style={{
          fontFamily: 'ZCOOL KuaiLe',
          fontSize: 28,
          background: 'rgba(255,255,255,0.85)',
          color: '#1677ff',
          boxShadow: '0 2px 8px #b3e5fc',
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
          <img src={logo} alt="TEN" style={{ height: 36, marginBottom: 2, borderRadius: 8, boxShadow: '0 2px 8px #ffe082' }} />
          <span style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#1677ff',
            letterSpacing: 2,
            textShadow: '0 2px 8px #fffbe6',
          }}>
            叮咚-十消乐
          </span>
        </div>
      </NavBar>
      <div style={{ padding: '16px' }}>
        <GameBoard board={board} selected={selected} onCellClick={handleCellClick} />
        {/* 分数与倒计时美化 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0', fontFamily: 'ZCOOL KuaiLe', fontSize: 24 }}>
          <span style={{ display: 'flex', alignItems: 'center', color: '#ffb347', gap: 8 }}><FaTrophy color="#ffd700" size={28} /> 分数：{score}</span>
          <span style={{ display: 'flex', alignItems: 'center', color: '#1677ff', gap: 8 }}><FaClock color="#1677ff" size={24} /> {timeLeft}s</span>
        </div>
        {/* 排行榜入口 */}
        <a href="/leaderboard" style={{ textDecoration: 'none' }}>
          <Button color="primary" block style={{ fontFamily: 'ZCOOL KuaiLe', fontSize: 20, borderRadius: 16, marginBottom: 12, background: 'linear-gradient(90deg,#ffb347,#f9f871)' }}>🏆 查看排行榜</Button>
        </a>
        <Button block style={{ fontFamily: 'ZCOOL KuaiLe', fontSize: 20, borderRadius: 16, background: 'linear-gradient(90deg,#aee1f9,#1677ff)', color: '#fff', marginBottom: 12 }} onClick={restartGame}>
          <span style={{ display: 'inline-block', marginRight: 8 }}><FaRedo size={20} /></span>重开一局
        </Button>
        <Button block style={{ fontFamily: 'ZCOOL KuaiLe', fontSize: 20, borderRadius: 16, background: 'linear-gradient(90deg,#fffbe6,#ffe082)', color: '#2d3a4b' }} onClick={gotoSettings}>设置</Button>
      </div>
    </div>
  );
};

export default Home; 