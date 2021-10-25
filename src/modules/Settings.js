"use strict";

const Signals = imports.signals;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();

const { SignalManager } = Me.imports.modules.SignalManager;
const { logDebug } = Me.imports.utils;

var Settings = class {
  constructor(signalManager) {
    this._signalManager = signalManager;

    this.gSettings = ExtensionUtils.getSettings();
  }

  enable() {
    this._createConnections();
  }

  _createConnections() {
    logDebug("Creating connections for Settings...");

    this._createConnection("bedtime-mode-active", this._onBedtimeModeActiveChanged.name);
    this._createConnection("automatic-schedule", this._onAutomaticScheduleChanged.name);
    this._createConnection("ondemand-button-visibility", this._onButtonVisibilityChanged.name);
    this._createConnection("ondemand-button-location", this._onButtonLocationChanged.name);
    this._createConnection("ondemand-button-bar-manual-position", this._onButtonBarManualPositionChanged.name);
    this._createConnection("ondemand-button-bar-position-value", this._onButtonBarPositionValueChanged.name);
    this._createConnection("ondemand-button-bar-onoff-indicator", this._onButtonBarOnOffIndicatorChanged.name);
    this._createConnection("ondemand-button-bar-scroll-enabled", this._onButtonBarScrollEnabledChanged.name);
    this._createConnection("schedule-start-hours", this._onScheduleTimesChanged.name);
    this._createConnection("schedule-start-minutes", this._onScheduleTimesChanged.name);
    this._createConnection("schedule-end-hours", this._onScheduleTimesChanged.name);
    this._createConnection("schedule-end-minutes", this._onScheduleTimesChanged.name);
    this._createConnection("color-tone-preset", this._onColorTonePresetChanged.name);
    this._createConnection("color-tone-factor", this._onColorToneFactorChanged.name);
  }

  _createConnection(settingsKey, handlerName) {
    this._signalManager.connect(this, this.gSettings, `changed::${settingsKey}`, handlerName);
  }

  disable() {
    this._signalManager = null;
    this.gSettings = null;
  }

  get bedtimeModeActive() {
    return this.gSettings.get_boolean("bedtime-mode-active");
  }

  set bedtimeModeActive(value) {
    value !== this.bedtimeModeActive && this.gSettings.set_boolean("bedtime-mode-active", value);
  }

  get automaticSchedule() {
    return this.gSettings.get_boolean("automatic-schedule");
  }

  set automaticSchedule(value) {
    value !== this.automaticSchedule && this.gSettings.set_boolean("automatic-schedule", value);
  }

  get buttonBarManualPosition() {
    return this.gSettings.get_boolean("ondemand-button-bar-manual-position");
  }

  get buttonBarPositionValue() {
    return this.gSettings.get_int("ondemand-button-bar-position-value");
  }

  get buttonBarOnOffIndicator() {
    return this.gSettings.get_boolean("ondemand-button-bar-onoff-indicator");
  }

  get buttonBarScrollEnabled() {
    return this.gSettings.get_boolean("ondemand-button-bar-scroll-enabled");
  }

  get buttonLocation() {
    return this.gSettings.get_string("ondemand-button-location");
  }

  get buttonVisibility() {
    return this.gSettings.get_string("ondemand-button-visibility");
  }

  get scheduleStartHours() {
    return this.gSettings.get_int("schedule-start-hours");
  }

  get scheduleStartMinutes() {
    return this.gSettings.get_int("schedule-start-minutes");
  }

  get scheduleEndHours() {
    return this.gSettings.get_int("schedule-end-hours");
  }

  get scheduleEndMinutes() {
    return this.gSettings.get_int("schedule-end-minutes");
  }

  get colorTonePreset() {
    return this.gSettings.get_string("color-tone-preset");
  }

  get colorToneFactor() {
    return this.gSettings.get_int("color-tone-factor");
  }

  set colorToneFactor(value) {
    value !== this.colorToneFactor && this.gSettings.set_int("color-tone-factor", value);
  }

  _onBedtimeModeActiveChanged() {
    logDebug(`Bedtime Mode Active changed to '${this.bedtimeModeActive}'`);
    this.emit("bedtime-mode-active-changed", this.bedtimeModeActive);
  }

  _onAutomaticScheduleChanged() {
    logDebug(`Automatic Schedule changed to '${this.automaticSchedule}'`);
    this.emit("automatic-schedule-changed", this.automaticSchedule);
  }

  _onButtonLocationChanged() {
    logDebug(`Button Location changed to '${this.buttonLocation}'`);
    this.emit("button-location-changed", this.buttonLocation);
  }

  _onButtonVisibilityChanged() {
    logDebug(`Button Visibility changed to '${this.buttonVisibility}'`);
    this.emit("button-visibility-changed", this.buttonVisibility);
  }

  _onButtonBarManualPositionChanged() {
    logDebug(`Button Bar Manual Position changed to '${this.buttonBarManualPosition}'`);
    this.emit("button-bar-manual-position-changed", this.buttonBarManualPosition);
  }

  _onButtonBarPositionValueChanged() {
    logDebug(`Button Bar Position Value changed to '${this.buttonBarPositionValue}'`);
    this.emit("button-bar-position-value-changed", this.buttonBarPositionValue);
  }

  _onButtonBarOnOffIndicatorChanged() {
    logDebug(`Button Bar On/Off Indicator changed to '${this.buttonBarOnOffIndicator}'`);
    this.emit("button-bar-onoff-indicator-changed", this.buttonBarOnOffIndicator);
  }

  _onButtonBarScrollEnabledChanged() {
    logDebug(`Button Bar Scroll Enabled changed to '${this.buttonBarScrollEnabled}'`);
    this.emit("button-bar-scroll-enabled-changed", this.buttonBarScrollEnabled);
  }

  _onScheduleTimesChanged() {
    const start = `Start=${this.scheduleStartHours}:${this.scheduleStartMinutes}`;
    const end = `End=${this.scheduleEndHours}:${this.scheduleEndMinutes}`;
    logDebug(`Schedule Times changed to: ${start} ${end}`);

    this.emit("schedule-times-changed", {});
  }

  _onColorTonePresetChanged() {
    logDebug(`Color Tone Preset changed to '${this.colorTonePreset}'`);
    this.emit("color-tone-preset-changed", this.colorTonePreset);
  }

  _onColorToneFactorChanged() {
    logDebug(`Color Tone Factor changed to '${this.colorToneFactor}'`);
    this.emit("color-tone-factor-changed", this.colorToneFactor);
  }
};

Signals.addSignalMethods(Settings.prototype);
