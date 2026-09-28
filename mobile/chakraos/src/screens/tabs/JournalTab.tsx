// Ported from ui_kits/mobile/components/FirstRunHome.jsx (JournalTabV2).
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Screen, MonoLabel, PrimaryAction, FR } from '../../components/atoms';
import { NODE, NodeId } from '../../data/nodes';
import { pad3, Store, submitEntry } from '../../lib/store';
import { font } from '../../theme/tokens';

export function JournalTab({
  store,
  prefill,
  onCommit,
}: {
  store: Store;
  prefill: NodeId | null;
  onCommit: (fn: (s: Store) => Store) => void;
}) {
  const [text, setText] = useState('');
  const [node, setNode] = useState<NodeId | null>(prefill);

  const submit = () => {
    if (!text.trim()) return;
    onCommit((s) => submitEntry(s, text.trim(), node ?? undefined));
    setText('');
    setNode(null);
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 90 }}>
        <MonoLabel>JOURNAL</MonoLabel>
        {node && (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
              marginTop: 14,
              alignSelf: 'flex-start',
              paddingVertical: 5,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: NODE[node].color,
              borderRadius: 2,
            }}
          >
            <MonoLabel size={10} color={NODE[node].color}>NODE · {NODE[node].name}</MonoLabel>
            <Pressable onPress={() => setNode(null)}>
              <Text style={{ color: FR.ghost, fontSize: 12 }}>×</Text>
            </Pressable>
          </View>
        )}
        <TextInput
          value={text}
          onChangeText={(t) => setText(t.slice(0, 140))}
          placeholder="One sentence about right now"
          placeholderTextColor={FR.ghost}
          multiline
          numberOfLines={3}
          style={{
            marginTop: 20,
            borderBottomWidth: 1,
            borderBottomColor: FR.hairStrong,
            paddingBottom: 8,
            color: FR.text,
            fontFamily: font.journal,
            fontStyle: 'italic',
            fontSize: 20,
            lineHeight: 30,
            minHeight: 80,
            textAlignVertical: 'top',
          }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 10, marginBottom: 16 }}>
          <MonoLabel size={10} color={FR.ghost}>{pad3(text.length)} / 140</MonoLabel>
        </View>
        <PrimaryAction onPress={submit} disabled={!text.trim()}>SAVE</PrimaryAction>
        <ScrollView style={{ marginTop: 28, flex: 1 }}>
          {store.entries.map((e) => (
            <View key={e.id} style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: FR.hair }}>
              <MonoLabel size={10} color={FR.ghost}>
                {e.date}
                {e.queued ? ' · QUEUED' : ''}
              </MonoLabel>
              <Text style={{ fontFamily: font.journal, fontStyle: 'italic', fontSize: 15, color: FR.text, marginTop: 6, lineHeight: 23 }}>
                {e.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}
