import { NodeId } from './nodes';

// Frequency library metadata — ported from ui_kits/mobile/components/FirstRunTabs.jsx.
//
// The source .wav files live in the design system's `uploads/` folder. They
// exceed this session's 256KB per-file design-import cap, so audio bytes are
// not bundled here. `source` is left null; SoundTab renders and filters the
// full catalog, and `useNowPlaying` no-ops instead of throwing when a sound
// has no local asset. Add real files under assets/sounds/<id>.wav and wire
// them into SOUND_ASSETS to enable playback.
export interface SoundFile {
  id: string;
  hz: number;
  node: NodeId;
  kind: string;
  filename: string;
}

const SOUND_FILE_NAMES = [
  '256.87_Hz_Root-Chakra_Singing-Bowl',
  '256_Hz_Root-Chakra_Tuning-Fork',
  '288.33_Hz_Sacral-Chakra_Singing-Bowl',
  '288_Hz_Sacral-Chakra_Pythagorean',
  '320_Hz_Solar-Plexus-Chakra_Tuning-Fork',
  '323.63_Hz_Solar-Plexus-Chakra_Singing-Bowl',
  '324_Hz_Solar-Plexus-Chakra_Pythagorean',
  '341.3_Hz_Heart-Chakra_Tuning-Fork',
  '342.88_Hz_Heart-Chakra_Singing-Bowl',
  '384.87_Hz_Throat-Chakra_Singing-Bowl',
  '384_Hz_Throat-Chakra_Tuning-Fork',
  '396_Hz_Root-Chakra_Solfeggio',
  '417_Hz_Sacral-Chakra_Solfeggio',
  '426.6_Hz_Third-Eye-Chakra_Tuning-Fork',
  '432_Hz_Heart-Chakra_Pythagorean',
  '432_Hz_Third-Eye-Chakra_Singing-Bowl',
  '480_Hz_Crown-Chakra_Tuning-Fork',
  '484.9_Hz_Crown-Chakra_Singing-Bowl',
  '486_Hz_Throat-Chakra_Pythagorean',
  '528_Hz_Solar-Plexus-Chakra_Solfeggio',
  '639_Hz_Heart-Chakra_Solfeggio',
  '648_Hz_Third-Eye-Chakra_Pythagorean',
  '741_Hz_Throat-Chakra_Solfeggio',
  '852_Hz_Third-Eye-Chakra_Solfeggio',
  '864_Hz_Crown-Chakra_Pythagorean',
  '963_Hz_Crown-Chakra_Solfeggio',
];

const SOUND_NODE_MAP: Record<string, NodeId> = {
  Root: 'root',
  Sacral: 'sacral',
  'Solar-Plexus': 'solar',
  Heart: 'heart',
  Throat: 'throat',
  'Third-Eye': 'third_eye',
  Crown: 'crown',
};

function parseSoundFile(name: string): SoundFile {
  const m = name.match(/^([\d.]+)_Hz_(.+?)-Chakra_(.+)$/);
  if (!m) throw new Error(`Unrecognized sound filename: ${name}`);
  return {
    id: name,
    hz: parseFloat(m[1]),
    node: SOUND_NODE_MAP[m[2]],
    kind: m[3].replace('-', ' '),
    filename: `${name}_(www.7chakracolors.com).wav`,
  };
}

export const SOUNDS: SoundFile[] = SOUND_FILE_NAMES.map(parseSoundFile).sort((a, b) => a.hz - b.hz);

// Map of sound id -> bundled audio asset. Empty until real .wav files are
// added under assets/sounds/ (see module doc above).
export const SOUND_ASSETS: Partial<Record<string, number>> = {};
