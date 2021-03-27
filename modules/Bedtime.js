const Main = imports.ui.main;
const { GLib, Clutter } = imports.gi;

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const { runAtInterval, logDebug } = Me.imports.utils;
const extension = Me.imports.extension;

var Bedtime = class {
  constructor() {
    this._transitions = 50;
    this._transitionDelayMillis = 50;

    this._transitionStep = 0;
    this._transitionTimerId = null;

    this._colorEffect = new Clutter.DesaturateEffect();
    this._colorEffect.factor = 0;
  }

  enable() {
    this._connectSettings();
    if (extension.settings.bedtimeModeActive) this._turnOn();
  }

  disable() {
    this._disconnectSettings();
    if (extension.settings.bedtimeModeActive) this._turnOff();

    this._cleanUp();
  }

  _connectSettings() {
    logDebug("Connecting Bedtime to settings...");
    this._bedtimeModeActiveConnect = extension.settings.connect("bedtime-mode-active-changed", this._onBedtimeModeActiveChanged.bind(this));
  }

  _disconnectSettings() {
    if (this._bedtimeModeActiveConnect) {
      extension.settings.disconnect(this._bedtimeModeActiveConnect);
      this._bedtimeModeActiveConnect = null;
    }
    logDebug("Disconnected Bedtime from settings.");
  }

  _onBedtimeModeActiveChanged(_settings, bedtimeModeActive) {
    bedtimeModeActive ? this._turnOn() : this._turnOff();
  }

  _turnOn() {
    logDebug("Turning on bedtime mode...");

    this._transitionStep = 0;
    this._transitionTimerId = runAtInterval(this._smoothOn.bind(this), this._transitionDelayMillis);
  }

  _turnOff() {
    logDebug("Turning off bedtime mode...");

    this._transitionStep = this._transitions;
    this._transitionTimerId = runAtInterval(this._smoothOff.bind(this), this._transitionDelayMillis);
  }

  _smoothOn() {
    this._transitionStep++;
    this._addColorEffect();

    return this._transitionStep < this._transitions;
  }

  _smoothOff() {
    this._transitionStep--;
    this._addColorEffect();

    return this._transitionStep > 0;
  }

  _addColorEffect() {
    this._colorEffect.factor = this._transitionStep / this._transitions;

    Main.uiGroup.add_effect(this._colorEffect);
  }

  _removeColorEffect() {
    Main.uiGroup.remove_effect(this._colorEffect);
    this._colorEffect = null;
  }

  _disableTransitionTimer() {
    if (this._transitionTimerId) {
      GLib.Source.remove(this._transitionTimerId);
      this._transitionTimerId = null;
    }
  }

  _cleanUp() {
    logDebug("Cleaning up bedtime related changes...");
    this._removeColorEffect();
    this._disableTransitionTimer();
  }
};
