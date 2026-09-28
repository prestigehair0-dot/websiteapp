// Ported from ui_kits/mobile/components/FirstRunOnboarding.jsx (StepFocus).
import React, { useState } from 'react';
import { View } from 'react-native';
import { OnbFrame } from './OnbFrame';
import { Q, Sub, NodePill } from '../../components/atoms';
import { FieldCanvas } from '../../components/FieldCanvas';
import { NODES, NodeId } from '../../data/nodes';
import { Store } from '../../lib/store';

export function StepFocus({
  store,
  onAdvance,
  reduceMotion,
}: {
  store: Store;
  onAdvance: (fn: (s: Store) => Store) => void;
  reduceMotion: boolean;
}) {
  const [sel, setSel] = useState<NodeId[]>(store.answers.focus_nodes ?? []);
  const toggle = (id: NodeId) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));
  const save = () =>
    onAdvance((s) => ({
      ...s,
      answers: { ...s.answers, focus_nodes: sel },
      goals: sel.length === 1 ? s.goals.map((g) => ({ ...g, node: sel[0] })) : s.goals,
    }));
  return (
    <OnbFrame step="focus" primary="CONTINUE" onPrimary={save} onSkip={() => onAdvance((s) => s)}>
      <Q>Where does your attention go?</Q>
      <Sub>Choose up to three. This only tunes what we surface first — nothing is fixed.</Sub>
      <View style={{ height: 160, marginHorizontal: -28, marginTop: 8, alignItems: 'center' }}>
        <FieldCanvas mode="idle" height={160} highlight={sel} reduceMotion={reduceMotion} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {NODES.map((n) => (
          <View key={n.id} style={{ width: '31%' }}>
            <NodePill node={n.id} selected={sel.includes(n.id)} onPress={() => toggle(n.id)} />
          </View>
        ))}
      </View>
    </OnbFrame>
  );
}
