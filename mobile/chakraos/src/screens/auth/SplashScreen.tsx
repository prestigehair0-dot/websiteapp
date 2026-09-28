// Ported from ui_kits/mobile/components/FirstRunAuth.jsx (SplashScreenV2).
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Screen, FR, MonoLabel } from '../../components/atoms';
import { FieldCanvas } from '../../components/FieldCanvas';
import { font } from '../../theme/tokens';

export function SplashScreen({ onDone, reduceMotion }: { onDone: () => void; reduceMotion: boolean }) {
  const [lit, setLit] = useState(reduceMotion ? 9 : 0);
  const [phase, setPhase] = useState(reduceMotion ? 2 : 0);
  const [wordmarkOpacity] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  const [taglineOpacity] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 9; i++) timers.push(setTimeout(() => setLit(i), i * 90 + 120));
    timers.push(
      setTimeout(() => setPhase(1), 900),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(onDone, 1800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    Animated.timing(wordmarkOpacity, { toValue: phase >= 1 ? 1 : 0, duration: 600, useNativeDriver: true }).start();
  }, [phase]);
  useEffect(() => {
    Animated.timing(taglineOpacity, { toValue: phase >= 2 ? 1 : 0, duration: 600, useNativeDriver: true }).start();
  }, [phase]);

  return (
    <Screen>
      <Pressable onPress={onDone} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View style={{ position: 'absolute', left: 120, top: 120 }}>
        <FieldCanvas mode="idle" lit={lit} breathing={false} reduceMotion={reduceMotion} width={270} height={600} />
      </View>
      <View style={{ position: 'absolute', left: 28, width: 200, top: '46%' }}>
        <Animated.Text style={{ opacity: wordmarkOpacity, fontFamily: font.ui, fontSize: 28, color: FR.text }}>
          chakraOS
        </Animated.Text>
        <Animated.View style={{ opacity: taglineOpacity, marginTop: 8 }}>
          <MonoLabel size={11}>TUNE THE INNER FIELD</MonoLabel>
        </Animated.View>
      </View>
    </Screen>
  );
}
