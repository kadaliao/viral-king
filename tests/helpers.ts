import type { RunView } from '../src/engine/context';
import type { ArtifactInstance, Card, Edition, Tag } from '../src/engine/types';
import { ARTIFACT_MAP } from '../src/data/artifacts';
import { emptyCounts, scoreVideo } from '../src/engine/scoring';

let n = 0;
export function card(tag: Tag, base = 10, mult = 0, edition?: Edition): Card {
  return { uid: `t${++n}`, tag, name: `${tag}-${base}`, base, mult, edition, art: 'x' };
}
export function art(id: string, state?: Record<string, number>): ArtifactInstance {
  if (!ARTIFACT_MAP[id]) throw new Error('unknown artifact ' + id);
  return { uid: `a${++n}`, id, state: { ...(ARTIFACT_MAP[id].initialState ?? {}), ...(state ?? {}) } };
}
export function view(patch: Partial<RunView> = {}): RunView {
  return {
    fans: 0, fanLevel: 0, coins: 0, stage: 0, publishesLeft: 4, publishesUsed: 1, discardsLeft: 2,
    videosPublished: 0, lastComboId: null, bossId: null, preferredTag: null, fatigue: emptyCounts(), ...patch,
  };
}
export function score(played: Card[], artifacts: ArtifactInstance[] = [], v: Partial<RunView> = {}, levels: Record<string, number> = {}) {
  return scoreVideo({ played, held: [], artifacts, comboLevels: levels, run: view(v) });
}
