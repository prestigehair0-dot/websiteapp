// Ported from ui_kits/mobile/components/FirstRunAuth.jsx (VerifyScreen).
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen, FR, MonoLabel, PrimaryAction, TextAction } from '../../components/atoms';
import { NODE } from '../../data/nodes';
import { font } from '../../theme/tokens';

export function VerifyScreen({
  email,
  onResend,
  onSimulateLink,
}: {
  email: string;
  onResend?: () => void;
  onSimulateLink: () => void;
}) {
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 72 }}>
        <MonoLabel color={NODE.throat.color}>LINK SENT</MonoLabel>
        <Text
          style={{ fontFamily: font.journal, fontStyle: 'italic', fontSize: 20, marginTop: 16, color: FR.text }}
        >
          {email}
        </Text>
        <Text style={{ fontFamily: font.ui, fontSize: 15, color: FR.textDim, marginTop: 16 }}>
          Open your inbox on this device.
        </Text>
        <View style={{ flex: 1 }} />
        <PrimaryAction onPress={onSimulateLink} style={{ borderStyle: 'dashed' }}>
          OPEN LINK · DEMO
        </PrimaryAction>
        <View style={{ alignItems: 'center', marginVertical: 8, marginBottom: 28 }}>
          {left > 0 ? (
            <MonoLabel size={11} color={FR.ghost} style={{ padding: 12 }}>
              RESEND · 00:{String(left).padStart(2, '0')}
            </MonoLabel>
          ) : (
            <TextAction
              onPress={() => {
                setLeft(30);
                onResend?.();
              }}
            >
              Resend
            </TextAction>
          )}
        </View>
      </View>
    </Screen>
  );
}
