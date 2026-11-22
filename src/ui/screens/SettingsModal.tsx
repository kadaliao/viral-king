import { store, useApp, type AnimSpeed } from '../../state/store';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="setting-row">
      <span>
        {label}
        {hint && <small className="t-muted"> {hint}</small>}
      </span>
      <button className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)} aria-pressed={value}>
        <span>{value ? 'ON' : 'OFF'}</span>
      </button>
    </label>
  );
}

export function SettingsModal() {
  const s = useApp((st) => st.settings);
  const inGame = useApp((st) => st.screen === 'game');
  const seed = useApp((st) => st.run?.seed);
  const set = store.updateSettings;
  return (
    <Modal title="设置" onClose={() => store.openSettings(false)}>
      <div className="settings">
        <Toggle label="音效" value={s.sound} onChange={(v) => set({ sound: v })} />
        <Toggle label="背景音乐" value={s.music} onChange={(v) => set({ music: v })} hint="8-bit 循环" />
        <label className="setting-row">
          <span>音量</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.volume}
            onChange={(e) => set({ volume: Number(e.target.value) })}
          />
        </label>
        <label className="setting-row">
          <span>结算动画速度</span>
          <span className="seg">
            {([1, 2, 4] as AnimSpeed[]).map((v) => (
              <button key={v} className={s.speed === v ? 'on' : ''} onClick={() => set({ speed: v })}>
                {v}×
              </button>
            ))}
          </span>
        </label>
        <Toggle label="屏幕震动" value={s.shake} onChange={(v) => set({ shake: v })} />
        <Toggle label="像素粒子" value={s.particles} onChange={(v) => set({ particles: v })} />
        <Toggle label="CRT 扫描线" value={s.crt} onChange={(v) => set({ crt: v })} />
        <div className="setting-row">
          <span>新手引导</span>
          <Button size="sm" variant="ghost" onClick={() => { store.resetTutorial(); store.toast('下次进入对局时重新显示引导', 'good'); }}>
            重新显示
          </Button>
        </div>
        {inGame && (
          <>
            <div className="setting-row">
              <span>
                本局种子 <b className="t-cyan">{seed}</b>
              </span>
              <Button size="sm" variant="ghost" onClick={() => { void navigator.clipboard?.writeText(seed ?? ''); store.toast('种子已复制', 'good'); }}>
                复制
              </Button>
            </div>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => { store.openSettings(false); store.setScreen('menu'); }}>
                返回主菜单（自动保存）
              </Button>
              <Button variant="red" onClick={() => { store.openSettings(false); store.abandonRun(); }}>
                放弃本局
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
