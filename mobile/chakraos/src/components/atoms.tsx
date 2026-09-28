// Shared "instrument" primitives for the first-run + tab flow.
// Ported from ui_kits/mobile/components/FirstRunShared.jsx.
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { STEPS, OnboardingStep, STEP_NODE, NODE } from '../data/nodes';
import { font } from '../theme/tokens';

export const FR = {
  void: '#0A0E18',
  text: '#E9ECF5',
  textDim: '#8A90A6',
  ghost: '#565C72',
  hair: 'rgba(255,255,255,0.08)',
  hairStrong: 'rgba(255,255,255,0.16)',
};

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function MonoLabel({
  children,
  color = FR.textDim,
  size = 11,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  style?: TextStyle;
}) {
  return (
    <Text
      style={[
        {
          fontFamily: font.mono,
          fontSize: size,
          letterSpacing: size * 0.12,
          textTransform: 'uppercase',
          color,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Q({ children }: { children: React.ReactNode }) {
  return <Text style={styles.q}>{children}</Text>;
}

export function Sub({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sub}>{children}</Text>;
}

export function StepRail({ step }: { step: OnboardingStep }) {
  const idx = STEPS.indexOf(step);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
        {STEPS.map((s, i) => {
          const c = NODE[STEP_NODE[s]].color;
          const on = i === idx;
          return (
            <View
              key={s}
              style={{
                flex: 1,
                height: 1,
                backgroundColor: on ? c : i < idx ? FR.hairStrong : FR.hair,
              }}
            />
          );
        })}
      </View>
      <MonoLabel color={FR.textDim} size={10}>
        STEP {String(idx + 1).padStart(2, '0')} / 05
      </MonoLabel>
    </View>
  );
}

export function PrimaryAction({
  children,
  onPress,
  disabled,
  system = true,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  system?: boolean;
  style?: ViewStyle;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        {
          width: '100%',
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed && !disabled ? 'rgba(255,255,255,0.05)' : 'transparent',
          borderWidth: 1,
          borderColor: disabled ? FR.hair : FR.hairStrong,
          borderRadius: 2,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: disabled ? FR.ghost : FR.text,
          fontFamily: system ? font.mono : font.ui,
          fontSize: system ? 12 : 15,
          letterSpacing: system ? 1.7 : 0,
          textTransform: system ? 'uppercase' : 'none',
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function TextAction({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ padding: 12 }}>
      <Text style={{ color: FR.textDim, fontFamily: font.ui, fontSize: 14 }}>{children}</Text>
    </Pressable>
  );
}

export function NodePill({
  node,
  selected,
  onPress,
}: {
  node: keyof typeof NODE;
  selected: boolean;
  onPress: () => void;
}) {
  const n = NODE[node];
  const c = n.color;
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 10,
        backgroundColor: selected ? `${c}24` : 'transparent',
        borderWidth: 1,
        borderColor: selected ? c : FR.hair,
        borderRadius: 2,
        alignItems: 'flex-start',
      }}
    >
      <Text style={{ fontFamily: font.uiMedium, fontSize: 14, color: FR.text }}>{n.name}</Text>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: font.mono,
          fontSize: 9,
          letterSpacing: 1,
          color: selected ? c : FR.ghost,
          marginTop: 4,
          textTransform: 'uppercase',
        }}
      >
        {n.bija} · {n.assoc}
      </Text>
    </Pressable>
  );
}

export function ConsentRow({
  checked,
  onChange,
  label,
  sub,
  color = '#4ADE80',
  required,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label: string;
  sub?: string;
  color?: string;
  required?: boolean;
}) {
  return (
    <Pressable
      onPress={() => onChange?.(!checked)}
      style={{
        flexDirection: 'row',
        gap: 14,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: FR.hair,
      }}
    >
      <View
        style={{
          width: 16,
          height: 16,
          marginTop: 2,
          borderWidth: 1,
          borderColor: checked ? color : FR.hairStrong,
          backgroundColor: checked ? color : 'transparent',
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.ui, fontSize: 14, color: FR.text, lineHeight: 20 }}>
          {label}
          {required && <Text style={{ color: FR.ghost }}> *</Text>}
        </Text>
        {sub ? (
          <Text
            style={{
              fontFamily: font.mono,
              fontSize: 10,
              letterSpacing: 1,
              color: FR.ghost,
              marginTop: 6,
              textTransform: 'uppercase',
            }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function Switch({ on, onChange, color = '#22D3EE' }: { on: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <Pressable
      onPress={() => onChange(!on)}
      style={{
        width: 34,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: on ? color : FR.hairStrong,
        backgroundColor: on ? `${color}26` : 'transparent',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 18 : 2,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: on ? color : FR.textDim,
        }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: FR.void,
  },
  q: {
    fontFamily: font.ui,
    fontWeight: '400',
    fontSize: 22,
    lineHeight: 29,
    color: FR.text,
  },
  sub: {
    marginTop: 10,
    fontFamily: font.ui,
    fontSize: 14,
    lineHeight: 21,
    color: FR.textDim,
  },
});
