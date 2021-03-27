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

    this._color_effect = new Clutter.DesaturateEffect();
    this._color_effect.factor = 0;

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
    this._addEffect();

    return this._transitionStep < this._transitions;
  }

  _smoothOff() {
    this._transitionStep--;
    this._addEffect();

    if (this._transitionStep > 0) return true;
    else this._cleanUp();
  }

  _addEffect() {
    this._color_effect.factor = this._transitionStep / this._transitions;

    Main.uiGroup.add_effect(this._color_effect);
  }

  _removeEffect() {
    Main.uiGroup.remove_effect(this._color_effect);
  }

  _disableTransitionTimer() {
    if (this._transitionTimerId) {
      GLib.Source.remove(this._transitionTimerId);
      this._transitionTimerId = null;
    }
  }

  _cleanUp() {
    logDebug("Bedtime mode cleanup...");
    this._removeEffect();
    this._disableTransitionTimer();
  }
};
