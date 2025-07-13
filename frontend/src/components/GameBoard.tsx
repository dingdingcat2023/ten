import React from 'react';
import './GameBoard.css';

interface GameBoardProps {
  board: (number | null)[][];
  selected: [number, number][];
  onCellClick: (row: number, col: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, selected, onCellClick }) => {
  return (
    <div className="game-board" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${board.length}, 1fr)`,
      gridTemplateRows: `repeat(${board.length}, 1fr)`,
      gap: 2,
      background: '#e5e6eb',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {board.map((row, i) =>
        row.map((cell, j) => {
          const isSelected = selected.some(([r, c]) => r === i && c === j);
          return (
            <div
              key={`${i}-${j}`}
              className={`cell${cell === null ? ' removed' : ''}${isSelected ? ' selected' : ''}`}
              style={{
                background: cell === null ? '#f7f8fa' : isSelected ? '#1677ff' : '#fff',
                color: cell === null ? '#ccc' : isSelected ? '#fff' : '#222',
                border: '1px solid #e5e6eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                minHeight: 32,
                cursor: cell === null ? 'default' : 'pointer',
                userSelect: 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
              onClick={() => cell !== null && onCellClick(i, j)}
            >
              {cell !== null ? cell : ''}
            </div>
          );
        })
      )}
    </div>
  );
};

export default GameBoard; 