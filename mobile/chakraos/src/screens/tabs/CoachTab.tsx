// Ported from ui_kits/mobile/components/FirstRunTabs.jsx (CoachTab).
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Screen, MonoLabel, FR } from '../../components/atoms';
import { NODE, NodeId, CRISIS_RESOURCES } from '../../data/nodes';
import { CoachMessage, dominant, ruleClassify, Store } from '../../lib/store';
import { font } from '../../theme/tokens';

function coachOpeners(f: Store['field_state']): string[] {
  const d = dominant(f);
  return d
    ? [
        `${NODE[d].name} carried the most weight in your last entry. What was underneath it?`,
        'What is one thing you noticed today that you did not write down?',
        'Where in the body did today sit?',
      ]
    : ['Nothing has been written yet. What is one sentence about right now?', 'What brought you here today?'];
}

function coachReply(text: string, store: Store): { text: string; agent: string } {
  const hits = ruleClassify(text);
  if (/\b(hurt|harm|end it|die|suicid|kill)\b/i.test(text)) {
    return { text: CRISIS_RESOURCES[store.prefs.locale ?? 'UK'], agent: 'SAFETY' };
  }
  if (hits.length) {
    const n = NODE[hits[0].node];
    return {
      text: `That sounds like it sits near ${n.name}. When you say "${text.split(' ').slice(0, 4).join(' ')}…", what happened just before?`,
      agent: 'AWARENESS',
    };
  }
  const goal = store.goals.find((g) => g.active);
  if (goal && Math.random() > 0.5) {
    return { text: `Earlier you wrote "${goal.text}". Does today move toward that, or away?`, agent: 'MEMORY' };
  }
  return { text: 'Say more about that. Where does it show up first: thought, body, or breath?', agent: 'AWARENESS' };
}

export function CoachTab({
  store,
  onCommit,
  onSound,
}: {
  store: Store;
  onCommit: (fn: (s: Store) => Store) => void;
  onSound: (id: NodeId | 'breath') => void;
}) {
  const msgs = store.coach ?? [];
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const openers = useMemo(() => coachOpeners(store.field_state), [store.field_state?.version]);

  const send = (t?: string) => {
    const clean = (t ?? text).trim();
    if (!clean) return;
    // send() only ever runs from a Pressable/TextInput handler, never during
    // render, so timestamping the message here is safe despite the (render-
    // purity-oriented) lint rule below.
    // eslint-disable-next-line react-hooks/purity
    const userMsg: CoachMessage = { role: 'you', text: clean, t: Date.now() };
    onCommit((s) => ({ ...s, coach: [...(s.coach ?? []), userMsg] }));
    setText('');
    setTyping(true);
    setTimeout(() => {
      const r = coachReply(clean, store);
      const t = Date.now();
      onCommit((s) => ({ ...s, coach: [...(s.coach ?? []), { role: 'coach', text: r.text, agent: r.agent, t }] }));
      setTyping(false);
    }, 900);
  };

  const suggest = dominant(store.field_state);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 24, paddingTop: 56 }}>
        <MonoLabel>COACH</MonoLabel>
        <MonoLabel size={10} color={FR.ghost}>
          {msgs.length ? String(msgs.length).padStart(2, '0') + ' TURNS' : 'NEW THREAD'} · {store.prefs.offline ? 'RULES' : 'CLAUDE'}
        </MonoLabel>
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 20 }}>
        {msgs.length === 0 && (
          <View style={{ gap: 10 }}>
            <MonoLabel size={10} color={FR.ghost}>OPENINGS</MonoLabel>
            {openers.map((o) => (
              <Pressable
                key={o}
                onPress={() => send(o)}
                style={{ borderWidth: 1, borderColor: FR.hair, borderRadius: 2, padding: 14 }}
              >
                <Text style={{ color: FR.text, fontFamily: font.ui, fontSize: 14, lineHeight: 20 }}>{o}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {msgs.map((m) => (
          <View key={m.t} style={{ marginBottom: 18, alignItems: m.role === 'you' ? 'flex-end' : 'flex-start' }}>
            <MonoLabel size={9} color={m.agent === 'SAFETY' ? '#F43F5E' : FR.ghost}>
              {m.role === 'you' ? 'YOU' : `COACH · ${m.agent}`}
            </MonoLabel>
            <Text
              style={{
                marginTop: 6,
                maxWidth: '86%',
                fontFamily: m.role === 'you' ? font.journal : font.ui,
                fontStyle: m.role === 'you' ? 'italic' : 'normal',
                fontSize: 15,
                lineHeight: 22,
                color: FR.text,
                borderLeftWidth: m.role === 'coach' ? 1 : 0,
                borderLeftColor: NODE.third_eye.color,
                paddingLeft: m.role === 'coach' ? 12 : 0,
              }}
            >
              {m.text}
            </Text>
          </View>
        ))}
        {typing && <MonoLabel size={9} color={FR.ghost} style={{ marginBottom: 18 }}>COACH · LISTENING…</MonoLabel>}
        {msgs.length > 0 && suggest && !typing && (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <Pressable onPress={() => onSound(suggest)} style={{ borderWidth: 1, borderColor: FR.hair, borderRadius: 2, paddingVertical: 8, paddingHorizontal: 12 }}>
              <Text style={{ color: FR.textDim, fontFamily: font.mono, fontSize: 10, letterSpacing: 1.2 }}>PLAY {NODE[suggest].hz} HZ</Text>
            </Pressable>
            <Pressable onPress={() => onSound('breath')} style={{ borderWidth: 1, borderColor: FR.hair, borderRadius: 2, paddingVertical: 8, paddingHorizontal: 12 }}>
              <Text style={{ color: FR.textDim, fontFamily: font.mono, fontSize: 10, letterSpacing: 1.2 }}>BREATHE 2 MIN</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 92, borderTopWidth: 1, borderTopColor: FR.hair, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => send()}
          placeholder="Say what is here"
          placeholderTextColor={FR.ghost}
          style={{ flex: 1, color: FR.text, fontFamily: font.journal, fontStyle: 'italic', fontSize: 17, paddingVertical: 8 }}
        />
        <Pressable
          onPress={() => send()}
          disabled={!text.trim()}
          style={{ height: 36, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: text.trim() ? FR.hairStrong : FR.hair, borderRadius: 2 }}
        >
          <Text style={{ color: text.trim() ? FR.text : FR.ghost, fontFamily: font.mono, fontSize: 10, letterSpacing: 1.4 }}>SEND</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
