// Ported from ui_kits/mobile/components/FirstRunOnboarding.jsx (StepIntention).
import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { OnbFrame } from './OnbFrame';
import { Q, Sub, MonoLabel, FR } from '../../components/atoms';
import { Store, pad3 } from '../../lib/store';
import { font } from '../../theme/tokens';

export function StepIntention({ store, onAdvance }: { store: Store; onAdvance: (fn: (s: Store) => Store) => void }) {
  const [text, setText] = useState(store.answers.intention ?? '');
  const save = () =>
    onAdvance((s) => ({
      ...s,
      answers: { ...s.answers, intention: text },
      goals: text.trim() ? [...s.goals, { text: text.trim(), active: true, node: null }] : s.goals,
    }));
  return (
    <OnbFrame step="intention" primary="CONTINUE" onPrimary={save} disabled={!text.trim()} onSkip={() => onAdvance((s) => s)}>
      <Q>What brought you here?</Q>
      <Sub>One line is enough. You can change it any time.</Sub>
      <TextInput
        value={text}
        onChangeText={(t) => setText(t.slice(0, 140))}
        placeholder="to feel less scattered"
        placeholderTextColor={FR.ghost}
        multiline
        numberOfLines={4}
        style={{
          marginTop: 32,
          borderBottomWidth: 1,
          borderBottomColor: FR.hair,
          paddingBottom: 12,
          color: FR.text,
          fontFamily: font.journal,
          fontStyle: 'italic',
          fontSize: 20,
          lineHeight: 30,
          minHeight: 100,
          textAlignVertical: 'top',
        }}
      />
      <MonoLabel size={10} color={FR.ghost} style={{ marginTop: 10, textAlign: 'right' }}>
        {pad3(text.length)} / 140
      </MonoLabel>
    </OnbFrame>
  );
}
