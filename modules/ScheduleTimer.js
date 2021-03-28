const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const extension = Me.imports.extension;
const { loopRun, logDebug } = Me.imports.utils;

var ScheduleTimer = class {
  constructor() {
    this._timerId = null;
    this._timerLoopMillis = 1000;

    this._scheduleReached = false;

    this._automaticScheduleConnect = null;
    this._scheduleTimesConnect = null;
  }

  enable() {
    logDebug("Enabling Schedule Timer...");

    this._connectSettings();
    this._enableTimer();

    logDebug("Schedule Timer enabled.");
  }

  disable() {
    logDebug("Disabling Schedule Timer...");

    this._disconnectSettings();
    this._disableTimer();

    logDebug("Schedule Timer disabled.");
  }

  _connectSettings() {
    logDebug("Connecting Schedule Timer to settings...");

    this._automaticScheduleConnect = extension.settings.connect("automatic-schedule-changed", this._onAutomaticScheduleChanged.bind(this));
    this._scheduleTimesConnect = extension.settings.connect("schedule-times-changed", this._onScheduleTimesChanged.bind(this));
  }

  _disconnectSettings() {
    extension.settings.disconnect(this._automaticScheduleConnect);
    extension.settings.disconnect(this._scheduleTimesConnect);

    logDebug("Disconnected Schedule Timer from settings.");
  }

  _enableTimer() {
    if (extension.settings.automaticSchedule) {
      this._timerId = loopRun(this._checkScheduleLoop.bind(this), this._timerLoopMillis);
    }
  }

  _checkScheduleLoop() {
    const currentTimeOnSchedule = this._isCurrentTimeOnSchedule();

    if (this._scheduleReached !== currentTimeOnSchedule) {
      this._scheduleReached = currentTimeOnSchedule;

      logDebug(`Schedule Reached flag value changed to '${this._scheduleReached}'.`);

      extension.settings.bedtimeModeActive = this._scheduleReached;
    }

    return true; // continue loop
  }

  _isCurrentTimeOnSchedule() {
    const currentTime = GLib.DateTime.new_now_local();

    const now = currentTime.get_hour() + currentTime.get_minute() / 60;
    const scheduleStart = extension.settings.scheduleStartHours + extension.settings.scheduleStartMinutes / 60;
    const scheduleEnd = extension.settings.scheduleEndHours + extension.settings.scheduleEndMinutes / 60;

    return scheduleEnd >= scheduleStart ? now >= scheduleStart && now < scheduleEnd : now >= scheduleStart || now < scheduleEnd;
  }

  _disableTimer() {
    if (this._timerId) {
      GLib.Source.remove(this._timerId);
      this._timerId = null;
    }
  }

  _onAutomaticScheduleChanged() {
    if (extension.settings.automaticSchedule) {
      this._enableTimer();
      extension.settings.bedtimeModeActive = this._isCurrentTimeOnSchedule();
    } else {
      this._disableTimer();
      extension.settings.bedtimeModeActive = false;
    }
  }

  _onScheduleTimesChanged() {
    if (extension.settings.automaticSchedule) this._checkScheduleLoop();
  }
};
