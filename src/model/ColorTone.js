"use strict";

import Clutter from "gi://Clutter";

import { ColorTones as ColorTonePresets } from "./Presets.js";

export class ColorTone {
  #toneFactor;
  #preset;

  #brightnessColor;
  #contrastColor;

  constructor(presetId, toneFactor) {
    this.#toneFactor = toneFactor;

    this.#preset = this.#findPreset(presetId);

    this.#brightnessColor = new Clutter.Color(this.#preset.brightness);
    this.#contrastColor = new Clutter.Color(this.#preset.contrast);
  }

  get brightnessColor() {
    return this.#applyToneFactor(this.#brightnessColor.copy());
  }

  get contrastColor() {
    return this.#applyToneFactor(this.#contrastColor.copy());
  }

  set toneFactor(value) {
    this.#toneFactor = value;
  }

  #applyToneFactor(color) {
    color.red = this.#computeByFactor(color.red);
    color.green = this.#computeByFactor(color.green);
    color.blue = this.#computeByFactor(color.blue);

    return color;
  }

  #computeByFactor(colorValue) {
    return Math.round(127 + ((colorValue - 127) * this.#toneFactor) / 100);
  }

  #findPreset(presetId) {
    const preset = ColorTonePresets.find(({ id }) => id === presetId);

    if (!preset) throw new Error(`Color Tone Preset id '${presetId}' is not configured`);

    return preset;
  }
}
