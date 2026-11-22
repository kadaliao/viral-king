import { useCallback, useEffect, useRef, useState } from 'react';
import { sound } from '../../audio/sfx';
import { MILESTONES, milestoneTier } from '../../data/balance';
import { formatMult, formatNum } from '../../engine/num';
import type { Card, LastVideo, ScoreStep } from '../../engine/types';
import { bump, fx, fxEl, popupAt } from '../../fx/fx';
import { useApp } from '../../state/store';
import { Button } from '../components/Button';
import { VideoFrame, type Danmaku } from './VideoFrame';

const AUDIENCE = [
  '前排！', '爷青回', '笑死', '这也行？', '已三连', '666', '名场面', '下次一定', '求 BGM', '算法懂我',
  '好家伙', '离谱', '已转发给我妈', '这条要火', '截图了', '???', '神作', '来了来了', '泪目', '课代表来了',
  '这是可以说的吗', '我宣布今年最佳', '一键三连', '火钳刘明', '前方高能',
];

const NEON = ['#ff3ea5', '#39ff88', '#ffe14d', '#3ee8ff'];

function sourceEl(step: ScoreStep): Element | null {
  const s = step.source;
  switch (s.type) {
    case 'card': return fxEl(`card-${s.uid}`);
    case 'artifact': return fxEl(`art-${s.uid}`);
    case 'fans': return fxEl('fans');
    case 'boss': return fxEl('boss') ?? fxEl('f-mult');
    default: return fxEl('combo');
  }
}

function stepText(step: ScoreStep): { text: string; color: string; size: number } {
  switch (step.kind) {
    case 'base': return { text: `+${formatNum(step.amount)}`, color: '#3ee8ff', size: 24 };
    case 'mult': return { text: `+${formatNum(step.amount)} 倍`, color: '#ff3ea5', size: 24 };
    case 'xmult': return { text: `×${formatMult(step.amount)}`, color: '#ffe14d', size: step.amount >= 3 ? 48 : 36 };
    case 'xbase': return { text: `基础×${formatMult(step.amount)}`, color: step.amount < 1 ? '#ff3355' : '#3ee8ff', size: 24 };
    case 'retrigger': return { text: '再来一次!', color: '#39ff88', size: 24 };
    case 'coins': return { text: `${step.amount > 0 ? '+' : ''}${step.amount} 金币`, color: '#ffb020', size: 24 };
    case 'debuff': return { text: `×${formatMult(step.amount)}`, color: '#ff3355', size: 36 };
    case 'combo': return { text: step.label, color: '#ffffff', size: 24 };
    default: return { text: step.label, color: '#ffffff', size: 12 };
  }
}

interface Props {
  last: LastVideo;
  cards: Card[];
  onDone: () => void;
}

