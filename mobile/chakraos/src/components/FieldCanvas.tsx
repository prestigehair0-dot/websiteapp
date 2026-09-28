// The vertical nine-node field visualization — ported from FirstRunShared.jsx's
// FieldCanvas. SVG blur filters aren't reliable across react-native-svg's
// platforms, so glow halos are approximated with layered flat-opacity circles
// instead of feGaussianBlur.
import React, { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { NODES, NodeId } from '../data/nodes';
import { FieldState } from '../lib/store';

export function useBreathe(enabled: boolean) {
  const [value] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!enabled) {
      value.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1.012, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(value, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [enabled]);
  return value;
}

export interface FieldCanvasProps {
  mode?: 'idle' | 'ignite' | 'live';
  highlight?: NodeId[];
  lit?: number;
  field?: FieldState | null;
  width?: number;
  height?: number;
  onTap?: (id: NodeId) => void;
  breathing?: boolean;
  reduceMotion?: boolean;
  captions?: boolean;
}

export function FieldCanvas({
  mode = 'idle',
  highlight = [],
  lit = 9,
  field,
  width = 390,
  height = 560,
  onTap,
  breathing = true,
  reduceMotion = false,
}: FieldCanvasProps) {
  const cx = width / 2;
  const top = height * 0.09;
  const bot = height * 0.91;
  const gap = (bot - top) / 8;
  const dim = mode === 'ignite' && !field;
  const scale = useBreathe(breathing && !reduceMotion);

  return (
    <Animated.View style={{ width, height, transform: [{ scale }] }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1={cx} y1={top - 18} x2={cx} y2={bot + 18} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        {NODES.map((n, i) => {
          const y = top + i * gap;
          const isLit = i >= 9 - lit;
          const e = field ? field.nodes[n.id].energy : 50;
          const trend = field ? field.nodes[n.id].trend : 0;
          const hl = highlight.includes(n.id);
          const r = isLit ? (dim ? 3.5 : 3 + (e / 100) * 6) : 0;
          const glow = isLit ? (dim ? 6 : hl ? 28 : 10 + (e / 100) * 16) : 0;
          return (
            <React.Fragment key={n.id}>
              {glow > 0 && (
                <Circle cx={cx} cy={y} r={glow} fill={n.color} opacity={(isLit ? (dim ? 0.18 : hl ? 0.32 : 0.2) : 0) * 0.6} />
              )}
              {hl && <Circle cx={cx} cy={y} r={14} fill="none" stroke={n.color} strokeOpacity={0.7} strokeWidth={0.8} />}
              {mode === 'live' && trend !== 0 && (
                <Circle
                  cx={cx}
                  cy={y}
                  r={16}
                  fill="none"
                  stroke={n.color}
                  strokeOpacity={0.8}
                  strokeWidth={0.9}
                  strokeDasharray={`${2 * Math.PI * 16 * 0.28} ${2 * Math.PI * 16}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${y})`}
                />
              )}
              <Circle cx={cx} cy={y} r={r} fill={n.color} opacity={isLit ? (dim ? 0.45 : 1) : 0} />
              {onTap && (
                <Circle
                  cx={cx}
                  cy={y}
                  r={24}
                  fill="transparent"
                  onPress={() => onTap(n.id)}
                />
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </Animated.View>
  );
}
