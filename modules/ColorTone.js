"use strict";

const { Clutter } = imports.gi;

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata["gettext-domain"]);
const _ = Gettext.gettext;

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
    return Math.round(127 + ((colorValue - 127) * this._getFactorInExpectedFormat()) / 255);
  }

  _getFactorInExpectedFormat() {
    return this._toneFactor * 2.55;
  }

  _findPreset(presetId) {
    const preset = PRESETS.find(({ id }) => id === presetId);

    if (preset) return preset;
    else throw new Error(`Color Tone Preset id '${presetId}' is not configured`);
  }
};

var PRESETS = [
  {
    id: "grayscale",
    displayName: _("Grayscale"),
    brightness: { red: 127, green: 127, blue: 127, alpha: 255 },
    contrast: { red: 127, green: 127, blue: 127, alpha: 255 },
  },
  {
    id: "amber",
    displayName: _("Amber"),
    brightness: { red: 143, green: 71, blue: 0, alpha: 255 },
    contrast: { red: 143, green: 135, blue: 127, alpha: 255 },
  },
  {
    id: "green",
    displayName: _("Green"),
    brightness: { red: 63, green: 127, blue: 0, alpha: 255 },
    contrast: { red: 127, green: 127, blue: 127, alpha: 255 },
  },
  {
    id: "cyan",
    displayName: _("Cyan"),
    brightness: { red: 0, green: 127, blue: 143, alpha: 255 },
    contrast: { red: 127, green: 127, blue: 143, alpha: 255 },
  },
  {
    id: "sepia",
    displayName: _("Sepia"),
    brightness: { red: 143, green: 127, blue: 95, alpha: 255 },
    contrast: { red: 143, green: 127, blue: 127, alpha: 255 },
  },
];
