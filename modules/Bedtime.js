"use strict";

const { GLib, Clutter } = imports.gi;
const UiGroup = imports.ui.main.layoutManager.uiGroup;

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const extension = Me.imports.extension;
const { loopRun, logDebug } = Me.imports.utils;

const EFFECT_NAME = "bedtime-mode-desaturate-effect";

var Bedtime = class {
  constructor() {
    this._transitions = 100;
    this._transitionDelayMillis = 25;

    this._transitionStep = 0;
    this._transitionLoopSource = null;

    this._colorEffect = new Clutter.DesaturateEffect();
    this._colorEffect.factor = 0;

    this._bedtimeModeActiveConnect = null;
  }

  enable() {
    this._connectSettings();

    extension.settings.bedtimeModeActive && this._turnOn();
  }

  disable() {
    this._disconnectSettings();

    extension.settings.bedtimeModeActive ? this._turnOff() : this._cleanUp();
  }

  _connectSettings() {
    logDebug("Connecting Bedtime to settings...");

    this._bedtimeModeActiveConnect = extension.settings.connect("bedtime-mode-active-changed", this._onBedtimeModeActiveChanged.bind(this));
  }

  _disconnectSettings() {
    logDebug("Disconnecting Bedtime from settings...");

    extension.settings.disconnect(this._bedtimeModeActiveConnect);
  }

  _onBedtimeModeActiveChanged(_settings, _bedtimeModeActive) {
    _bedtimeModeActive ? this._turnOn() : this._turnOff();
  }

  _turnOn() {
    logDebug("Turning on Bedtime Mode...");

    this._destroyTransitionLoopSource();
    this._addColorEffect();

    this._transitionLoopSource = loopRun(this._smoothOn.bind(this), this._transitionDelayMillis);
  }

  _turnOff() {
    logDebug("Turning off Bedtime Mode...");

    this._destroyTransitionLoopSource();

    this._transitionLoopSource = loopRun(this._smoothOff.bind(this), this._transitionDelayMillis);
  }

  _smoothOn() {
    this._transitionStep < this._transitions && this._transitionStep++;
    this._changeEffectFactor();

    return this._transitionStep < this._transitions || this._destroyTransitionLoopSource();
  }

  _smoothOff() {
    this._transitionStep > 0 && this._transitionStep--;
    this._changeEffectFactor();

    return this._transitionStep > 0 || this._cleanUp();
  }

  _changeEffectFactor() {
    this._colorEffect.factor = this._transitionStep / this._transitions;
  }

  _addColorEffect() {
    UiGroup.get_effect(EFFECT_NAME) || UiGroup.add_effect_with_name(EFFECT_NAME, this._colorEffect);
  }

  _removeColorEffect() {
    UiGroup.get_effect(EFFECT_NAME) && UiGroup.remove_effect_by_name(EFFECT_NAME);
  }

  _destroyTransitionLoopSource() {
    if (this._transitionLoopSource) {
      logDebug(`Destroying Transition Loop Source ${this._transitionLoopSource.get_id()}`);

      this._transitionLoopSource.destroy();
      this._transitionLoopSource = null;
    }
  }

  _cleanUp() {
    logDebug("Cleaning up Bedtime Mode related changes...");
    this._removeColorEffect();
    this._destroyTransitionLoopSource();
  }
};
