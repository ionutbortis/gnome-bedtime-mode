const Signals = imports.signals;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;

var Settings = class {
  constructor() {
    logDebug("Initializing settings...");

    this._bedtimeModeActiveConnect = null;
    this._automaticScheduleConnect = null;
    this._scheduleStartHoursConnect = null;
    this._scheduleStartMinutesConnect = null;
    this._scheduleEndHoursConnect = null;
    this._scheduleEndMinutesConnect = null;

    this.gSettings = extensionUtils.getSettings();

    logDebug("Settings initialized.");
  }

  enable() {
    logDebug("Connecting settings signals...");

    this._bedtimeModeActiveConnect = this.gSettings.connect("changed::bedtime-mode-active", this._onBedtimeModeActiveChanged.bind(this));
    this._automaticScheduleConnect = this.gSettings.connect("changed::automatic-schedule", this._onAutomaticScheduleChanged.bind(this));
    this._scheduleStartHoursConnect = this.gSettings.connect("changed::schedule-start-hours", this._onScheduleTimesChanged.bind(this));
    this._scheduleStartMinutesConnect = this.gSettings.connect("changed::schedule-start-minutes", this._onScheduleTimesChanged.bind(this));
    this._scheduleEndHoursConnect = this.gSettings.connect("changed::schedule-end-hours", this._onScheduleTimesChanged.bind(this));
    this._scheduleEndMinutesConnect = this.gSettings.connect("changed::schedule-end-minutes", this._onScheduleTimesChanged.bind(this));

    logDebug("Settings signals connected.");
  }

  disable() {
    logDebug("Disconnecting settings signals...");

    this.gSettings.disconnect(this._bedtimeModeActiveConnect);
    this.gSettings.disconnect(this._automaticScheduleConnect);
    this.gSettings.disconnect(this._scheduleStartHoursConnect);
    this.gSettings.disconnect(this._scheduleStartMinutesConnect);
    this.gSettings.disconnect(this._scheduleEndHoursConnect);
    this.gSettings.disconnect(this._scheduleEndMinutesConnect);

    logDebug("Settings signals disconnected.");
  }

  get bedtimeModeActive() {
    return this.gSettings.get_boolean("bedtime-mode-active");
  }

  set bedtimeModeActive(value) {
    if (value !== this.bedtimeModeActive) {
      this.gSettings.set_boolean("bedtime-mode-active", value);
      logDebug(`Bedtime Mode Active has been set to '${value}'`);
    }
  }

  get automaticSchedule() {
    return this.gSettings.get_boolean("automatic-schedule");
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
    logDebug(`Bedtime Mode has been ${this.bedtimeModeActive ? "enabled" : "disabled"}`);

    this.emit("bedtime-mode-active-changed", this.bedtimeModeActive);
  }

  _onAutomaticScheduleChanged() {
    this.emit("automatic-schedule-changed", this.automaticSchedule);
  }

  _onScheduleTimesChanged() {
    logDebug(`Schedule Times changed, emiting change signal...`);

    this.emit("schedule-times-changed", {});
  }
};

Signals.addSignalMethods(Settings.prototype);
