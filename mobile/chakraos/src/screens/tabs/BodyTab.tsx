// Ported from ui_kits/mobile/components/FirstRunHome.jsx (BodyTabV2 + Inspector).
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Screen, FR, MonoLabel, PrimaryAction, TextAction } from '../../components/atoms';
import { FieldCanvas } from '../../components/FieldCanvas';
import { NODE, NodeId, TabId } from '../../data/nodes';
import { fmtTime, Store } from '../../lib/store';
import { font } from '../../theme/tokens';

const PROMPTS: Record<NodeId, string> = {
  heart: 'Where did that closeness come from?',
  root: 'What would feel one degree safer?',
  throat: 'What went unsaid today?',
  third_eye: 'What became clearer, and when?',
  solar: 'Where did you decide instead of drift?',
  sacral: 'What did you make or move today?',
  crown: 'What went quiet?',
  soul: 'What felt larger than the day?',
  earth: 'What held your weight?',
};

function Inspector({
  nodeId,
  field,
  onClose,
  onWrite,
}: {
  nodeId: NodeId;
  field: NonNullable<Store['field_state']>;
  onClose: () => void;
  onWrite: (id: NodeId) => void;
}) {
  const n = NODE[nodeId];
  const st = field.nodes[nodeId];
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '60%',
          backgroundColor: '#0D1220',
          borderTopWidth: 1,
          borderTopColor: FR.hairStrong,
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 28,
        }}
      >
        <View style={{ width: 36, height: 1, backgroundColor: FR.hairStrong, alignSelf: 'center', marginBottom: 18 }} />
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          <Text style={{ fontFamily: font.ui, fontSize: 20, color: FR.text }}>{n.name}</Text>
          <MonoLabel size={11} color={n.color}>{n.bija}</MonoLabel>
        </View>
        <MonoLabel size={11} color={FR.textDim} style={{ marginTop: 8 }}>
          ENERGY {st.energy} · TREND {st.trend > 0 ? '▲' : st.trend < 0 ? '▼' : '—'} · {n.hz} HZ
        </MonoLabel>
        <MonoLabel size={10} color={FR.ghost} style={{ marginTop: 22 }}>DRIVERS</MonoLabel>
        <ScrollView style={{ flex: 1, marginTop: 6 }}>
          {st.drivers.length === 0 && (
            <Text style={{ fontFamily: font.ui, fontSize: 14, color: FR.ghost, paddingVertical: 12 }}>
              Nothing has moved this node yet.
            </Text>
          )}
          {st.drivers.map((d) => (
            <View key={d.id} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: FR.hair }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <MonoLabel size={10} color={FR.ghost}>{d.date}</MonoLabel>
                <Text style={{ fontFamily: font.journal, fontStyle: 'italic', fontSize: 14, color: FR.text, flexShrink: 1 }}>
                  &quot;{d.quote}&quot;
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: FR.hair, marginTop: 8 }}>
                <View style={{ height: 1, width: `${d.weight * 100}%`, backgroundColor: n.color }} />
              </View>
            </View>
          ))}
        </ScrollView>
        <Text style={{ marginVertical: 14, fontFamily: font.ui, fontSize: 15, lineHeight: 23, color: FR.text }}>
          {PROMPTS[nodeId]}
        </Text>
        <PrimaryAction system={false} onPress={() => onWrite(nodeId)}>Write about this</PrimaryAction>
      </View>
    </View>
  );
}

export function BodyTab({
  store,
  onTab,
  onWrite,
  reduceMotion,
}: {
  store: Store;
  onTab: (t: TabId) => void;
  onWrite: (id: NodeId) => void;
  reduceMotion: boolean;
}) {
  const [insp, setInsp] = useState<NodeId | null>(null);
  const f = store.field_state;
  return (
    <Screen>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 56,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingHorizontal: 20,
          zIndex: 2,
        }}
      >
        <Text style={{ fontFamily: font.ui, fontSize: 16, color: FR.text }}>chakraOS</Text>
        <MonoLabel size={10} color={FR.textDim}>
          FIELD · v{f ? f.version : 0} · {fmtTime(f?.computed_at)}
        </MonoLabel>
      </View>
      <View style={{ position: 'absolute', top: 40, left: 0, right: 0, bottom: 78, alignItems: 'center' }}>
        {f ? (
          <FieldCanvas mode="live" field={f} height={726} onTap={setInsp} breathing={!insp} reduceMotion={reduceMotion} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 }}>
              <FieldCanvas mode="ignite" height={726} breathing={false} />
            </View>
            <MonoLabel>NO ENTRIES YET</MonoLabel>
            <TextAction onPress={() => onTab('journal')}>Write your first sentence</TextAction>
          </View>
        )}
      </View>
      {insp && f && (
        <Inspector
          nodeId={insp}
          field={f}
          onClose={() => setInsp(null)}
          onWrite={(id) => {
            setInsp(null);
            onWrite(id);
          }}
        />
      )}
    </Screen>
  );
}
