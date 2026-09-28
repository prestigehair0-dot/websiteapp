// Ported from ui_kits/mobile/components/FirstRunAuth.jsx (PaywallScreen).
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen, FR, MonoLabel, PrimaryAction, TextAction, Q, Sub } from '../components/atoms';
import { FieldCanvas } from '../components/FieldCanvas';
import { NODE } from '../data/nodes';
import { font } from '../theme/tokens';

type Plan = 'annual' | 'monthly';

const ROWS: [string, string][] = [
  ['All 26 sound sessions', 'Solfeggio · Pythagorean · bowls · forks'],
  ['Coach without a daily limit', 'Awareness · Memory · Frequency agents'],
  ['Breathwork and mudra practice', 'Camera stays on-device'],
  ['Declared memory', 'Edit or forget any memory in You'],
];

const PLANS: { id: Plan; label: string; price: string; note: string }[] = [
  { id: 'annual', label: 'ANNUAL', price: '£39.99 / yr', note: '7 DAYS FREE' },
  { id: 'monthly', label: 'MONTHLY', price: '£5.99 / mo', note: 'CANCEL ANY TIME' },
];

export function PaywallScreen({
  onTrial,
  onFree,
  onClose,
  dismissible = true,
}: {
  onTrial: (plan: Plan) => void;
  onFree?: () => void;
  onClose?: () => void;
  dismissible?: boolean;
}) {
  const [plan, setPlan] = useState<Plan>('annual');
  const c = NODE.crown.color;

  return (
    <Screen>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.35 }} pointerEvents="none">
        <FieldCanvas mode="idle" height={844} breathing={false} />
      </View>
      <View style={{ paddingHorizontal: 28, paddingTop: 64, flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <MonoLabel color={c}>ACCESS</MonoLabel>
          {onClose && <TextAction onPress={onClose}>Close</TextAction>}
        </View>
        <Q>Keep the whole field open?</Q>
        <Sub>Body and Journal are always free. The full instrument adds the rest.</Sub>
        <View style={{ marginTop: 22 }}>
          {ROWS.map(([a, b]) => (
            <View key={a} style={{ paddingVertical: 11, borderTopWidth: 1, borderTopColor: FR.hair }}>
              <Text style={{ fontFamily: font.ui, fontSize: 14, color: FR.text }}>{a}</Text>
              <MonoLabel size={9} color={FR.ghost} style={{ marginTop: 4 }}>{b}</MonoLabel>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
          {PLANS.map((p) => {
            const on = plan === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPlan(p.id)}
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: on ? `${c}24` : 'transparent',
                  borderWidth: 1,
                  borderColor: on ? c : FR.hair,
                  borderRadius: 2,
                }}
              >
                <MonoLabel size={9} color={on ? c : FR.ghost}>{p.label}</MonoLabel>
                <Text style={{ fontFamily: font.mono, fontSize: 15, color: FR.text, marginTop: 6 }}>{p.price}</Text>
                <MonoLabel size={9} color={FR.textDim} style={{ marginTop: 4 }}>{p.note}</MonoLabel>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flex: 1 }} />
        <PrimaryAction onPress={() => onTrial(plan)}>
          {plan === 'annual' ? 'START 7-DAY TRIAL' : 'SUBSCRIBE MONTHLY'}
        </PrimaryAction>
        <MonoLabel size={9} color={FR.ghost} style={{ textAlign: 'center', marginTop: 10 }}>
          BILLED VIA APP STORE OR GOOGLE PLAY · RESTORE PURCHASE
        </MonoLabel>
        <View style={{ alignItems: 'center', marginVertical: 4, marginBottom: 24, minHeight: 40 }}>
          {dismissible && <TextAction onPress={onFree}>Continue with the free field</TextAction>}
        </View>
      </View>
    </Screen>
  );
}
