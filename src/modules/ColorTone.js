"use strict";

const { Clutter } = imports.gi;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;

const ColorTonePresets = Me.imports.modules.Presets.ColorTones;

var ColorTone = class {
  constructor(presetId, toneFactor) {
    this._toneFactor = toneFactor;

    this._preset = this._findPreset(presetId);

    this._brightnessColor = new Clutter.Color(this._preset.brightness);
    this._contrastColor = new Clutter.Color(this._preset.contrast);
  }

  get brightnessColor() {
    return this._applyToneFactor(this._brightnessColor.copy());
  }

  get contrastColor() {
    return this._applyToneFactor(this._contrastColor.copy());
  }

  set toneFactor(value) {
    this._toneFactor = value;
  }

  _applyToneFactor(color) {
    color.red = this._computeByFactor(color.red);
    color.green = this._computeByFactor(color.green);
    color.blue = this._computeByFactor(color.blue);

    return color;
  }

  _computeByFactor(colorValue) {
    return Math.round(127 + ((colorValue - 127) * this._toneFactor) / 100);
  }

  _findPreset(presetId) {
    const preset = ColorTonePresets.find(({ id }) => id === presetId);

    if (!preset) throw new Error(`Color Tone Preset id '${presetId}' is not configured`);

    return preset;
  }
};
