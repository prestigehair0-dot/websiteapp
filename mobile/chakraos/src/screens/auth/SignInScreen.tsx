// Ported from ui_kits/mobile/components/FirstRunAuth.jsx (SignInScreen).
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Screen, FR, MonoLabel, PrimaryAction } from '../../components/atoms';
import { NODE } from '../../data/nodes';
import { font } from '../../theme/tokens';

const APPLE_XML = `<svg width="16" height="18" viewBox="0 0 16 19" fill="#fff"><path d="M13.3 10.1c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7C4.5 5.5 2.4 7.2 2.4 10.6c0 1 .2 2.1.6 3.2.5 1.5 2.4 5.1 4.3 5 .9 0 1.6-.7 2.8-.7 1.2 0 1.8.7 2.9.7 2-.1 3.6-3.3 4.1-4.8-2.6-1.2-3.8-3.4-3.8-3.9zM10.9 3.6c1-1.2.9-2.4.9-2.8-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.8-1 2.8 1 .1 2-.5 2.7-1.3z"/></svg>`;
const GOOGLE_XML = `<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.5 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.7-6c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>`;

export function SignInScreen({
  mode,
  onApple,
  onGoogle,
  onSendLink,
}: {
  mode: 'new' | 'returning';
  onApple: () => void;
  onGoogle: () => void;
  onSendLink: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');

  const send = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr('Enter the email you want the link sent to.');
      return;
    }
    setErr('');
    onSendLink(email);
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 72 }}>
        <MonoLabel>IDENTITY</MonoLabel>
        <Text style={{ fontFamily: font.ui, fontSize: 22, marginTop: 12, lineHeight: 29, color: FR.text }}>
          {mode === 'returning' ? 'Welcome back.' : 'Where should we keep your field?'}
        </Text>

        <Pressable
          onPress={onApple}
          style={{
            marginTop: 40,
            height: 48,
            borderRadius: 8,
            backgroundColor: '#000',
            borderWidth: 1,
            borderColor: '#222',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <SvgXml xml={APPLE_XML} width={16} height={18} />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>Sign in with Apple</Text>
        </Pressable>

        <Pressable
          onPress={onGoogle}
          style={{
            marginTop: 12,
            height: 48,
            borderRadius: 8,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#747775',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <SvgXml xml={GOOGLE_XML} width={18} height={18} />
          <Text style={{ color: '#1f1f1f', fontSize: 15, fontWeight: '500' }}>Continue with Google</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: FR.hair }} />
          <MonoLabel size={10} color={FR.ghost}>OR</MonoLabel>
          <View style={{ flex: 1, height: 1, backgroundColor: FR.hair }} />
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={send}
          placeholder="you@somewhere.com"
          placeholderTextColor={FR.ghost}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderBottomColor: err ? NODE.root.color : FR.hairStrong,
            paddingVertical: 10,
            color: FR.text,
            fontFamily: font.ui,
            fontSize: 16,
          }}
        />
        <Text style={{ height: 20, marginTop: 8, fontFamily: font.ui, fontSize: 13, color: NODE.root.color }}>
          {err}
        </Text>
        <PrimaryAction onPress={send} style={{ marginTop: 12 }}>SEND LINK</PrimaryAction>
      </View>
    </Screen>
  );
}