export function ScoringStage({ last, cards, onDone }: Props) {
  const speedSetting = useApp((s) => s.settings.speed);
  const [boost, setBoost] = useState(1);
  const speed = speedSetting * boost;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const steps = last.result.steps;
  const [idx, setIdx] = useState(-1);
  const [finale, setFinale] = useState(false);
  const [banner, setBanner] = useState<{ text: string; tier: number; key: number } | null>(null);
  const [danmaku, setDanmaku] = useState<Danmaku[]>([]);
  const [chain, setChain] = useState(0);
  const [titleLen, setTitleLen] = useState(0);
  const tierShown = useRef(0);
  const timer = useRef(0);
  const danId = useRef(0);
  const doneRef = useRef(false);
  const throttled = new Set(last.result.throttledUids);
  const title = last.record.title;

  const pushDan = useCallback((text: string, color: string, big = false) => {
    const id = ++danId.current;
    setDanmaku((d) => [...d.slice(-14), { id, text, lane: id % 6, color, big }]);
    window.setTimeout(() => setDanmaku((d) => d.filter((x) => x.id !== id)), 4200);
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    window.clearTimeout(timer.current);
    onDone();
  }, [onDone]);

  // typewriter title
  useEffect(() => {
    if (titleLen >= title.length) return;
    const t = window.setTimeout(() => setTitleLen((n) => n + 1), 28 / speedRef.current);
    return () => clearTimeout(t);
  }, [titleLen, title.length]);

  // kick-off
  useEffect(() => {
    sound.play('publish');
    fx.burstAt(fxEl('combo'), { count: 30, speed: 7 });
    timer.current = window.setTimeout(() => setIdx(0), 650 / speedRef.current);
    return () => window.clearTimeout(timer.current);
  }, []);

  // step driver
  useEffect(() => {
    if (idx < 0 || doneRef.current) return;
    if (idx >= steps.length) {
      runFinale();
      return;
    }
    const step = steps[idx];
    const el = sourceEl(step);
    bump(el, step.kind === 'xmult' ? 'fx-bump-big' : 'fx-bump');
    const t = stepText(step);
    if (step.kind !== 'info') popupAt(el, t.text, t.color, { size: t.size, kind: step.kind });

    switch (step.kind) {
      case 'combo':
        sound.play('whoosh');
        bump(fxEl('f-base'));
        bump(fxEl('f-mult'));
        break;
      case 'base':
        sound.play('base', idx % 14);
        bump(fxEl('f-base'));
        break;
      case 'mult':
        sound.play('mult', idx % 14);
        bump(fxEl('f-mult'));
        break;
      case 'xmult': {
        const lg = Math.log2(Math.max(1.01, step.amount));
        sound.play('xmult', Math.floor(chain / 2 + lg * 2));
        bump(fxEl('f-mult'), 'fx-bump-big');
        fx.burstAt(el, { count: 12 + lg * 10, speed: 5 + lg * 2, colors: ['#ffe14d', '#ff3ea5', '#ffffff'] });
        fx.burstAt(fxEl('f-mult'), { count: 10 + lg * 6, speed: 4 });
        fx.shake(2 + lg * 2.5, 220);
        pushDan(`${step.label} ×${formatMult(step.amount)}`, '#ffe14d', step.amount >= 3);
        break;
      }
      case 'xbase':
        sound.play(step.amount < 1 ? 'debuff' : 'mult');
        bump(fxEl('f-base'));
        break;
      case 'retrigger':
        sound.play('retrigger');
        fx.ring(el ? el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2 : 0, el ? el.getBoundingClientRect().top + 40 : 0, '#39ff88', 50);
        pushDan(step.label, '#39ff88');
        break;
      case 'coins':
        sound.play('coin');
        bump(fxEl('coins'));
        break;
      case 'debuff':
        sound.play('debuff');
        fx.shake(4, 250);
        pushDan(step.label, '#ff3355', true);
        break;
      default:
        break;
    }
    if (step.kind === 'mult' || step.kind === 'xmult' || step.kind === 'retrigger') setChain((c) => c + 1);
    if (step.source.type === 'artifact' && step.kind !== 'xmult') pushDan(step.label, '#ff7ac8');
    if (Math.random() < 0.25 + milestoneTier(step.score) * 0.08) pushDan(AUDIENCE[Math.floor(Math.random() * AUDIENCE.length)], '#ffffff');

    // milestone crossing mid-sequence
    const tier = milestoneTier(step.score);
    if (tier > tierShown.current) {
      tierShown.current = tier;
      const m = MILESTONES.find((x) => x.tier === tier)!;
      setBanner({ text: m.name, tier, key: idx });
      sound.play('milestone', tier);
      fx.shake(4 + tier * 2, 400);
      if (tier >= 2) fx.confetti(30 * tier);
    }

    const base = 520 / speedRef.current;
    let delay = Math.max(60 / speedRef.current, base * Math.pow(0.93, idx));
    if (step.kind === 'xmult') delay += 160 / speedRef.current;
    if (step.kind === 'combo') delay += 250 / speedRef.current;
    timer.current = window.setTimeout(() => setIdx((i) => i + 1), delay);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const runFinale = () => {
    setFinale(true);
    const final = last.result.score;
    const tier = milestoneTier(final);
    const el = fxEl('f-score');
    bump(el, 'fx-bump-big');
    fx.burstAt(el, { count: 40 + tier * 40, speed: 8 + tier * 2 });
    fx.shake(3 + tier * 3, 350 + tier * 100);
    if (tier >= 1) {
      const m = MILESTONES.find((x) => x.tier === tier)!;
      setBanner({ text: m.name + '！', tier, key: 9999 });
      sound.play('milestone', tier);
      if (tier >= 2) fx.confetti(60 * tier);
    } else sound.play('coin');
    timer.current = window.setTimeout(finish, (900 + tier * 250) / speedRef.current);
  };

  // keyboard: space = speed up, again = skip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (boost < 4) setBoost((b) => b * 2);
        else finish();
      } else if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [boost, finish]);

  const cur = idx >= 0 ? steps[Math.min(idx, steps.length - 1)] : null;
  const shownBase = finale ? last.result.base : cur?.base ?? 0;
  const shownMult = finale ? last.result.mult : cur?.mult ?? 0;
  const shownScore = finale ? last.result.score : cur?.score ?? 0;
  const tierNow = milestoneTier(shownScore);

  return (
    <div className="scoring">
      <VideoFrame
        mode="scoring"
        title={
          <>
            《{title.slice(0, titleLen)}
            {titleLen < title.length && <span className="caret">▌</span>}》
          </>
        }
        comboName={last.result.comboName}
        base={shownBase}
        mult={shownMult}
        score={shownScore}
        scoreLabel="播放量"
        cards={cards}
        throttled={throttled}
        banner={banner}
        danmaku={danmaku}
        comboCount={chain}
        slam={finale}
        tier={tierNow}
        rollMs={Math.max(80, 260 / speed)}
      />
      <div className="scoring-ctrl">
        <Button size="sm" variant="ghost" silent onClick={() => setBoost((b) => (b >= 4 ? 1 : b * 2))}>
          加速 {speed}×
        </Button>
        <Button size="sm" variant="yellow" silent onClick={finish}>
          跳过 ▶▶
        </Button>
      </div>
      {cur && cur.kind !== 'combo' && !finale && (
        <div className="step-ticker" key={idx}>
          <span>{cur.label}</span>
        </div>
      )}
      {finale && <div className="final-flash" style={{ ['--c' as string]: NEON[tierNow % 4] }} />}
    </div>
  );
}
