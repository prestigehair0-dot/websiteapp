// Ported from ui_kits/mobile/components/FirstRunTabs.jsx (SoundTab + Player + Breath).
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Screen, MonoLabel, PrimaryAction, TextAction, FR } from '../../components/atoms';
import { NODE, NODES, NodeId } from '../../data/nodes';
import { SOUNDS } from '../../data/sounds';
import { dominant, Store } from '../../lib/store';
import { useNowPlaying } from '../../lib/audio';
import { font } from '../../theme/tokens';

const fmtSec = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function TabHeader({ title, meta, back, onBack }: { title?: string; meta?: string; back?: string; onBack?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 24, paddingTop: 56 }}>
      {back ? <TextAction onPress={onBack}>‹ {back}</TextAction> : <MonoLabel>{title}</MonoLabel>}
      {meta ? <MonoLabel size={10} color={FR.ghost}>{meta}</MonoLabel> : null}
    </View>
  );
}

function Row({ label, value, onPress, color }: { label: string; value: string; onPress?: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: FR.hair }}>
      <Text style={{ fontFamily: font.ui, fontSize: 15, color: FR.text }}>{label}</Text>
      <MonoLabel size={10} color={color ?? FR.textDim}>{value}</MonoLabel>
    </Pressable>
  );
}

function Player({
  node,
  hz,
  kind,
  playing,
  elapsed,
  duration,
  reduceMotion,
  onToggle,
  onBack,
}: {
  node: NodeId;
  hz: number;
  kind: string;
  playing: boolean;
  elapsed: number;
  duration: number;
  reduceMotion: boolean;
  onToggle: () => void;
  onBack: () => void;
}) {
  const n = NODE[node];
  const progress = duration ? elapsed / duration : 0;
  const circ = 2 * Math.PI * 96;
  return (
    <Screen>
      <TabHeader back="Library" onBack={onBack} meta={playing ? 'PLAYING' : 'PAUSED'} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 30, paddingBottom: 90 }}>
        <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={220} height={220} style={{ position: 'absolute' }}>
            <Circle cx={110} cy={110} r={96} fill="none" stroke={FR.hair} />
            <Circle
              cx={110}
              cy={110}
              r={96}
              fill="none"
              stroke={n.color}
              strokeWidth={1.2}
              strokeDasharray={`${circ}`}
              strokeDashoffset={`${circ * (1 - progress)}`}
              transform="rotate(-90 110 110)"
            />
          </Svg>
          <View style={{ width: 10 + (playing ? 6 : 0), height: 10 + (playing ? 6 : 0), borderRadius: 8, backgroundColor: n.color }} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: font.ui, fontSize: 22, color: FR.text }}>{n.name}</Text>
          <MonoLabel size={11} color={n.color} style={{ marginTop: 8 }}>{hz} HZ · {kind}</MonoLabel>
          <MonoLabel size={11} color={FR.textDim} style={{ marginTop: 8 }}>SESSION {fmtSec(elapsed)}</MonoLabel>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, width: 260 }}>
          <PrimaryAction onPress={onToggle}>{playing ? 'PAUSE' : 'PLAY'}</PrimaryAction>
          <PrimaryAction onPress={onBack} style={{ width: 96 }}>END</PrimaryAction>
        </View>
      </View>
    </Screen>
  );
}

const BREATH: [string, number][] = [['INHALE', 4], ['HOLD', 4], ['EXHALE', 4], ['HOLD', 4]];

function Breath({ onBack, onDone }: { onBack: () => void; onDone: (sec: number) => void }) {
  const [tick, setTick] = useState(0);
  const [on, setOn] = useState(false);
  const total = 120;
  const c = NODE.heart.color;

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => {
      setTick((t) => {
        const next = t + 1;
        if (next >= total) {
          clearInterval(id);
          setOn(false);
          onDone(total);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [on]);

  const phaseIdx = Math.floor((tick % 16) / 4);
  const phase = BREATH[phaseIdx];

  return (
    <Screen>
      <TabHeader back="Library" onBack={onBack} meta="BOX · 4 · 4 · 4 · 4" />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 30, paddingBottom: 90 }}>
        <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: c,
              opacity: on ? 1 : 0.5,
            }}
          />
        </View>
        <View style={{ alignItems: 'center' }}>
          <MonoLabel size={12} color={c}>{on ? phase[0] : tick >= total ? 'COMPLETE' : 'READY'}</MonoLabel>
          <MonoLabel size={11} color={FR.textDim} style={{ marginTop: 8 }}>{fmtSec(Math.max(0, total - tick))} REMAINING</MonoLabel>
        </View>
        <View style={{ width: 260 }}>
          <PrimaryAction
            onPress={() => {
              if (tick >= total) setTick(0);
              setOn((o) => !o);
            }}
          >
            {on ? 'PAUSE' : tick > 0 && tick < total ? 'RESUME' : 'BEGIN'}
          </PrimaryAction>
        </View>
      </View>
    </Screen>
  );
}

