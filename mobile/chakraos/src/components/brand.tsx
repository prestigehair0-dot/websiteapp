// Brand marks — ported verbatim from assets/logo/*.svg and assets/imagery/field-bloom.svg.
import React from 'react';
import { SvgXml } from 'react-native-svg';

const MANDALA_XML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
  <circle cx="32" cy="32" r="29" stroke="#22D3EE" stroke-width="1" opacity="0.35"></circle>
  <circle cx="32" cy="32" r="22" stroke="#22D3EE" stroke-width="0.6" opacity="0.18"></circle>
  <line x1="32" y1="6" x2="32" y2="58" stroke="#22D3EE" stroke-width="0.6" opacity="0.25"></line>
  <circle cx="32" cy="58" r="1.6" fill="#78350F"></circle>
  <circle cx="32" cy="52" r="2.2" fill="#F43F5E"></circle>
  <circle cx="32" cy="46" r="2.2" fill="#FB923C"></circle>
  <circle cx="32" cy="40" r="2.4" fill="#FBBF24"></circle>
  <circle cx="32" cy="32" r="3.2" fill="#4ADE80"></circle>
  <circle cx="32" cy="24" r="2.4" fill="#22D3EE"></circle>
  <circle cx="32" cy="18" r="2.2" fill="#6366F1"></circle>
  <circle cx="32" cy="12" r="2.2" fill="#A855F7"></circle>
  <circle cx="32" cy="6" r="1.6" fill="#E0E7FF"></circle>
  <circle cx="32" cy="32" r="5.5" stroke="#4ADE80" stroke-width="0.5" opacity="0.5"></circle>
</svg>`;

const WORDMARK_XML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 64" width="320" height="64" fill="none">
  <g transform="translate(4,4) scale(0.875)">
    <circle cx="32" cy="32" r="29" stroke="#22D3EE" stroke-width="1" opacity="0.35"></circle>
    <line x1="32" y1="6" x2="32" y2="58" stroke="#22D3EE" stroke-width="0.6" opacity="0.25"></line>
    <circle cx="32" cy="58" r="1.6" fill="#78350F"></circle>
    <circle cx="32" cy="52" r="2.2" fill="#F43F5E"></circle>
    <circle cx="32" cy="46" r="2.2" fill="#FB923C"></circle>
    <circle cx="32" cy="40" r="2.4" fill="#FBBF24"></circle>
    <circle cx="32" cy="32" r="3.2" fill="#4ADE80"></circle>
    <circle cx="32" cy="24" r="2.4" fill="#22D3EE"></circle>
    <circle cx="32" cy="18" r="2.2" fill="#6366F1"></circle>
    <circle cx="32" cy="12" r="2.2" fill="#A855F7"></circle>
    <circle cx="32" cy="6" r="1.6" fill="#E0E7FF"></circle>
  </g>
  <text x="74" y="42" font-family="Outfit, system-ui, sans-serif" font-size="34" font-weight="300" letter-spacing="-1.5" fill="#F8FAFC">chakra<tspan font-weight="600" fill="#22D3EE">OS</tspan></text>
  <circle cx="84" cy="50" r="1.4" fill="#22D3EE"></circle>
</svg>`;

const FIELD_BLOOM_XML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="bloom-core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4ADE80" stop-opacity="0.85"></stop>
      <stop offset="35%" stop-color="#22D3EE" stop-opacity="0.55"></stop>
      <stop offset="70%" stop-color="#6366F1" stop-opacity="0.25"></stop>
      <stop offset="100%" stop-color="#020408" stop-opacity="0"></stop>
    </radialGradient>
    <radialGradient id="bloom-outer" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#A855F7" stop-opacity="0.18"></stop>
      <stop offset="100%" stop-color="#020408" stop-opacity="0"></stop>
    </radialGradient>
    <radialGradient id="bloom-warm" cx="50%" cy="62%" r="35%">
      <stop offset="0%" stop-color="#FB923C" stop-opacity="0.25"></stop>
      <stop offset="100%" stop-color="#020408" stop-opacity="0"></stop>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="#020408"></rect>
  <rect width="600" height="600" fill="url(#bloom-outer)"></rect>
  <rect width="600" height="600" fill="url(#bloom-core)"></rect>
  <rect width="600" height="600" fill="url(#bloom-warm)"></rect>
  <g opacity="0.9">
    <circle cx="300" cy="540" r="3" fill="#78350F"></circle>
    <circle cx="300" cy="475" r="4" fill="#F43F5E"></circle>
    <circle cx="300" cy="410" r="4" fill="#FB923C"></circle>
    <circle cx="300" cy="345" r="4.5" fill="#FBBF24"></circle>
    <circle cx="300" cy="300" r="6" fill="#4ADE80"></circle>
    <circle cx="300" cy="240" r="4.5" fill="#22D3EE"></circle>
    <circle cx="300" cy="180" r="4" fill="#6366F1"></circle>
    <circle cx="300" cy="120" r="4" fill="#A855F7"></circle>
    <circle cx="300" cy="60" r="3" fill="#E0E7FF"></circle>
  </g>
</svg>`;

export function MandalaMark({ size = 64 }: { size?: number }) {
  return <SvgXml xml={MANDALA_XML} width={size} height={size} />;
}

export function Wordmark({ width = 320, height = 64 }: { width?: number; height?: number }) {
  return <SvgXml xml={WORDMARK_XML} width={width} height={height} />;
}

export function FieldBloom({ size = 600 }: { size?: number }) {
  return <SvgXml xml={FIELD_BLOOM_XML} width={size} height={size} />;
}
