import React, { useState } from 'react';
import { NavBar, Radio, Space, Button, Input } from 'antd-mobile';

const Settings: React.FC = () => {
  const [mode, setMode] = useState<'sum10' | 'diff10'>(() => {
    const s = localStorage.getItem('ten_settings');
    return s ? JSON.parse(s).mode : 'sum10';
  });
  const [difficulty, setDifficulty] = useState<'single' | 'double'>(() => {
    const s = localStorage.getItem('ten_settings');
    return s ? JSON.parse(s).difficulty : 'double';
  });
  const [boardSize, setBoardSize] = useState(() => {
    const s = localStorage.getItem('ten_settings');
    return s ? JSON.parse(s).boardSize : 4;
  });
  const [timer, setTimer] = useState(() => {
    const s = localStorage.getItem('ten_settings');
    return s ? JSON.parse(s).timer : 60;
  });
  const [diffTarget, setDiffTarget] = useState(() => {
    const s = localStorage.getItem('ten_settings');
    return s && JSON.parse(s).diffTarget ? JSON.parse(s).diffTarget : 10;
  });

  const handleSave = () => {
    const settings = { mode, difficulty, boardSize, timer, diffTarget };
    localStorage.setItem('ten_settings', JSON.stringify(settings));
    window.location.href = '/home';
  };

  return (
    <div>
      <NavBar back={null}>设置</NavBar>
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>玩法模式：</div>
          <Space direction="vertical">
            <Radio.Group value={mode} onChange={val => setMode(val as any)}>
              <Space direction="horizontal">
                <Radio value="sum10">凑十法（和为10的倍数）</Radio>
                <Radio value="diff10">破十法（自定义相减目标值）</Radio>
              </Space>
            </Radio.Group>
          </Space>
        </div>
        {mode === 'diff10' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>破十法目标值（如4，表示相减后等于4）：</div>
            <Input
              type="number"
              value={diffTarget}
              min={1}
              max={99}
              onChange={val => setDiffTarget(Number(val))}
              placeholder="请输入目标值"
            />
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>数字难度：</div>
          <Space direction="horizontal">
            <Radio.Group value={difficulty} onChange={val => setDifficulty(val as any)}>
              <Radio value="single">个位数（1~9）</Radio>
              <Radio value="double">两位数（1~99）</Radio>
            </Radio.Group>
          </Space>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>棋盘大小：</div>
          <Space direction="horizontal">
            <Radio.Group value={boardSize} onChange={val => setBoardSize(Number(val))}>
              <Radio value={4}>4x4</Radio>
              <Radio value={6}>6x6</Radio>
              <Radio value={10}>10x10</Radio>
            </Radio.Group>
          </Space>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>倒计时：</div>
          <Space direction="horizontal">
            <Radio.Group value={timer} onChange={val => setTimer(Number(val))}>
              <Radio value={60}>1分钟</Radio>
              <Radio value={120}>2分钟</Radio>
            </Radio.Group>
          </Space>
        </div>
        <Button color="primary" block onClick={handleSave}>保存设置</Button>
      </div>
    </div>
  );
};

export default Settings; 