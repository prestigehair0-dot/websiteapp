// Root gate — ported from ui_kits/mobile/components/FirstRunApp.jsx.
//
// This deliberately keeps the design system's own state-machine navigation
// (auth -> onboarding -> paywall -> tabs, driven by `gate(store)`) rather than
// switching to Expo Router, since the whole point of the ported flow is that
// gating is data-driven and resume-safe from a single persisted store. If the
// app grows deep-linkable routes later, wrap this in Expo Router and drive it
// from the same `gate()` function.
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, AccessibilityInfo } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { Lora_400Regular_Italic } from '@expo-google-fonts/lora';

import { FR } from './src/components/atoms';
import { TabBar } from './src/components/TabBar';
import { NodeId, TabId } from './src/data/nodes';
import { advanceOnboarding, gate, Store, useChakraStore } from './src/lib/store';

import { SplashScreen } from './src/screens/auth/SplashScreen';
import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { SignInScreen } from './src/screens/auth/SignInScreen';
import { VerifyScreen } from './src/screens/auth/VerifyScreen';
import { StepIntention } from './src/screens/onboarding/StepIntention';
import { StepFocus } from './src/screens/onboarding/StepFocus';
import { StepPractice } from './src/screens/onboarding/StepPractice';
import { StepConsent } from './src/screens/onboarding/StepConsent';
import { StepFirstEntry } from './src/screens/onboarding/StepFirstEntry';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { BodyTab } from './src/screens/tabs/BodyTab';
import { JournalTab } from './src/screens/tabs/JournalTab';
import { CoachTab } from './src/screens/tabs/CoachTab';
import { SoundTab } from './src/screens/tabs/SoundTab';
import { YouTab } from './src/screens/tabs/YouTab';

type AuthScreen = 'splash' | 'welcome' | 'signin' | 'verify';

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_900Black,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
    Lora_400Regular_Italic,
  });
  const { store, setStore, ready } = useChakraStore();
  const [splashDone, setSplashDone] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('splash');
  const [authMode, setAuthMode] = useState<'new' | 'returning'>('new');
  const [email, setEmail] = useState('');
  const [tab, setTab] = useState<TabId>('body');
  const [prefill, setPrefill] = useState<NodeId | null>(null);
  const [soundInit, setSoundInit] = useState<NodeId | 'breath' | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then(setSystemReduceMotion).catch(() => {});
  }, []);

  if (!fontsLoaded || !ready || !store) return null;

  const rm = store.prefs.reduceMotion || systemReduceMotion;
  const g = gate(store);

  const setPlan = (p: 'annual' | 'monthly') => {
    setStore((s) => ({ ...s, plan: p === 'annual' ? 'trial' : 'monthly' }));
    setPaywall(false);
  };
  const signOut = () => {
    setStore((s) => ({ ...s, session: null }));
    setAuthScreen('welcome');
    setTab('body');
  };
  const advance = (fn: (s: Store) => Store) => setStore((s) => advanceOnboarding(fn(s)));
  const createSession = (provider: 'apple' | 'google' | 'email') =>
    setStore((s) => ({
      ...s,
      session: { provider, at: Date.now() },
      profile: s.profile ?? {
        onboarded: false,
        onboarding_step: 'intention',
        memory_consent: true,
      },
    }));
  const enterField = () => setStore((s) => ({ ...s, profile: { ...s.profile!, onboarded: true, onboarding_step: null } }));

  let view: React.ReactNode;

  if (!splashDone) {
    view = <SplashScreen reduceMotion={rm} onDone={() => { setSplashDone(true); setAuthScreen('welcome'); }} />;
  } else if (g.group === 'auth') {
    view =
      authScreen === 'welcome' ? (
        <WelcomeScreen
          reduceMotion={rm}
          onBegin={() => { setAuthMode('new'); setAuthScreen('signin'); }}
          onReturning={() => { setAuthMode('returning'); setAuthScreen('signin'); }}
        />
      ) : authScreen === 'signin' ? (
        <SignInScreen
          mode={authMode}
          onApple={() => createSession('apple')}
          onGoogle={() => createSession('google')}
          onSendLink={(e) => { setEmail(e); setAuthScreen('verify'); }}
        />
      ) : (
        <VerifyScreen email={email} onSimulateLink={() => createSession('email')} />
      );
  } else if (g.group === 'onboarding') {
    view =
      {
        intention: <StepIntention store={store} onAdvance={advance} />,
        focus: <StepFocus store={store} onAdvance={advance} reduceMotion={rm} />,
        practice: <StepPractice store={store} onAdvance={advance} />,
        consent: <StepConsent store={store} onAdvance={advance} />,
        'first-entry': <StepFirstEntry store={store} reduceMotion={rm} onCommit={setStore} onEnter={enterField} />,
      }[g.screen];
  } else if (g.group === 'paywall') {
    view = <PaywallScreen onTrial={setPlan} onFree={() => setStore((s) => ({ ...s, plan: 'free' }))} />;
  } else {
    view =
      tab === 'body' ? (
        <BodyTab store={store} reduceMotion={rm} onTab={setTab} onWrite={(id) => { setPrefill(id); setTab('journal'); }} />
      ) : tab === 'journal' ? (
        <JournalTab store={store} prefill={prefill} onCommit={setStore} />
      ) : tab === 'coach' ? (
        <CoachTab store={store} onCommit={setStore} onSound={(id) => { setSoundInit(id); setTab('sound'); }} />
      ) : tab === 'sound' ? (
        <SoundTab store={store} onCommit={setStore} reduceMotion={rm} initial={soundInit} onPaywall={() => setPaywall(true)} />
      ) : (
        <YouTab store={store} onCommit={setStore} onSignOut={signOut} onPaywall={() => setPaywall(true)} />
      );
  }

  const inTabs = splashDone && g.group === 'tabs';

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: FR.void }}>
        {view}
        {inTabs && <TabBar active={tab} onTab={(t) => { setPrefill(null); setSoundInit(null); setTab(t); }} />}
        {inTabs && paywall && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
            <PaywallScreen onTrial={setPlan} onClose={() => setPaywall(false)} dismissible={false} />
          </View>
        )}
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}
