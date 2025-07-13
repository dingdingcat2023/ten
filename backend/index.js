import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.resolve('./backend/leaderboard.json');

app.use(cors());
app.use(express.json());

// 读取排行榜
function readLeaderboard() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}
// 写入排行榜
function writeLeaderboard(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 获取排行榜
app.get('/api/leaderboard', (req, res) => {
  const data = readLeaderboard();
  res.json(data);
});

// 提交分数
app.post('/api/leaderboard', (req, res) => {
  const { name, score, time, mode } = req.body;
  if (!name || typeof score !== 'number' || typeof time !== 'number') {
    return res.status(400).json({ error: '参数错误' });
  }
  let data = readLeaderboard();
  data.push({ name, score, time, mode });
  // 排序：分数高优先，分数相同用时短优先
  data = data.sort((a, b) => b.score - a.score || a.time - b.time).slice(0, 5);
  writeLeaderboard(data);
  res.json({ success: true, leaderboard: data });
});

// 清空排行榜
app.delete('/api/leaderboard', (req, res) => {
  writeLeaderboard([]);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Leaderboard API running at http://localhost:${PORT}`);
}); 