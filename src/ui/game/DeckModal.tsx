import { TAG_DEFS } from '../../data/tags';
import { TAGS, type RunState } from '../../engine/types';
import { ContentCard } from '../components/ContentCard';
import { Modal } from '../components/Modal';

interface Props {
  run: RunState;
  onClose: () => void;
  onPick?: (uid: string) => void;
  title?: string;
}

export function DeckModal({ run, onClose, onPick, title }: Props) {
  const inHand = new Set(run.hand);
  const inDiscard = new Set(run.discardPile);
  const showLoc = !onPick && (run.phase === 'playing' || run.phase === 'result');
  return (
    <Modal title={title ?? `卡组 · ${run.deck.length} 张`} onClose={onClose} wide>
      {showLoc && (
        <p className="t-muted">
          牌库剩余 {run.drawPile.length} 张 · 手牌 {run.hand.length} 张 · 弃牌堆 {run.discardPile.length} 张。牌库耗尽时弃牌堆会重新洗入。
        </p>
      )}
      {onPick && <p className="t-yellow">点击一张卡牌将它永久删除（卡组越精简，越容易抽到想要的组合）。</p>}
      <div className="deck-groups">
        {TAGS.map((t) => {
          const cards = run.deck.filter((c) => c.tag === t).sort((a, b) => b.base - a.base);
          if (!cards.length) return null;
          return (
            <div key={t} className="deck-group">
              <div className="deck-group-head" style={{ color: TAG_DEFS[t].color }}>
                {TAG_DEFS[t].name} · {cards.length}
              </div>
              <div className="deck-cards">
                {cards.map((c) => (
                  <div key={c.uid} className={`deck-card ${showLoc && (inHand.has(c.uid) || inDiscard.has(c.uid)) ? 'used' : ''}`}>
                    <ContentCard card={c} small fxKey={false} onClick={onPick ? () => onPick(c.uid) : undefined} />
                    {showLoc && inHand.has(c.uid) && <span className="loc">手牌</span>}
                    {showLoc && inDiscard.has(c.uid) && <span className="loc">已用</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
