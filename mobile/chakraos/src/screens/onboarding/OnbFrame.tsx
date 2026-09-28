// Ported from ui_kits/mobile/components/FirstRunOnboarding.jsx (OnbFrame).
import React from 'react';
import { View } from 'react-native';
import { Screen, StepRail, PrimaryAction, TextAction } from '../../components/atoms';
import { OnboardingStep } from '../../data/nodes';

export function OnbFrame({
  step,
  children,
  primary,
  onPrimary,
  disabled,
  onSkip,
}: {
  step: OnboardingStep;
  children: React.ReactNode;
  primary: string;
  onPrimary: () => void;
  disabled?: boolean;
  onSkip?: () => void;
}) {
  return (
    <Screen>
      <View style={{ paddingHorizontal: 28, paddingTop: 64 }}>
        <StepRail step={step} />
      </View>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 32, overflow: 'hidden' }}>{children}</View>
      <View style={{ paddingHorizontal: 28, paddingTop: 12, paddingBottom: 28 }}>
        <PrimaryAction onPress={onPrimary} disabled={disabled}>{primary}</PrimaryAction>
        <View style={{ alignItems: 'center', height: 44 }}>
          {onSkip && <TextAction onPress={onSkip}>Not now</TextAction>}
        </View>
      </View>
    </Screen>
  );
}
