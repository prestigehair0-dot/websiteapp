// Ported from ui_kits/mobile/components/FirstRunTabs.jsx (YouTab + MudraScreen).
// The mudra screen used photographed hand PNGs in the design system
// (mudras/*.png, > 256KB each) that this session's design-import tool could
// not fetch in full (256KB read cap) — see data/nodes.ts MUDRA. It renders a
// chakra-colored bija glyph instead; swap in the real photo when available.
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Screen, MonoLabel, PrimaryAction, TextAction, Sub, Switch, FR } from '../../components/atoms';
import { NODE, NodeId, CRISIS_RESOURCES } from '../../data/nodes';
import { dominant, emptyStoreKeepPrefs, Store } from '../../lib/store';
import { font } from '../../theme/tokens';

function TabHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 24, paddingTop: 56 }}>
      <MonoLabel>{title}</MonoLabel>
      {meta ? <MonoLabel size={10} color={FR.ghost}>{meta}</MonoLabel> : null}
    </View>
  );
}

function Row({
  label,
  value,
  onPress,
  color,
  children,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: FR.hair }}
    >
      <Text style={{ fontFamily: font.ui, fontSize: 15, color: FR.text }}>{label}</Text>
      {children ?? <MonoLabel size={10} color={color ?? FR.textDim}>{value}</MonoLabel>}
    </Pressable>
  );
}

