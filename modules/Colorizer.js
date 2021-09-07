"use strict";

const { Clutter } = imports.gi;
const UiGroup = imports.ui.main.layoutManager.uiGroup;

const Me = imports.misc.extensionUtils.getCurrentExtension();

const extension = Me.imports.extension;

const { ColorTone } = Me.imports.modules.ColorTone;
const { loopRun, logDebug } = Me.imports.utils;

const COLORIZE_EFFECT_NAME = "bedtime-mode-colorize-effect";
const DESATURATE_EFFECT_NAME = "bedtime-mode-desaturate-effect";

var Colorizer = class {
  constructor() {
    this._transitions = extension.settings.colorToneFactor;
    this._transitionDelayMillis = 25;

    this._transitionStep = 0;
    this._transitionLoopSource = null;

    this._colorTone = new ColorTone(extension.settings.colorTonePreset, 0);
    this._colorizeEffect = new Clutter.BrightnessContrastEffect();

    this._desaturateEffect = new Clutter.DesaturateEffect();
    this._desaturateEffect.factor = 0;
  }

  enable() {
    this._createConnections();

    extension.settings.bedtimeModeActive && this._turnOn();
  }

  disable() {
    extension.settings.bedtimeModeActive ? this._turnOff() : this._cleanUp();
  }

  _createConnections() {
    logDebug("Creating connections for Colorizer...");

    extension.signalManager.connect(this, extension.settings, "bedtime-mode-active-changed", this._onBedtimeModeActiveChanged.name);
    extension.signalManager.connect(this, extension.settings, "color-tone-preset-changed", this._onColorTonePresetChanged.name);
    extension.signalManager.connect(this, extension.settings, "color-tone-factor-changed", this._onColorToneFactorChanged.name);
  }

  _onBedtimeModeActiveChanged(_settings, _bedtimeModeActive) {
    _bedtimeModeActive ? this._turnOn() : this._turnOff();
  }

  _onColorTonePresetChanged() {
    this._colorTone = new ColorTone(extension.settings.colorTonePreset, extension.settings.colorToneFactor);
    this._updateEffectsFactor();
  }

  _onColorToneFactorChanged() {
    this._transitions = extension.settings.colorToneFactor;

    if (this._transitionInProgress()) return;

    if (extension.settings.bedtimeModeActive) this._transitionStep = this._transitions;

    this._updateEffectsFactor();
  }

  _turnOn() {
    logDebug("Turning on Colorizer...");

    this._destroyTransitionLoopSource();
    this._addColorEffects();

    this._transitionLoopSource = loopRun(this._smoothOn.bind(this), this._transitionDelayMillis);
  }

  _turnOff() {
    logDebug("Turning off Colorizer...");

    this._destroyTransitionLoopSource();

    this._transitionLoopSource = loopRun(this._smoothOff.bind(this), this._transitionDelayMillis);
  }

  _smoothOn() {
    this._transitionStep < this._transitions && this._transitionStep++;
    this._updateEffectsFactor();

    return this._transitionStep < this._transitions || this._destroyTransitionLoopSource();
  }

  _smoothOff() {
    this._transitionStep > 0 && this._transitionStep--;
    this._updateEffectsFactor();

    return this._transitionStep > 0 || this._cleanUp();
  }

  _updateEffectsFactor() {
    this._colorTone.toneFactor = this._transitionStep;
    this._desaturateEffect.factor = this._transitionStep / 100;

    this._updateColorizeEffect();
  }

  _addColorEffects() {
    UiGroup.get_effect(COLORIZE_EFFECT_NAME) || UiGroup.add_effect_with_name(COLORIZE_EFFECT_NAME, this._colorizeEffect);
    UiGroup.get_effect(DESATURATE_EFFECT_NAME) || UiGroup.add_effect_with_name(DESATURATE_EFFECT_NAME, this._desaturateEffect);

    this._updateColorizeEffect();
  }

  _updateColorizeEffect() {
    this._colorizeEffect.brightness = this._colorTone.brightnessColor;
    this._colorizeEffect.contrast = this._colorTone.contrastColor;
  }

  _removeColorEffects() {
    UiGroup.get_effect(COLORIZE_EFFECT_NAME) && UiGroup.remove_effect_by_name(COLORIZE_EFFECT_NAME);
    UiGroup.get_effect(DESATURATE_EFFECT_NAME) && UiGroup.remove_effect_by_name(DESATURATE_EFFECT_NAME);
  }

  _transitionInProgress() {
    return this._transitionLoopSource != null;
  }

  _destroyTransitionLoopSource() {
    if (this._transitionLoopSource) {
      logDebug(`Destroying Transition Loop Source ${this._transitionLoopSource.get_id()}`);

      this._transitionLoopSource.destroy();
      this._transitionLoopSource = null;
    }
  }

  _cleanUp() {
    logDebug("Cleaning up Colorizer related changes...");
    this._removeColorEffects();
    this._destroyTransitionLoopSource();
  }
};
