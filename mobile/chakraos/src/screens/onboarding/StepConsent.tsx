// Ported from ui_kits/mobile/components/FirstRunOnboarding.jsx (StepConsent).
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { OnbFrame } from './OnbFrame';
import { MonoLabel, ConsentRow, FR } from '../../components/atoms';
import { NODE, CRISIS_RESOURCES } from '../../data/nodes';
import { Store } from '../../lib/store';
import { font } from '../../theme/tokens';

export function StepConsent({
  store,
  onAdvance,
  locale = 'UK',
}: {
  store: Store;
  onAdvance: (fn: (s: Store) => Store) => void;
  locale?: string;
}) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(store.profile?.memory_consent ?? true);
  const [c, setC] = useState(false);
  const col = NODE.heart.color;
  const save = () =>
    onAdvance((s) => ({
      ...s,
      profile: { ...s.profile!, memory_consent: b },
      answers: { ...s.answers, consent: { non_medical_ack_at: new Date().toISOString(), keep_audio: c } },
    }));

  return (
    <OnbFrame step="consent" primary="CONTINUE" onPrimary={save} disabled={!a}>
      <MonoLabel>BEFORE WE BEGIN</MonoLabel>
      <Text style={{ marginTop: 14, fontFamily: font.ui, fontSize: 15, lineHeight: 23, color: FR.text }}>
        chakraOS is a reflective wellness tool. It is not a medical, psychological or diagnostic service and does not
        replace professional care. Node energy, frequencies and palm/mudra readouts are a traditional lens, not
        measurements.
      </Text>
      <View style={{ marginTop: 20 }}>
        <ConsentRow required checked={a} onChange={setA} color={col} label="I understand chakraOS is non-medical." />
        <ConsentRow
          checked={b}
          onChange={setB}
          color={col}
          label="Remember what I write so reflections can refer back to it."
          sub="YOU CAN EDIT OR FORGET ANY MEMORY IN YOU → MEMORY"
        />
        <ConsentRow checked={c} onChange={setC} color={col} label="Keep voice recordings after transcription." />
      </View>
      <View style={{ flex: 1 }} />
      <Text style={{ fontFamily: font.ui, fontSize: 13, lineHeight: 20, color: FR.textDim }}>
        {CRISIS_RESOURCES[locale] ?? CRISIS_RESOURCES.default}
      </Text>
      <MonoLabel size={10} color={FR.ghost} style={{ marginTop: 14 }}>PRIVACY · TERMS</MonoLabel>
    </OnbFrame>
  );
}
