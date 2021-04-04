"use strict";

const Signals = imports.signals;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;

var Settings = class {
  constructor() {
    logDebug("Initializing Settings...");

    this._connections = [];
    this.gSettings = extensionUtils.getSettings();
  }

  enable() {
    logDebug("Connecting settings signals...");

    this._createConnection("bedtime-mode-active", this._onBedtimeModeActiveChanged.name);
    this._createConnection("automatic-schedule", this._onAutomaticScheduleChanged.name);
    this._createConnection("ondemand-button-visibility", this._onButtonVisibilityChanged.name);
    this._createConnection("ondemand-button-location", this._onButtonLocationChanged.name);
    this._createConnection("ondemand-button-bar-manual-position", this._onButtonBarManualPositionChanged.name);
    this._createConnection("ondemand-button-bar-position-value", this._onButtonBarPositionValueChanged.name);
    this._createConnection("schedule-start-hours", this._onScheduleTimesChanged.name);
    this._createConnection("schedule-start-minutes", this._onScheduleTimesChanged.name);
    this._createConnection("schedule-end-hours", this._onScheduleTimesChanged.name);
    this._createConnection("schedule-end-minutes", this._onScheduleTimesChanged.name);
  }

  disable() {
    logDebug("Disconnecting settings signals...");

    for (const connection of this._connections) {
      this.gSettings.disconnect(connection);
    }
    this._connections.length = 0;
  }

  _createConnection(settingsKey, handlerName) {
    this._connections.push(this.gSettings.connect(`changed::${settingsKey}`, this[handlerName].bind(this)));
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

  _onScheduleTimesChanged() {
    const start = `Start=${this.scheduleStartHours}:${this.scheduleStartMinutes}`;
    const end = `End=${this.scheduleEndHours}:${this.scheduleEndMinutes}`;
    logDebug(`Schedule Times changed to: ${start} ${end}`);

    this.emit("schedule-times-changed", {});
  }
};

Signals.addSignalMethods(Settings.prototype);
