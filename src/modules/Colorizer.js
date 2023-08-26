"use strict";

import Clutter from "gi://Clutter";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import { ModuleBase } from "./ModuleBase.js";
import { ColorTone } from "../model/ColorTone.js";
import { loopRun, logDebug } from "../utils.js";

const UiGroup = Main.layoutManager.uiGroup;

const COLORIZE_EFFECT_NAME = "bedtime-mode-colorize-effect";
const DESATURATE_EFFECT_NAME = "bedtime-mode-desaturate-effect";

export class Colorizer extends ModuleBase {
  #transitions;
  #transitionDelay;

  #transitionStep;
  #transitionLoopSource;

  #colorTone;
  #colorizeEffect;
  #desaturateEffect;

  constructor(extension) {
    super(extension);

    this.#transitions = this.extension.settings.colorToneFactor;
    this.#transitionDelay = 25;

    this.#transitionStep = 0;

    this.#colorTone = new ColorTone(this.extension.settings.colorTonePreset, 0);
    this.#colorizeEffect = new Clutter.BrightnessContrastEffect();

    this.#desaturateEffect = new Clutter.DesaturateEffect();
    this.#desaturateEffect.factor = 0;
  }

  enable() {
    this.#createConnections();

    this.extension.settings.bedtimeModeActive && this.#turnOn();
  }

  disable() {
    this.extension.settings.bedtimeModeActive ? this.#turnOff() : this.#cleanUp();
  }

  #createConnections() {
    logDebug("Creating connections for Colorizer...");

    this.createConnection(this.extension.settings, "bedtime-mode-active-changed", this.onBedtimeModeActiveChanged.name);
    this.createConnection(this.extension.settings, "color-tone-preset-changed", this.onColorTonePresetChanged.name);
    this.createConnection(this.extension.settings, "color-tone-factor-changed", this.onColorToneFactorChanged.name);
  }

  onBedtimeModeActiveChanged(_settings, _bedtimeModeActive) {
    _bedtimeModeActive ? this.#turnOn() : this.#turnOff();
  }

  onColorTonePresetChanged() {
    this.#colorTone = new ColorTone(this.extension.settings.colorTonePreset, this.extension.settings.colorToneFactor);
    this.#updateEffectsFactor();
  }

  onColorToneFactorChanged() {
    this.#transitions = this.extension.settings.colorToneFactor;

    if (this.#transitionInProgress()) return;

    if (this.extension.settings.bedtimeModeActive) this.#transitionStep = this.#transitions;

    this.#updateEffectsFactor();
  }

  #turnOn() {
    logDebug("Turning on Colorizer...");

    this.#destroyTransitionLoopSource();
    this.#addColorEffects();

    this.#transitionLoopSource = loopRun(this.#smoothOn.bind(this), this.#transitionDelay);
  }

  #turnOff() {
    logDebug("Turning off Colorizer...");

    this.#destroyTransitionLoopSource();

    this.#transitionLoopSource = loopRun(this.#smoothOff.bind(this), this.#transitionDelay);
  }

  #smoothOn() {
    this.#transitionStep < this.#transitions && this.#transitionStep++;
    this.#updateEffectsFactor();

    return this.#transitionStep < this.#transitions || this.#destroyTransitionLoopSource();
  }

  #smoothOff() {
    this.#transitionStep > 0 && this.#transitionStep--;
    this.#updateEffectsFactor();

    return this.#transitionStep > 0 || this.#cleanUp();
  }

  #updateEffectsFactor() {
    this.#colorTone.toneFactor = this.#transitionStep;
    this.#desaturateEffect.factor = this.#transitionStep / 100;

    this.#updateColorizeEffect();
  }

  #addColorEffects() {
    UiGroup.get_effect(COLORIZE_EFFECT_NAME) || UiGroup.add_effect_with_name(COLORIZE_EFFECT_NAME, this.#colorizeEffect);
    UiGroup.get_effect(DESATURATE_EFFECT_NAME) || UiGroup.add_effect_with_name(DESATURATE_EFFECT_NAME, this.#desaturateEffect);

    this.#updateColorizeEffect();
  }

  #updateColorizeEffect() {
    this.#colorizeEffect.brightness = this.#colorTone.brightnessColor;
    this.#colorizeEffect.contrast = this.#colorTone.contrastColor;
  }

  #removeColorEffects() {
    UiGroup.get_effect(COLORIZE_EFFECT_NAME) && UiGroup.remove_effect_by_name(COLORIZE_EFFECT_NAME);
    UiGroup.get_effect(DESATURATE_EFFECT_NAME) && UiGroup.remove_effect_by_name(DESATURATE_EFFECT_NAME);
  }

  #transitionInProgress() {
    return this.#transitionLoopSource != null;
  }

  #destroyTransitionLoopSource() {
    if (this.#transitionLoopSource) {
      logDebug(`Destroying Transition Loop Source ${this.#transitionLoopSource.get_id()}`);

      this.#transitionLoopSource.destroy();
      this.#transitionLoopSource = null;
    }
  }

  #cleanUp() {
    logDebug("Cleaning up Colorizer related changes...");
    this.#removeColorEffects();
    this.#destroyTransitionLoopSource();
  }
}
