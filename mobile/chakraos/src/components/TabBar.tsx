// Bottom tab bar — ported from ui_kits/mobile/components/FirstRunHome.jsx (TabBarV2).
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NODE, TAB_NODE, TabId } from '../data/nodes';
import { Icon, IconName } from './icons';
import { FR } from './atoms';
import { font } from '../theme/tokens';

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'body', label: 'BODY', icon: 'activity' },
  { id: 'journal', label: 'JOURNAL', icon: 'pen-line' },
  { id: 'coach', label: 'COACH', icon: 'message-circle' },
  { id: 'sound', label: 'SOUND', icon: 'waves' },
  { id: 'you', label: 'YOU', icon: 'compass' },
];

export function TabBar({ active, onTab }: { active: TabId; onTab: (t: TabId) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 62 + insets.bottom,
        paddingBottom: insets.bottom,
        borderTopWidth: 1,
        borderTopColor: FR.hair,
        backgroundColor: FR.void,
        flexDirection: 'row',
      }}
    >
      {TABS.map((t) => {
        const on = active === t.id;
        const c = NODE[TAB_NODE[t.id]].color;
        return (
          <Pressable
            key={t.id}
            onPress={() => onTab(t.id)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <Icon name={t.icon} size={20} color={on ? c : FR.ghost} strokeWidth={on ? 1.6 : 1.3} />
            <Text style={{ fontFamily: font.mono, fontSize: 9, letterSpacing: 1.3, color: on ? c : FR.ghost }}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
