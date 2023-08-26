"use strict";

const Signals = imports.signals;

import { ModuleBase } from "./ModuleBase.js";
import { logDebug } from "../utils.js";

export class Settings extends ModuleBase {
  constructor(extension) {
    super(extension);

    this.gSettings = this.extension.getSettings();
  }

  enable() {
    this.#createConnections();
  }

  disable() {
    this.gSettings = null;
  }

  #createConnections() {
    logDebug("Creating connections for Settings...");

    this.#createConnection("bedtime-mode-active", this.onBedtimeModeActiveChanged.name);
    this.#createConnection("automatic-schedule", this.onAutomaticScheduleChanged.name);
    this.#createConnection("ondemand-button-visibility", this.onButtonVisibilityChanged.name);
    this.#createConnection("ondemand-button-location", this.onButtonLocationChanged.name);
    this.#createConnection("ondemand-button-bar-manual-position", this.onButtonBarManualPositionChanged.name);
    this.#createConnection("ondemand-button-bar-position-value", this.onButtonBarPositionValueChanged.name);
    this.#createConnection("ondemand-button-bar-onoff-indicator", this.onButtonBarOnOffIndicatorChanged.name);
    this.#createConnection("ondemand-button-bar-scroll-enabled", this.onButtonBarScrollEnabledChanged.name);
    this.#createConnection("schedule-start-hours", this.onScheduleTimesChanged.name);
    this.#createConnection("schedule-start-minutes", this.onScheduleTimesChanged.name);
    this.#createConnection("schedule-end-hours", this.onScheduleTimesChanged.name);
    this.#createConnection("schedule-end-minutes", this.onScheduleTimesChanged.name);
    this.#createConnection("color-tone-preset", this.onColorTonePresetChanged.name);
    this.#createConnection("color-tone-factor", this.onColorToneFactorChanged.name);
  }

  #createConnection(settingsKey, handlerName) {
    this.createConnection(this.gSettings, `changed::${settingsKey}`, handlerName);
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

  onBedtimeModeActiveChanged() {
    logDebug(`Bedtime Mode Active changed to '${this.bedtimeModeActive}'`);
    this.emit("bedtime-mode-active-changed", this.bedtimeModeActive);
  }

  onAutomaticScheduleChanged() {
    logDebug(`Automatic Schedule changed to '${this.automaticSchedule}'`);
    this.emit("automatic-schedule-changed", this.automaticSchedule);
  }

  onButtonLocationChanged() {
    logDebug(`Button Location changed to '${this.buttonLocation}'`);
    this.emit("button-location-changed", this.buttonLocation);
  }

  onButtonVisibilityChanged() {
    logDebug(`Button Visibility changed to '${this.buttonVisibility}'`);
    this.emit("button-visibility-changed", this.buttonVisibility);
  }

  onButtonBarManualPositionChanged() {
    logDebug(`Button Bar Manual Position changed to '${this.buttonBarManualPosition}'`);
    this.emit("button-bar-manual-position-changed", this.buttonBarManualPosition);
  }

  onButtonBarPositionValueChanged() {
    logDebug(`Button Bar Position Value changed to '${this.buttonBarPositionValue}'`);
    this.emit("button-bar-position-value-changed", this.buttonBarPositionValue);
  }

  onButtonBarOnOffIndicatorChanged() {
    logDebug(`Button Bar On/Off Indicator changed to '${this.buttonBarOnOffIndicator}'`);
    this.emit("button-bar-onoff-indicator-changed", this.buttonBarOnOffIndicator);
  }

  onButtonBarScrollEnabledChanged() {
    logDebug(`Button Bar Scroll Enabled changed to '${this.buttonBarScrollEnabled}'`);
    this.emit("button-bar-scroll-enabled-changed", this.buttonBarScrollEnabled);
  }

  onScheduleTimesChanged() {
    const start = `Start=${this.scheduleStartHours}:${this.scheduleStartMinutes}`;
    const end = `End=${this.scheduleEndHours}:${this.scheduleEndMinutes}`;
    logDebug(`Schedule Times changed to: ${start} ${end}`);

    this.emit("schedule-times-changed", {});
  }

  onColorTonePresetChanged() {
    logDebug(`Color Tone Preset changed to '${this.colorTonePreset}'`);
    this.emit("color-tone-preset-changed", this.colorTonePreset);
  }

  onColorToneFactorChanged() {
    logDebug(`Color Tone Factor changed to '${this.colorToneFactor}'`);
    this.emit("color-tone-factor-changed", this.colorToneFactor);
  }
}

Signals.addSignalMethods(Settings.prototype);
