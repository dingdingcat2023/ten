import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Leaderboard from './components/Leaderboard';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  SetOutline,
  UnorderedListOutline,
} from 'antd-mobile-icons';

const App: React.FC = () => {
  const [activeKey, setActiveKey] = React.useState('home');

  return (
    <Router>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
        <TabBar activeKey={activeKey} onChange={setActiveKey} safeArea>
          <TabBar.Item key="home" icon={<AppOutline />} title="游戏主页" onClick={() => setActiveKey('home')} />
          <TabBar.Item key="settings" icon={<SetOutline />} title="设置" onClick={() => setActiveKey('settings')} />
          <TabBar.Item key="leaderboard" icon={<UnorderedListOutline />} title="排行榜" onClick={() => setActiveKey('leaderboard')} />
        </TabBar>
      </div>
    </Router>
  );
};

export default App;
