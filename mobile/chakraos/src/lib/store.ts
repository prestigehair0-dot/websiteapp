// Resume-safe persistence + rule-based journal classifier + field-state engine.
// Ported from ui_kits/mobile/components/FirstRunShared.jsx (localStorage -> AsyncStorage).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NODES, NodeId, OnboardingStep, STEPS } from '../data/nodes';

export interface Session {
  provider: 'apple' | 'google' | 'email';
  at: number;
}

export interface Profile {
  onboarded: boolean;
  onboarding_step: OnboardingStep | null;
  timezone?: string;
  memory_consent: boolean;
}

export interface Entry {
  id: string;
  text: string;
  date: string;
  queued: boolean;
}

export interface Signal {
  id: string;
  entry: string;
  node: NodeId;
  weight: number;
  quote: string;
  date: string;
  source: 'claude' | 'rules';
}

export interface FieldNode {
  energy: number;
  trend: number;
  drivers: { id: string; date: string; quote: string; weight: number }[];
}

export interface FieldState {
  version: number;
  computed_at: string;
  nodes: Record<NodeId, FieldNode>;
}

export interface Goal {
  text: string;
  active: boolean;
  node: NodeId | null;
}

export interface CoachMessage {
  role: 'you' | 'coach';
  text: string;
  t: number;
  agent?: string;
}

export interface PracticeSession {
  kind: string;
  sec: number;
  at: number;
}

export interface Prefs {
  reduceMotion: boolean;
  offline: boolean;
  locale?: string;
}

export type Plan = 'free' | 'trial' | 'monthly' | null;

export interface Store {
  session: Session | null;
  profile: Profile | null;
  answers: Record<string, any>;
  goals: Goal[];
  entries: Entry[];
  signals: Signal[];
  field_state: FieldState | null;
  prefs: Prefs;
  coach: CoachMessage[];
  sessions: PracticeSession[];
  plan: Plan;
  lastSource?: 'claude' | 'rules';
}

const STORE_KEY = 'chakraos.firstrun.v1';

export const emptyStore = (): Store => ({
  session: null,
  profile: null,
  answers: {},
  goals: [],
  entries: [],
  signals: [],
  field_state: null,
  prefs: { reduceMotion: false, offline: false },
  coach: [],
  sessions: [],
  plan: null,
});

export function emptyStoreKeepPrefs(s: Store): Store {
  return { ...emptyStore(), prefs: s.prefs };
}

export async function loadStore(): Promise<Store> {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    return { ...emptyStore(), ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return emptyStore();
  }
}

export async function saveStore(s: Store): Promise<Store> {
  try {
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    // best-effort persistence
  }
  return s;
}

export type Gate =
  | { group: 'auth'; screen: 'splash' | 'welcome' | 'signin' | 'verify' }
  | { group: 'onboarding'; screen: OnboardingStep }
  | { group: 'paywall'; screen: 'access' }
  | { group: 'tabs'; screen: 'body' };

export function gate(s: Store): Gate {
  if (!s.session) return { group: 'auth', screen: 'splash' };
  if (!s.profile?.onboarded) {
    return { group: 'onboarding', screen: s.profile?.onboarding_step ?? 'intention' };
  }
  if (!s.plan) return { group: 'paywall', screen: 'access' };
  return { group: 'tabs', screen: 'body' };
}

// ── rule classifier (fallback for the real journal_analyze agent) ────
const RULES: Record<NodeId, string[]> = {
  heart: ['held', 'love', 'warm', 'grateful', 'close', 'tender', 'connect', 'kind', 'friend', 'hug'],
  root: ['safe', 'tired', 'money', 'anxious', 'ground', 'secure', 'exhaust', 'scared', 'rent', 'sleep'],
  throat: ['said', 'speak', 'spoke', 'voice', 'honest', 'told', 'silence', 'express', 'sing', 'write'],
  third_eye: ['clear', 'saw', 'insight', 'dream', 'notice', 'think', 'fog', 'scatter', 'focus', 'idea'],
  solar: ['confident', 'strong', 'angry', 'power', 'will', 'decid', 'doubt', 'work', 'push'],
  sacral: ['creat', 'made', 'play', 'desire', 'flow', 'enjoy', 'feel', 'move', 'dance'],
  crown: ['quiet', 'still', 'meditat', 'peace', 'spirit', 'wonder', 'pray'],
  soul: ['vast', 'infinite', 'beyond', 'awe', 'whole'],
  earth: ['walk', 'nature', 'earth', 'tree', 'root', 'body', 'garden', 'soil'],
};