function MudraScreen({ node, onBack }: { node: NodeId; onBack: () => void }) {
  const n = NODE[node];
  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 24, paddingTop: 56 }}>
        <TextAction onPress={onBack}>‹ You</TextAction>
        <MonoLabel size={10} color={FR.ghost}>{n.bija} · {n.hz} HZ</MonoLabel>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, paddingHorizontal: 24, paddingBottom: 90 }}>
        <View
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            borderWidth: 1,
            borderColor: n.color,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${n.color}14`,
          }}
        >
          <Text style={{ fontFamily: font.uiLight, fontSize: 44, color: n.color }}>{n.bija}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: font.ui, fontSize: 22, color: FR.text }}>{n.name} mudra</Text>
          <Sub>Hold for the length of three slow breaths. Notice what changes, if anything.</Sub>
        </View>
      </View>
    </Screen>
  );
}

export function YouTab({
  store,
  onCommit,
  onSignOut,
  onPaywall,
}: {
  store: Store;
  onCommit: (fn: (s: Store) => Store) => void;
  onSignOut: () => void;
  onPaywall: () => void;
}) {
  const [view, setView] = useState<'main' | 'mudra'>('main');
  const [editing, setEditing] = useState(false);
  const goal = store.goals.find((g) => g.active);
  const [goalText, setGoalText] = useState(goal?.text ?? '');
  const p = store.profile ?? ({} as Store['profile']);
  const prefs = store.prefs;
  const practice = store.answers.practice ?? {};
  const setPref = (k: keyof Store['prefs'], v: any) => onCommit((s) => ({ ...s, prefs: { ...s.prefs, [k]: v } }));
  const dom = dominant(store.field_state) ?? 'heart';
  const sessions = store.sessions ?? [];
  const locale = prefs.locale ?? 'UK';

  const saveGoal = () => {
    onCommit((s) => ({
      ...s,
      goals: [
        ...s.goals.map((g) => ({ ...g, active: false })),
        ...(goalText.trim() ? [{ text: goalText.trim(), active: true, node: null }] : []),
      ],
    }));
    setEditing(false);
  };

  if (view === 'mudra') return <MudraScreen node={dom} onBack={() => setView('main')} />;

  const days = new Set(store.entries.map((e) => e.date)).size;

  return (
    <Screen>
      <TabHeader
        title="YOU"
        meta={
          store.session
            ? `${String(store.session.provider ?? 'SESSION').toUpperCase()}${
                Number.isFinite(store.session.at) ? ' · ' + new Date(store.session.at).toISOString().slice(0, 10) : ''
              }`
            : ''
        }
      />
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, marginTop: 20 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <MonoLabel size={10} color={FR.ghost}>INTENTION</MonoLabel>
        {editing ? (
          <View>
            <TextInput
              autoFocus
              value={goalText}
              onChangeText={(t) => setGoalText(t.slice(0, 120))}
              multiline
              style={{
                marginTop: 10,
                borderBottomWidth: 1,
                borderBottomColor: FR.hairStrong,
                paddingBottom: 8,
                color: FR.text,
                fontFamily: font.journal,
                fontStyle: 'italic',
                fontSize: 18,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <PrimaryAction onPress={saveGoal}>SAVE</PrimaryAction>
              <PrimaryAction onPress={() => setEditing(false)} style={{ width: 96 }}>CANCEL</PrimaryAction>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setEditing(true)}>
            <Text style={{ marginTop: 10, fontFamily: font.journal, fontStyle: 'italic', fontSize: 18, lineHeight: 27, color: goal ? FR.text : FR.ghost }}>
              {goal ? `"${goal.text}"` : 'No intention set. Tap to write one.'}
            </Text>
          </Pressable>
        )}

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 28, marginBottom: 24 }}>
          {([
            ['ENTRIES', store.entries.length],
            ['DAYS', days],
            ['SESSIONS', sessions.length],
          ] as const).map(([k, v]) => (
            <View key={k} style={{ flex: 1, borderTopWidth: 1, borderTopColor: FR.hair, paddingTop: 10 }}>
              <MonoLabel size={9} color={FR.ghost}>{k}</MonoLabel>
              <Text style={{ fontFamily: font.mono, fontSize: 22, color: FR.text, marginTop: 4 }}>{String(v).padStart(2, '0')}</Text>
            </View>
          ))}
        </View>

        <MonoLabel size={10} color={FR.ghost} style={{ marginTop: 8 }}>PRACTICE</MonoLabel>
        <Row label="Mudra for today" value={`${NODE[dom].name.toUpperCase()} ›`} color={NODE[dom].color} onPress={() => setView('mudra')} />
        <Row label="Daily length" value={`${practice.duration_min ?? 5} MIN`} />
        <Row label="Reminder" value={practice.reminder_at ? String(practice.reminder_at).toUpperCase() : 'OFF'} />

        <MonoLabel size={10} color={FR.ghost} style={{ marginTop: 28 }}>MEMORY & DATA</MonoLabel>
        <Row label="Let the coach remember entries">
          <Switch on={p?.memory_consent !== false} color={NODE.heart.color} onChange={(v) => onCommit((s) => ({ ...s, profile: { ...s.profile!, memory_consent: v } }))} />
        </Row>
        <Row label="Reduce motion">
          <Switch on={!!prefs.reduceMotion} onChange={(v) => setPref('reduceMotion', v)} />
        </Row>
        <Row label="Work offline (rules only)">
          <Switch on={!!prefs.offline} onChange={(v) => setPref('offline', v)} />
        </Row>
        <Row
          label="Export my data"
          value="JSON ›"
          onPress={() => Alert.alert('Export', `${store.entries.length} entries, ${store.signals.length} signals ready to export.`)}
        />

        <MonoLabel size={10} color={FR.ghost} style={{ marginTop: 28 }}>SAFETY</MonoLabel>
        <Row label="Crisis resources region">
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {Object.keys(CRISIS_RESOURCES).map((k) => (
              <Pressable
                key={k}
                onPress={() => setPref('locale', k)}
                style={{ borderWidth: 1, borderColor: locale === k ? FR.hairStrong : FR.hair, borderRadius: 2, paddingVertical: 4, paddingHorizontal: 8 }}
              >
                <Text style={{ color: locale === k ? FR.text : FR.ghost, fontFamily: font.mono, fontSize: 9, letterSpacing: 1 }}>{k}</Text>
              </Pressable>
            ))}
          </View>
        </Row>
        <Text style={{ marginTop: 10, fontFamily: font.ui, fontSize: 13, lineHeight: 20, color: FR.textDim }}>
          {CRISIS_RESOURCES[locale]}
        </Text>

        <MonoLabel size={10} color={FR.ghost} style={{ marginTop: 28 }}>ACCOUNT</MonoLabel>
        <Row
          label="Plan"
          value={({ trial: 'TRIAL · 7 DAYS ›', monthly: 'MONTHLY ›', free: 'FREE · UPGRADE ›' } as Record<string, string>)[store.plan ?? ''] ?? 'FULL ›'}
          color={store.plan === 'free' ? FR.textDim : NODE.crown.color}
          onPress={onPaywall}
        />
        <Row label="Sign out" value="›" onPress={onSignOut} />
        <Row
          label="Delete everything"
          color="#F43F5E"
          value="›"
          onPress={() =>
            Alert.alert('Delete all local data?', undefined, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onCommit((s) => emptyStoreKeepPrefs(s)) },
            ])
          }
        />
      </ScrollView>
    </Screen>
  );
}
