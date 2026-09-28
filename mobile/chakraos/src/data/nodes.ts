// The nine chakra nodes — ported from ui_kits/mobile/components/FirstRunShared.jsx

export type NodeId =
  | 'soul' | 'crown' | 'third_eye' | 'throat' | 'heart'
  | 'solar' | 'sacral' | 'root' | 'earth';

export interface ChakraNode {
  id: NodeId;
  name: string;
  bija: string;
  hz: number;
  color: string;
  assoc: string;
}

export const NODES: ChakraNode[] = [
  { id: 'soul', name: 'Soul', bija: 'AUM', hz: 1074, color: '#E0E7FF', assoc: 'beyond' },
  { id: 'crown', name: 'Crown', bija: 'AH', hz: 963, color: '#A855F7', assoc: 'unity' },
  { id: 'third_eye', name: 'Third eye', bija: 'OM', hz: 852, color: '#6366F1', assoc: 'intuition' },
  { id: 'throat', name: 'Throat', bija: 'HAM', hz: 741, color: '#22D3EE', assoc: 'expression' },
  { id: 'heart', name: 'Heart', bija: 'YAM', hz: 639, color: '#4ADE80', assoc: 'connection' },
  { id: 'solar', name: 'Solar', bija: 'RAM', hz: 528, color: '#FBBF24', assoc: 'identity' },
  { id: 'sacral', name: 'Sacral', bija: 'VAM', hz: 417, color: '#FB923C', assoc: 'creativity' },
  { id: 'root', name: 'Root', bija: 'LAM', hz: 396, color: '#F43F5E', assoc: 'safety' },
  { id: 'earth', name: 'Earth', bija: 'LAṂ', hz: 68, color: '#A0522D', assoc: 'grounding' },
];

export const NODE: Record<NodeId, ChakraNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n])
) as Record<NodeId, ChakraNode>;

export type OnboardingStep = 'intention' | 'focus' | 'practice' | 'consent' | 'first-entry';

export const STEPS: OnboardingStep[] = ['intention', 'focus', 'practice', 'consent', 'first-entry'];

export const STEP_NODE: Record<OnboardingStep, NodeId> = {
  intention: 'crown',
  focus: 'third_eye',
  practice: 'throat',
  consent: 'heart',
  'first-entry': 'root',
};

export type TabId = 'body' | 'journal' | 'coach' | 'sound' | 'you';

export const TAB_NODE: Record<TabId, NodeId> = {
  body: 'heart',
  journal: 'throat',
  coach: 'third_eye',
  sound: 'crown',
  you: 'soul',
};

export const CRISIS_RESOURCES: Record<string, string> = {
  UK: "If you're ever in immediate danger, contact local emergency services. In the UK: Samaritans 116 123.",
  US: "If you're ever in immediate danger, contact local emergency services. In the US: call or text 988.",
  default: "If you're ever in immediate danger, contact local emergency services.",
};

// Mudra practice — production ships photographed hand mudras per node
// (design system `mudras/*.png`, > 256KB each). Those binaries could not be
// pulled through this session's design-import tool (256KB read cap), so the
// mudra screen renders a chakra-colored sign in their place. Drop the real
// photos into assets/mudras/<key>.png and swap the placeholder in
// screens/tabs/YouTab.tsx when available.
export const MUDRA: Record<NodeId, string> = {
  root: 'root',
  sacral: 'sacral',
  solar: 'solar',
  heart: 'heart',
  throat: 'throat',
  third_eye: 'third-eye',
  crown: 'crown',
  soul: 'absolute',
  earth: 'bhumi',
};
