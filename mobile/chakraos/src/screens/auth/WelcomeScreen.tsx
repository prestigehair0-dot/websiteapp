// Ported from ui_kits/mobile/components/FirstRunAuth.jsx (WelcomeScreen).
import React from 'react';
import { Text, View } from 'react-native';
import { Screen, FR, MonoLabel, PrimaryAction, TextAction } from '../../components/atoms';
import { FieldCanvas } from '../../components/FieldCanvas';
import { font } from '../../theme/tokens';

export function WelcomeScreen({
  onBegin,
  onReturning,
  reduceMotion,
}: {
  onBegin: () => void;
  onReturning: () => void;
  reduceMotion: boolean;
}) {
  return (
    <Screen>
      <View style={{ height: 260, overflow: 'hidden' }}>
        <FieldCanvas mode="idle" height={336} reduceMotion={reduceMotion} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 24 }}>
        <Text style={{ fontFamily: font.ui, fontSize: 26, lineHeight: 33, letterSpacing: -0.2, color: FR.text }}>
          An instrument for the inner field.
        </Text>
        <Text style={{ marginTop: 16, fontFamily: font.ui, fontSize: 15, lineHeight: 23, color: FR.textDim }}>
          One sentence a day. Nine nodes that move with what you notice. No verdicts — a mirror.
        </Text>
        <MonoLabel size={11} color={FR.ghost} style={{ marginTop: 20 }}>
          NON-MEDICAL · REFLECTIVE WELLNESS TOOL
        </MonoLabel>
        <View style={{ flex: 1 }} />
        <PrimaryAction onPress={onBegin}>BEGIN</PrimaryAction>
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <TextAction onPress={onReturning}>I already have an account</TextAction>
        </View>
      </View>
    </Screen>
  );
}
