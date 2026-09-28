// Ported from ui_kits/mobile/components/FirstRunOnboarding.jsx (StepFirstEntry).
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Screen, StepRail, MonoLabel, PrimaryAction, Q, FR } from '../../components/atoms';
import { FieldCanvas } from '../../components/FieldCanvas';
import { NODES } from '../../data/nodes';
import { Store, submitEntry, pad3 } from '../../lib/store';
import { font } from '../../theme/tokens';

export function StepFirstEntry({
  store,
  onCommit,
  onEnter,
  reduceMotion,
}: {
  store: Store;
  onCommit: (fn: (s: Store) => Store) => void;
  onEnter: () => void;
  reduceMotion: boolean;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const done = !!store.field_state;

  const submit = () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setTimeout(
      () => {
        onCommit((s) => submitEntry(s, text.trim()));
        setBusy(false);
      },
      store.prefs.offline ? 200 : 1100
    );
  };

  const moved = done ? NODES.filter((n) => store.field_state!.nodes[n.id].trend !== 0) : [];

  return (
    <Screen>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 118, opacity: 0.9 }}>
        <FieldCanvas mode="ignite" field={store.field_state} height={440} breathing={done} reduceMotion={reduceMotion} />
      </View>
      <View style={{ paddingHorizontal: 28, paddingTop: 64 }}>
        <StepRail step="first-entry" />
      </View>
      {!done ? (
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 28, paddingBottom: 28 }}>
          <Q>Write one sentence about right now.</Q>
          <TextInput
            value={text}
            onChangeText={(t) => setText(t.slice(0, 140))}
            onSubmitEditing={submit}
            placeholder="I felt held today"
            placeholderTextColor={FR.ghost}
            style={{
              marginTop: 24,
              borderBottomWidth: 1,
              borderBottomColor: FR.hairStrong,
              paddingVertical: 8,
              color: FR.text,
              fontFamily: font.journal,
              fontStyle: 'italic',
              fontSize: 20,
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <MonoLabel size={10} color={busy ? '#22D3EE' : FR.ghost}>
              {busy ? (store.prefs.offline ? 'QUEUED · RULES' : 'LISTENING') : ' '}
            </MonoLabel>
            <MonoLabel size={10} color={FR.ghost}>{pad3(text.length)} / 140</MonoLabel>
          </View>
          <PrimaryAction onPress={submit} disabled={!text.trim() || busy} style={{ marginTop: 20 }}>
            {busy ? '· · ·' : 'SUBMIT'}
          </PrimaryAction>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 28, paddingBottom: 28 }}>
          {store.lastSource === 'rules' && (
            <MonoLabel size={10} color="#FBBF24" style={{ marginBottom: 12 }}>
              {store.prefs.offline ? 'OFFLINE REFLECTION' : '(RULES)'}
            </MonoLabel>
          )}
          {moved.slice(0, 2).map((n) => (
            <View key={n.id} style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline', marginBottom: 6 }}>
              <MonoLabel size={10} color={n.color}>
                {n.name} {store.field_state!.nodes[n.id].energy} {store.field_state!.nodes[n.id].trend > 0 ? '▲' : '▼'} ·
              </MonoLabel>
              <Text
                numberOfLines={1}
                style={{ fontFamily: font.journal, fontStyle: 'italic', fontSize: 13, color: FR.textDim, flexShrink: 1 }}
              >
                &quot;{store.entries[0]?.text}&quot;
              </Text>
            </View>
          ))}
          <Text style={{ marginVertical: 18, fontFamily: font.ui, fontSize: 15, lineHeight: 23, color: FR.text }}>
            This is your field. It moves with what you notice — not with what&apos;s wrong.
          </Text>
          <PrimaryAction onPress={onEnter}>ENTER THE FIELD</PrimaryAction>
        </View>
      )}
    </Screen>
  );
}
