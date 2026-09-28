# chakraOS (mobile)

A brand-new Expo/React Native app, ported from the **ChakraOS Design System**
(claude.ai/design project `019e2bf8-4322-7b74-aafa-636b2c2a969a`) into this
repository. This is a separate product from the rest of `websiteapp` (a hair
salon booking site) — it lives entirely under `mobile/chakraos/` with its own
`package.json` and does not share dependencies or build tooling with the
Next.js app at the repo root.

## What this is

ChakraOS is a reflective wellness app: a nine-node "field" (the traditional
chakras) that moves based on one-sentence journal entries, with a coach chat,
a frequency/sound library, breathwork, and mudra practice. The design system
calls its visual language **"Clinical Mysticism"** — instrument-panel
minimalism (glass panels, mono numerals, hairline borders) rather than a
tarot/crystals aesthetic. See `uploads/CHAKRAOS_BUILD_BLUEPRINT.md` in the
source design project for the full product spec this was built from.

The port follows the design system's own **first-run** flow (`ui_kits/mobile/
components/FirstRun*.jsx`), which is the more complete of the two prototypes
in the source project — it ships a real state machine, a resume-safe local
store, a rule-based journal→node classifier, and full implementations of all
five tabs (Body, Journal, Coach, Sound, You), not just static mockups.

## Architecture

- **Navigation**: a single `gate(store)` function (ported verbatim from
  `FirstRunShared.jsx`) decides which of `auth → onboarding → paywall → tabs`
  to render, based on what's in the persisted store. There is **no Expo
  Router** here, unlike this project's own `AGENTS.md` default recommendation
  — the ported design is inherently a data-driven state machine, and
  routing would just be a second source of truth for the same gate. See the
  comment at the top of `App.tsx`.
- **State**: `src/lib/store.ts` — a `Store` object persisted to
  `AsyncStorage`, plus the ported rule-based classifier (`ruleClassify`),
  field-energy engine (`fieldRecompute`), and journal entry submission
  (`submitEntry`). This is the same logic the original click-through
  prototype used as its "offline" fallback for the real Claude-backed
  `journal_analyze` agent described in the blueprint — wiring that agent up
  for real is the natural next step once a backend exists.
- **Design tokens**: `src/theme/tokens.ts` — colors, type, spacing, radii,
  motion durations, ported from `colors_and_type.css` / `_ds_manifest.json`.
- **Components**: `src/components/` — `atoms.tsx` (Screen, MonoLabel,
  PrimaryAction, ConsentRow, …), `FieldCanvas.tsx` (the nine-node vertical
  field visualization, SVG via `react-native-svg`), `icons.tsx` (the
  design system's mirrored Lucide icon paths, rendered via `SvgXml`),
  `brand.tsx` (logo mark, wordmark, field-bloom splash art).
- **Screens**: `src/screens/auth`, `src/screens/onboarding`,
  `src/screens/tabs`, plus `PaywallScreen.tsx` — one file per screen in the
  original JSX prototype.

## What's intentionally not bundled

This session imported the design system through a design-import tool capped
at reading 256KB per file. Three kinds of binary assets in the source project
exceed that cap and could not be pulled in full:

- **Mudra hand photos** (`mudras/*.png`, 24 files). `YouTab`'s mudra screen
  renders a chakra-colored bija glyph in their place — see the comment at the
  top of `screens/tabs/YouTab.tsx`.
- **Frequency library audio** (`uploads/*.wav`, 26 files). `SoundTab` renders
  the full catalog, filtering and metadata included, but `data/sounds.ts`'s
  `SOUND_ASSETS` map is empty, so playback no-ops. See that file's header
  comment.
- **SN Pro variable font** (`fonts/SNPro-VariableFont_wght.ttf`) — also
  skipped, but for a different reason: the design manifest marks it
  `"status": "unreferenced"` (no token in `colors_and_type.css` actually
  points at it), so nothing in the ported UI needs it.

To fill these in: open the design project in claude.ai/design, export the
assets, and drop them under `assets/mudras/`, `assets/sounds/`, and
`assets/fonts/` respectively (wiring points are called out at each spot
above).

Everything else — logo/wordmark/field-bloom SVGs, all Lucide icon path data,
every design token, and all five tabs' copy and layout — was ported in full.

## Running it

```bash
cd mobile/chakraos
npm install   # already done in this session; re-run after pulling
npm start     # or: npm run ios / npm run android / npm run web
```

Since this uses `expo-audio` and `expo-blur` (native modules), **Expo Go**
won't have them pre-bundled — use a development build
(`npx expo run:ios` / `npx expo run:android`, or an EAS development build)
per `AGENTS.md`.

Verified in this session (no simulator/device available in the sandbox):
`npx tsc --noEmit`, `npx expo lint`, and `npx expo export --platform ios`
(Metro bundles all 798 modules cleanly).

## Known simplifications vs. the source prototype

- SVG blur filters (`feGaussianBlur`) aren't reliably cross-platform in
  `react-native-svg`, so glow halos on the field nodes use layered
  flat-opacity circles instead.
- The one-shot "tap ripple" animation on field nodes and the live
  per-node caption overlay were dropped for scope; the underlying data
  (energy, trend) is still fully there in `FieldCanvas`'s props.
- "Export my data" and "Delete everything" in the You tab use `Alert`
  rather than a real file export — the original browser prototype used
  `Blob` + `<a download>`, which has no RN equivalent without adding
  `expo-file-system`/`expo-sharing`.
- Time-of-day pickers (onboarding reminder time) are plain text inputs
  rather than a native time picker, to avoid an extra dependency.
