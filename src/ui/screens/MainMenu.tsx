import { useEffect, useState } from 'react';
import { BALANCE } from '../../data/balance';
import { formatNum } from '../../engine/num';
import { store, useApp } from '../../state/store';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Sprite } from '../components/Sprite';

const TICKER = [
  '算法亲儿子 ×2', '评论区吵起来了 ×3', '矩阵号：再来一次', '流量密码 ×8', '互联网永动机 重放',
  '百万粉丝大V ×3.5', '热搜霸榜', '标题党 ×5', '宠粉直播', 'AI 猫咪创业',
];

export function Logo({ small }: { small?: boolean }) {
  return (
    <div className={`logo ${small ? 'logo-sm' : ''}`}>
      <div className="logo-crown">
        <Sprite id="mascot" scale={small ? 2 : 5} />
      </div>
      <div className="logo-text" data-text="流量之王">
        流量之王
      </div>
      <div className="logo-sub">VIRAL&nbsp;KING</div>
    </div>
  );
}

export function MainMenu() {
  const run = useApp((s) => s.run);
  const records = useApp((s) => s.records);
  const [seed, setSeed] = useState('');
  const [seedOpen, setSeedOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [views, setViews] = useState(128);
  const canContinue = !!run && run.phase !== 'gameOver';

  useEffect(() => {
    const t = window.setInterval(() => setViews((v) => (v > 1e15 ? 128 : Math.floor(v * 1.37 + 7))), 120);
    return () => clearInterval(t);
  }, []);

  const start = () => {
    if (canContinue) setConfirm(true);
    else store.newRun(seed);
  };

  return (
    <div className="menu screen-fade">
      <div className="menu-ticker" aria-hidden>
        <div className="menu-ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
      <div className="menu-center">
        <Logo />
        <div className="menu-counter">
          <Sprite id="views" scale={2} />
          <span className="t-score glow-yellow big">{formatNum(views)}</span>
          <span className="t-muted">次播放</span>
        </div>
        <div className="menu-buttons">
          {canContinue && (
            <Button variant="green" size="lg" onClick={() => store.continueRun()}>
              继续游戏 <small>第 {run!.stage + 1}/{BALANCE.stages} 关</small>
            </Button>
          )}
          <Button variant="pink" size="lg" onClick={start}>
            开始新游戏
          </Button>
          <div className="menu-row">
            <Button variant="cyan" onClick={() => store.setScreen('help')}>
              游戏说明
            </Button>
            <Button variant="ghost" onClick={() => store.openSettings(true)}>
              设置
            </Button>
          </div>
          <button className="link-btn" onClick={() => setSeedOpen((v) => !v)}>
            <Sprite id="seed" scale={1} /> {seedOpen ? '收起种子' : '自定义随机种子'}
          </button>
          {seedOpen && (
            <input
              className="seed-input notch"
              placeholder="留空则随机，例如 CAT-AI-001"
              value={seed}
              maxLength={24}
              onChange={(e) => setSeed(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && start()}
            />
          )}
        </div>
        <div className="menu-records">
          <span>
            历史最佳单条：<b className="t-score">{formatNum(records.bestVideo)}</b>
          </span>
          <span>
            通关 <b className="t-green">{records.wins}</b> / {records.runs} 局
          </span>
        </div>
      </div>
      <div className="menu-foot t-dim">v1.0 · 单机 · 所有数据仅保存在本地浏览器</div>
      {confirm && (
        <Modal title="开始新游戏？" onClose={() => setConfirm(false)}>
          <p>当前进度（第 {run!.stage + 1} 关）会被覆盖，确定要重新开始吗？</p>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              再想想
            </Button>
            <Button
              variant="pink"
              onClick={() => {
                setConfirm(false);
                store.newRun(seed);
              }}
            >
              重新开始
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
