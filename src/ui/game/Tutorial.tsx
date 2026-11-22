import { useEffect, useState } from 'react';
import { store } from '../../state/store';
import { Button } from '../components/Button';

const STEPS: { sel: string; title: string; text: string }[] = [
  { sel: 'kpi', title: '目标：播放量 KPI', text: '每关都要在 4 次发布内，让累计播放量达到 KPI。进度条满了就通关。' },
  { sel: 'hand', title: '你的内容卡', text: '点击卡牌选中（最多 5 张），点击顺序就是视频里的出场顺序。数字键 1–8 也能选牌。' },
  { sel: 'preview', title: '视频预览', text: '平台会自动识别视频类型，并预估播放量 = 基础流量 × 倍率。试试把不同标签搭配在一起！' },
  { sel: 'discard', title: '换牌', text: '手牌不理想？选中要丢掉的卡，点「换牌」重新抽。每关只有 2 次。' },
  { sel: 'publish', title: '发布视频！', text: '准备好了就发布。看着播放量一路爆炸吧——通关后去商店买「流量神器」，它们才是真正的流量密码。' },
];

export function Tutorial() {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = STEPS[i];
  useEffect(() => {
    const update = () => {
      const el = document.querySelector(`[data-tut="${step.sel}"]`);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    update();
    window.addEventListener('resize', update);
    const t = window.setInterval(update, 400);
    return () => {
      window.removeEventListener('resize', update);
      clearInterval(t);
    };
  }, [step.sel]);
  const done = () => store.finishTutorial();
  const pad = 6;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const boxW = Math.min(320, vw - 24);
  let left = 12;
  let top = vh / 2 - 80;
  if (rect) {
    left = Math.max(12, Math.min(vw - boxW - 12, rect.left + rect.width / 2 - boxW / 2));
    top = rect.bottom + 14 + 170 < vh ? rect.bottom + 14 : Math.max(12, rect.top - 184);
  }
  return (
    <div className="tutorial">
      {rect && (
        <div
          className="tut-spot"
          style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
        />
      )}
      <div className="tut-box panel notch" style={{ left, top, width: boxW }}>
        <div className="tut-step t-muted">
          新手引导 {i + 1}/{STEPS.length}
        </div>
        <div className="big t-pink">{step.title}</div>
        <p>{step.text}</p>
        <div className="modal-actions">
          <Button size="sm" variant="ghost" onClick={done}>
            跳过
          </Button>
          <Button size="sm" variant="green" onClick={() => (i + 1 < STEPS.length ? setI(i + 1) : done())}>
            {i + 1 < STEPS.length ? '下一步' : '开始！'}
          </Button>
        </div>
      </div>
    </div>
  );
}
