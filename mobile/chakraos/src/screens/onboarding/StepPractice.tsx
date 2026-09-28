// Ported from ui_kits/mobile/components/FirstRunOnboarding.jsx (StepPractice).
import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { OnbFrame } from './OnbFrame';
import { Q, ConsentRow, FR } from '../../components/atoms';
import { NODE } from '../../data/nodes';
import { Store } from '../../lib/store';
import { font } from '../../theme/tokens';

const DURATIONS = [2, 5, 12, 20];
const MODALITIES: [string, string?][] = [
  ['Sound sessions'],
  ['Breathwork'],
  ['Mudra (camera)', 'CAMERA · ON-DEVICE ONLY'],
  ['Meditation'],
];

export function StepPractice({ store, onAdvance }: { store: Store; onAdvance: (fn: (s: Store) => Store) => void }) {
  const p = store.answers.practice ?? {};
  const [dur, setDur] = useState<number>(p.duration_min ?? 5);
  const [mods, setMods] = useState<string[]>(p.modalities ?? []);
  const [nudge, setNudge] = useState(!!p.reminder_at);
  const [time, setTime] = useState(p.reminder_at ?? '08:30');
  const [perm, setPerm] = useState(false);
  const toggleMod = (m: string) => setMods((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
  const persist = () => {
    setPerm(false);
    onAdvance((s) => ({
      ...s,
      answers: { ...s.answers, practice: { duration_min: dur, modalities: mods, reminder_at: nudge ? time : undefined } },
    }));
  };
  const cont = () => (nudge ? setPerm(true) : persist());
  const c = NODE.throat.color;

  return (
    <OnbFrame step="practice" primary="CONTINUE" onPrimary={cont} onSkip={() => onAdvance((s) => s)}>
      <Q>How do you like to practise?</Q>
      <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: FR.hair, marginTop: 28 }}>
        {DURATIONS.map((d, i) => (
          <Pressable
            key={d}
            onPress={() => setDur(d)}
            style={{
              flex: 1,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: dur === d ? `${c}24` : 'transparent',
              borderLeftWidth: i !== 0 ? 1 : 0,
              borderLeftColor: FR.hair,
            }}
          >
            <Text style={{ color: dur === d ? c : FR.textDim, fontFamily: font.mono, fontSize: 11, letterSpacing: 1.3 }}>
              {d} MIN
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        {MODALITIES.map(([m, sub]) => (
          <ConsentRow key={m} label={m} sub={sub} color={c} checked={mods.includes(m)} onChange={() => toggleMod(m)} />
        ))}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: FR.hair,
          }}
        >
          <Pressable
            onPress={() => setNudge(!nudge)}
            style={{
              width: 16,
              height: 16,
              borderWidth: 1,
              borderColor: nudge ? c : FR.hairStrong,
              backgroundColor: nudge ? c : 'transparent',
            }}
          />
          <Pressable onPress={() => setNudge(!nudge)} style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.ui, fontSize: 14, color: FR.text }}>Daily nudge</Text>
          </Pressable>
          <TextInput
            value={time}
            onChangeText={setTime}
            editable={nudge}
            placeholder="08:30"
            placeholderTextColor={FR.ghost}
            style={{ color: nudge ? FR.text : FR.ghost, fontFamily: font.mono, fontSize: 13, width: 60, textAlign: 'right' }}
          />
        </View>
      </View>

      <Modal visible={perm} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 270, backgroundColor: '#1C1C1E', borderRadius: 14, overflow: 'hidden' }}>
            <View style={{ padding: 16, paddingTop: 20 }}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 17, textAlign: 'center' }}>
                &quot;chakraOS&quot; Would Like to Send You Notifications
              </Text>
              <Text style={{ color: '#ccc', fontSize: 13, marginTop: 6, textAlign: 'center' }}>
                One daily nudge at {time}. Nothing else.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#333' }}>
              <Pressable
                onPress={persist}
                style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#333' }}
              >
                <Text style={{ color: '#0A84FF', fontSize: 17 }}>Don&apos;t Allow</Text>
              </Pressable>
              <Pressable onPress={persist} style={{ flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#0A84FF', fontSize: 17, fontWeight: '600' }}>Allow</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </OnbFrame>
  );
}