export function SoundTab({
  store,
  onCommit,
  reduceMotion,
  initial,
  onPaywall,
}: {
  store: Store;
  onCommit: (fn: (s: Store) => Store) => void;
  reduceMotion: boolean;
  initial: NodeId | 'breath' | null;
  onPaywall: () => void;
}) {
  const free = store.plan === 'free';
  const locked = (x: { kind: string }) => free && x.kind !== 'Solfeggio';
  const audio = useNowPlaying();
  const [view, setView] = useState<'library' | 'player' | 'breath'>(initial === 'breath' ? 'breath' : 'library');
  const [snd, setSnd] = useState<(typeof SOUNDS)[number] | null>(null);
  const [filter, setFilter] = useState<NodeId | null>(initial && initial !== 'breath' ? initial : null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!audio.playing) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [audio.playing]);

  const logSession = (kind: string, sec: number) =>
    onCommit((s) => ({ ...s, sessions: [{ kind, sec, at: Date.now() }, ...(s.sessions ?? [])] }));

  const open = (x: (typeof SOUNDS)[number]) => {
    if (locked(x)) return onPaywall();
    setSnd(x);
    setElapsed(0);
    audio.play(x);
    setView('player');
  };
  const back = () => {
    if (elapsed > 0 && snd) logSession(`${snd.hz} HZ`, elapsed);
    setView('library');
  };

  if (view === 'player' && snd) {
    return (
      <Player
        node={snd.node}
        hz={snd.hz}
        kind={snd.kind}
        playing={audio.playing}
        elapsed={audio.hasAudio(snd.id) ? audio.currentTime : elapsed}
        duration={audio.hasAudio(snd.id) ? audio.duration : 0}
        reduceMotion={reduceMotion}
        onToggle={audio.hasAudio(snd.id) ? audio.toggle : () => setElapsed((e) => e)}
        onBack={back}
      />
    );
  }
  if (view === 'breath') {
    if (free) {
      onPaywall();
      setView('library');
    } else {
      return <Breath onBack={() => setView('library')} onDone={(sec) => logSession('BREATH', sec)} />;
    }
  }

  const list = filter ? SOUNDS.filter((s) => s.node === filter) : SOUNDS;
  const nodesWithSound = NODES.filter((n) => SOUNDS.some((s) => s.node === n.id));
  const dom = dominant(store.field_state);

  return (
    <Screen>
      <TabHeader title="SOUND" meta={free ? `${SOUNDS.filter((s) => !locked(s)).length} OF ${SOUNDS.length} · FREE` : `${SOUNDS.length} SESSIONS`} />
      <View style={{ paddingHorizontal: 24, paddingTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Pressable
          onPress={() => setFilter(null)}
          style={{ borderWidth: 1, borderColor: !filter ? FR.hairStrong : FR.hair, borderRadius: 2, paddingVertical: 6, paddingHorizontal: 10 }}
        >
          <Text style={{ color: !filter ? FR.text : FR.ghost, fontFamily: font.mono, fontSize: 9, letterSpacing: 1.1 }}>ALL</Text>
        </Pressable>
        {nodesWithSound.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => setFilter(n.id)}
            style={{ borderWidth: 1, borderColor: filter === n.id ? n.color : FR.hair, borderRadius: 2, paddingVertical: 6, paddingHorizontal: 10 }}
          >
            <Text style={{ color: filter === n.id ? n.color : FR.ghost, fontFamily: font.mono, fontSize: 9, letterSpacing: 1.1 }}>
              {n.name.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 10 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <Row label="Box breathing" onPress={() => setView('breath')} color={free ? FR.ghost : NODE.heart.color} value={free ? 'FULL ›' : '2 MIN ›'} />
        {dom && !filter && (
          <Row label={`${NODE[dom].name} is leading today`} onPress={() => setFilter(dom)} color={NODE[dom].color} value="FILTER ›" />
        )}
        {list.map((x) => {
          const n = NODE[x.node];
          const lk = locked(x);
          return (
            <Pressable
              key={x.id}
              onPress={() => open(x)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderTopWidth: 1, borderTopColor: FR.hair, opacity: lk ? 0.55 : 1 }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: n.color }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.ui, fontSize: 15, color: FR.text }}>{n.name} · {x.kind}</Text>
                <MonoLabel size={9} color={FR.ghost} style={{ marginTop: 4 }}>{n.bija}{lk ? ' · FULL' : ''}</MonoLabel>
              </View>
              <MonoLabel size={11} color={FR.textDim}>{x.hz} HZ</MonoLabel>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
