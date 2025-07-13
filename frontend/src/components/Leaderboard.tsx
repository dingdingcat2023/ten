import React from 'react';
import { NavBar, List } from 'antd-mobile';

const mockData = [
  { name: '玩家A', score: 120, time: 55 },
  { name: '玩家B', score: 110, time: 60 },
  { name: '玩家C', score: 100, time: 70 },
  { name: '玩家D', score: 90, time: 80 },
  { name: '玩家E', score: 80, time: 90 },
];

const Leaderboard: React.FC = () => {
  return (
    <div>
      <NavBar back={null}>排行榜（前五）</NavBar>
      <List header="玩家名 / 分数 / 用时(s)">
        {mockData.map((item, idx) => (
          <List.Item key={idx}>
            {item.name} / {item.score} / {item.time}
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default Leaderboard; 