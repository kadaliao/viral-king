import { useState } from 'react';
import { ARTIFACTS, RARITY_INFO } from '../../data/artifacts';
import { BALANCE, FAN_LEVELS } from '../../data/balance';
import { BOSSES } from '../../data/bosses';
import { COMBOS } from '../../data/combos';
import { EDITION_DEFS, TAG_DEFS } from '../../data/tags';
import { formatNum } from '../../engine/num';
import { TAGS } from '../../engine/types';
import { store } from '../../state/store';
import { ArtifactCard } from '../components/ArtifactCard';
import { Button } from '../components/Button';
import { Sprite } from '../components/Sprite';

const TABS = ['玩法', '视频类型', '流量神器', 'Boss', '标签与属性'] as const;
type TabName = (typeof TABS)[number];

export function ComboTable({ levels }: { levels?: Record<string, number> }) {
  return (
    <table className="combo-table">
      <thead>
        <tr>
          <th>视频类型</th>
          <th>条件</th>
          <th className="t-base">基础</th>
          <th className="t-mult">倍率</th>
        </tr>
      </thead>
      <tbody>
        {COMBOS.map((c) => {
          const lv = levels?.[c.id] ?? 0;
          return (
            <tr key={c.id} className={`fam-${c.family}`}>
              <td>
                {c.name}
                {lv > 0 && <span className="lv-badge">Lv.{lv + 1}</span>}
              </td>
              <td className="t-muted">{c.req}</td>
              <td className="t-base">{c.base + c.lvBase * lv}</td>
              <td className="t-mult">×{c.mult + c.lvMult * lv}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function HelpContent() {
  const [tab, setTab] = useState<TabName>('玩法');
  return (
    <div className="help">
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="help-body">
        {tab === '玩法' && (
          <div className="help-rules">
            <h3 className="t-pink">三分钟上手</h3>
            <ol>
              <li>
                每关有一个<b className="t-yellow">播放量 KPI</b>。你有 <b>{BALANCE.publishesPerStage}</b> 次发布机会、
                <b>{BALANCE.discardsPerStage}</b> 次换牌机会。
              </li>
              <li>
                手里有 {BALANCE.handSize} 张内容卡。<b>点击选择最多 5 张</b>，点击顺序就是视频里的出场顺序。
              </li>
              <li>
                不同标签组合成不同<b className="t-cyan">视频类型</b>，决定初始的基础流量和倍率。
              </li>
              <li>
                点击<b className="t-pink">「发布视频」</b>：
                <span className="t-base">基础流量</span> × <span className="t-mult">倍率</span> = <span className="t-score">播放量</span>。
              </li>
              <li>累计播放量达到 KPI 即通关，拿金币去商店买<b className="t-green">流量神器</b>、升级视频类型、调整卡组。</li>
              <li>第 3、6、9 关是 Boss，会改变规则。第 9 关通关即成为「流量之王」。</li>
            </ol>
            <h3 className="t-pink">结算顺序（确定性）</h3>
            <ol>
              <li>视频类型给出初始基础流量与倍率；粉丝提供初始曝光（基础 +√粉丝）。</li>
              <li>内容卡从左到右依次计分；每张卡计分后，神器栏从左到右对它做出反应。重复触发会让整张卡再结算一次。</li>
              <li>所有卡计分完毕后，神器栏从左到右触发各自的独立效果。</li>
              <li>最后结算 Boss 惩罚。<b>×N 是真正的连乘</b>，所以神器的摆放顺序很重要：先加后乘收益更大。</li>
            </ol>
            <h3 className="t-pink">粉丝</h3>
            <p>
              每条视频带来粉丝（≈ 播放量^{BALANCE.fanExp}），跨关保留。粉丝提供初始曝光、每关「商单」金币、
              激活部分神器、解锁传说神器（腰部达人起）和「宠粉直播」视频类型。
            </p>
            <div className="fan-levels">
              {FAN_LEVELS.map((f, i) => (
                <span key={f.name} className="fan-level">
                  Lv{i} {f.name} <small className="t-muted">≥{formatNum(f.min)}</small>
                </span>
              ))}
            </div>
            <h3 className="t-pink">快捷键</h3>
            <p className="t-muted">数字键 1–8 选牌 · Enter 发布 · D 换牌 · 结算中按空格加速/跳过</p>
          </div>
        )}
        {tab === '视频类型' && (
          <>
            <p className="t-muted">自动选择当前选中卡牌能组成的最高价值视频类型。被 Boss 限流的卡牌不参与组合。</p>
            <ComboTable />
          </>
        )}
        {tab === '流量神器' && (
          <div className="art-grid">
            {ARTIFACTS.map((a) => (
              <div key={a.id} className="art-entry">
                <ArtifactCard id={a.id} small />
                <div>
                  <div style={{ color: RARITY_INFO[a.rarity].color }}>
                    {a.name} <small>{RARITY_INFO[a.rarity].name} · ${a.price}</small>
                  </div>
                  <div>{a.desc}</div>
                  <div className="t-muted">“{a.flavor}”</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'Boss' && (
          <div className="boss-list">
            {BOSSES.map((b) => (
              <div key={b.id} className="boss-entry panel notch">
                <Sprite id={b.art} scale={3} />
                <div>
                  <div className="big t-red">{b.name}</div>
                  <div>{b.rule}</div>
                  <div className="t-green">攻略：{b.tip}</div>
                </div>
              </div>
            ))}
            <p className="t-muted">每局从 5 个 Boss 中随机抽 3 个，分别出现在第 3、6、9 关。商店里能提前看到下一个 Boss。</p>
          </div>
        )}
        {tab === '标签与属性' && (
          <div className="tag-list">
            {TAGS.map((t) => (
              <div key={t} className="tag-entry">
                <Sprite id={TAG_DEFS[t].icon} scale={3} />
                <b style={{ color: TAG_DEFS[t].color }}>{TAG_DEFS[t].name}</b>
                <span className="t-muted">{TAG_DEFS[t].role}</span>
              </div>
            ))}
            <h3 className="t-pink">卡牌属性（商店的精品内容）</h3>
            {Object.values(EDITION_DEFS).map((e) => (
              <div key={e.id} className="tag-entry">
                <span className="edition-chip" style={{ background: e.color }}>
                  {e.name}
                </span>
                <span>{e.desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HelpScreen() {
  return (
    <div className="help-screen screen-fade">
      <div className="help-head">
        <h2 className="huge glow-pink">游戏说明</h2>
        <Button variant="ghost" onClick={() => store.setScreen('menu')}>
          返回
        </Button>
      </div>
      <div className="panel notch help-panel">
        <HelpContent />
      </div>
    </div>
  );
}
