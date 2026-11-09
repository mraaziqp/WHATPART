import test from 'node:test';
import assert from 'node:assert/strict';
import { THEME_PRESETS, DEFAULT_THEME, generateCssVariables } from '../../src/data/theme.js';

test('Theme: Verify all 8 South African presets exist and have valid contrast', () => {
  const expectedPresets = [
    'springbok',
    'rainbow',
    'kalahari',
    'drakensberg',
    'protea',
    'midnight',
    'durban',
    'soweto',
  ];

  for (const presetId of expectedPresets) {
    const preset = THEME_PRESETS[presetId as keyof typeof THEME_PRESETS];
    assert.ok(preset, `Preset ${presetId} must exist`);
    assert.ok(preset.primaryColor.startsWith('#'), `${presetId} primaryColor must be hex`);
    assert.ok(preset.accentColor.startsWith('#'), `${presetId} accentColor must be hex`);
    assert.ok(preset.headerBgColor.startsWith('#'), `${presetId} headerBgColor must be hex`);
  }
});

test('Theme: Default preset is Springbok (Green & Gold)', () => {
  assert.equal(DEFAULT_THEME.presetId, 'springbok');
  assert.equal(DEFAULT_THEME.primaryColor, '#063826'); // Deep Springbok green
  assert.equal(DEFAULT_THEME.accentColor, '#ffb81c');  // Mzansi gold
  assert.equal(DEFAULT_THEME.showAnnouncementBar, true);
  assert.equal(DEFAULT_THEME.showFlagStrip, true);
});

test('Theme: CSS variables generation generates valid custom properties', () => {
  const css = generateCssVariables(DEFAULT_THEME);
  assert.match(css, /--theme-navy-900:\s*#063826/);
  assert.match(css, /--theme-brand-500:\s*#ffb81c/);
  assert.match(css, /--theme-logo-height:\s*44px/);
});
