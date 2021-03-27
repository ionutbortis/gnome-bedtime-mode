const Main = imports.ui.main;
const { GLib, Clutter } = imports.gi;

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const extension = Me.imports.extension;
const { runAtInterval, logDebug } = Me.imports.utils;

var Bedtime = class {
  constructor() {
    this._transitions = 50;

    this._transitionDelayMillis = 50;

    this._colorEffect = new Clutter.DesaturateEffect();
    this._colorEffect.factor = 0;

    this._transitionStep = 0;
    this._transitionTimerId = null;
  }

  enable() {
    this._turnOn();
  }

  disable() {
    this._turnOff();
  }

  _turnOn() {
    this._transitionStep = 0;
    this._transitionTimerId = runAtInterval(this._smoothOn.bind(this), this._transitionDelayMillis);
  }

  _turnOff() {
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

    if (this._transitionStep > 0) return true;
    else this._cleanUp();
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
