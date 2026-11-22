import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/base.css';
import './styles/components.css';
import './styles/game.css';
import './styles/screens.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.DEV) {
  // dev-only helpers for testing builds from the console: __vk.grant('matrix'), __vk.coins(99)
  void Promise.all([import('./state/store'), import('./engine/game')]).then(([{ store }, game]) => {
    (window as unknown as Record<string, unknown>).__vk = {
      store,
      grant: (id: string) => store.act((s) => game.grantArtifact(s, id)),
      coins: (n: number) => store.act((s) => ({ ...s, coins: n })),
      fans: (n: number) => store.act((s) => ({ ...s, fans: n })),
    };
  });
}