export function ruleClassify(text: string): { node: NodeId; weight: number }[] {
  const t = text.toLowerCase();
  const hits: { node: NodeId; weight: number }[] = [];
  for (const node of Object.keys(RULES) as NodeId[]) {
    const words = RULES[node];
    const n = words.filter((w) => t.includes(w)).length;
    if (n) hits.push({ node, weight: Math.min(1, 0.4 + n * 0.3) });
  }
  if (!hits.length) hits.push({ node: 'throat', weight: 0.35 }); // you spoke
  return hits;
}

export function fieldRecompute(prev: FieldState | null, signals: Signal[]): FieldState {
  const nodes = {} as Record<NodeId, FieldNode>;
  for (const n of NODES) nodes[n.id] = { energy: 50, trend: 0, drivers: [] };
  if (prev) {
    for (const id of Object.keys(prev.nodes) as NodeId[]) {
      nodes[id] = { ...prev.nodes[id], drivers: [...prev.nodes[id].drivers] };
    }
  }
  for (const sig of signals) {
    const n = nodes[sig.node];
    const before = n.energy;
    n.energy = Math.round(Math.min(96, n.energy + sig.weight * 14));
    n.trend = Math.sign(n.energy - before);
    n.drivers.unshift({ id: sig.id, date: sig.date, quote: sig.quote, weight: sig.weight });
    n.drivers = n.drivers.slice(0, 4);
  }
  return { version: 1, computed_at: new Date().toISOString(), nodes };
}

export function submitEntry(store: Store, text: string, nodeHint?: NodeId): Store {
  const id = 'e' + Date.now();
  const date = new Date().toISOString().slice(0, 10);
  const source: 'claude' | 'rules' = store.prefs.offline ? 'rules' : 'claude';
  const sigs: Signal[] = ruleClassify(text).map((h, i) => ({
    id: id + '.' + i,
    entry: id,
    node: nodeHint && i === 0 ? nodeHint : h.node,
    weight: h.weight,
    quote: text,
    date,
    source,
  }));
  const field_state = fieldRecompute(store.field_state, sigs);
  return {
    ...store,
    entries: [{ id, text, date, queued: store.prefs.offline }, ...store.entries],
    signals: [...sigs, ...store.signals],
    field_state,
    lastSource: source,
  };
}

export function dominant(f: FieldState | null | undefined): NodeId | null {
  if (!f) return null;
  return (Object.entries(f.nodes).sort((a, b) => b[1].energy - a[1].energy)[0][0]) as NodeId;
}

export const fmtTime = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  return d.toTimeString().slice(0, 5);
};
export const pad3 = (n: number) => String(n).padStart(3, '0');

export function advanceOnboarding(s: Store): Store {
  const i = STEPS.indexOf(s.profile!.onboarding_step as OnboardingStep);
  return { ...s, profile: { ...s.profile!, onboarding_step: STEPS[i + 1] ?? null } };
}

/** Loads the persisted store once, exposes it plus a setter that also persists. */
export function useChakraStore() {
  const [store, setStoreState] = useState<Store | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    loadStore().then(setStoreState);
  }, []);

  const setStore = useCallback((fn: Store | ((s: Store) => Store)) => {
    setStoreState((prev) => {
      const base = prev ?? emptyStore();
      const next = typeof fn === 'function' ? (fn as (s: Store) => Store)(base) : fn;
      saveStore(next);
      return next;
    });
  }, []);

  return { store, setStore, ready: store !== null };
}
