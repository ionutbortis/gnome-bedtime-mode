"use strict";

const Main = imports.ui.main;
const { GLib, Clutter } = imports.gi;

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const { loopRun, logDebug } = Me.imports.utils;
const extension = Me.imports.extension;

var Bedtime = class {
  constructor() {
    this._transitions = 50;
    this._transitionDelayMillis = 50;

    this._transitionStep = 0;
    this._transitionTimerId = null;

    this._colorEffect = new Clutter.DesaturateEffect();
    this._colorEffect.factor = 0;

    this._bedtimeModeActiveConnect = null;
  }

  enable() {
    this._connectSettings();
    this._addColorEffect();

    extension.settings.bedtimeModeActive && this._turnOn();
  }

  disable() {
    this._disconnectSettings();
    this._cleanUp();
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

    this._transitionStep = 0;
    this._transitionTimerId = loopRun(this._smoothOn.bind(this), this._transitionDelayMillis);
  }

  _turnOff() {
    logDebug("Turning off Bedtime Mode...");

    this._transitionStep = this._transitions;
    this._transitionTimerId = loopRun(this._smoothOff.bind(this), this._transitionDelayMillis);
  }

  _smoothOn() {
    if (this._transitionStep < this._transitions) this._transitionStep++;
    this._changeEffectFactor();

    return this._transitionStep < this._transitions;
  }

  _smoothOff() {
    if (this._transitionStep > 0) this._transitionStep--;
    this._changeEffectFactor();

    return this._transitionStep > 0;
  }

  _changeEffectFactor() {
    this._colorEffect.factor = this._transitionStep / this._transitions;
  }

  _addColorEffect() {
    Main.uiGroup.add_effect(this._colorEffect);
  }

  _removeColorEffect() {
    Main.uiGroup.remove_effect(this._colorEffect);
    this._colorEffect = null;
  }

  _removeTransitionTimer() {
    if (this._transitionTimerId) {
      GLib.Source.remove(this._transitionTimerId);
      this._transitionTimerId = null;
    }
  }

  _cleanUp() {
    logDebug("Cleaning up Bedtime Mode related changes...");
    this._removeColorEffect();
    this._removeTransitionTimer();
  }
};
