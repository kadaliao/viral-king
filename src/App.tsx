import { useEffect, useRef } from 'react';
import { sound } from './audio/sfx';
import { fx } from './fx/fx';
import { store, useApp } from './state/store';
import { FxLayer } from './ui/components/FxLayer';
import { Toasts } from './ui/components/Toasts';
import { GameScreen } from './ui/screens/GameScreen';
import { HelpScreen } from './ui/screens/HelpScreen';
import { MainMenu } from './ui/screens/MainMenu';
import { SettingsModal } from './ui/screens/SettingsModal';

export function App() {
  const screen = useApp((s) => s.screen);
  const crt = useApp((s) => s.settings.crt);
  const settingsOpen = useApp((s) => s.settingsOpen);
  const shakeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && shakeRef.current) fx.attach(canvasRef.current, shakeRef.current);
    const unlock = () => sound.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => fx.detach();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && store.get().settingsOpen) store.openSettings(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app">
      <div className="bg-layer" aria-hidden>
        <div className="bg-stars" />
        <div className="bg-grid" />
      </div>
      <div className="shake-root" ref={shakeRef}>
        {screen === 'menu' && <MainMenu />}
        {screen === 'help' && <HelpScreen />}
        {screen === 'game' && <GameScreen />}
      </div>
      <canvas className="fx-canvas" ref={canvasRef} aria-hidden />
      <FxLayer />
      <Toasts />
      {settingsOpen && <SettingsModal />}
      {crt && <div className="crt-overlay" aria-hidden />}
    </div>
  );
}
