"use strict";

const Signals = imports.signals;
const { GLib } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const extension = Me.imports.extension;
const { loopRun, logDebug } = Me.imports.utils;

var Scheduler = class {
  constructor() {
    this._timerLoopMillis = 2 * 1000;
    this._timerId = null;

    this._activeSchedule = false;

    this._automaticScheduleConnect = null;
    this._scheduleTimesConnect = null;
  }

  get activeSchedule() {
    return this._activeSchedule;
  }

  enable() {
    logDebug("Enabling Scheduler...");

    this._connectSettings();
    this._enableTimer();
  }

  disable() {
    logDebug("Disabling Scheduler...");

    this._disconnectSettings();
    this._disableTimer();
  }

  _connectSettings() {
    logDebug("Connecting Scheduler to settings...");

    this._automaticScheduleConnect = extension.settings.connect("automatic-schedule-changed", this._onAutomaticScheduleChanged.bind(this));
    this._scheduleTimesConnect = extension.settings.connect("schedule-times-changed", this._onScheduleTimesChanged.bind(this));
  }

  _disconnectSettings() {
    logDebug("Disconnecting Scheduler from settings...");

    extension.settings.disconnect(this._automaticScheduleConnect);
    extension.settings.disconnect(this._scheduleTimesConnect);
  }

  _enableTimer() {
    if (extension.settings.automaticSchedule) {
      extension.settings.bedtimeModeActive = this._isCurrentTimeOnSchedule();
      this._timerId = loopRun(this._checkScheduleLoop.bind(this), this._timerLoopMillis);
    }
  }

  _disableTimer() {
    if (this._timerId) {
      GLib.Source.remove(this._timerId);
      this._timerId = null;
    }
  }

  _checkScheduleLoop() {
    const currentTimeOnSchedule = this._isCurrentTimeOnSchedule();

    if (this._activeSchedule !== currentTimeOnSchedule) {
      this._activeSchedule = currentTimeOnSchedule;
      this._signalActiveScheduleChange();

      extension.settings.bedtimeModeActive = this._activeSchedule;
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

  _signalActiveScheduleChange() {
    logDebug(`Active Schedule changed to '${this._activeSchedule}'`);

    this.emit("active-schedule-changed", this._activeSchedule);
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
    if (extension.settings.automaticSchedule) {
      extension.settings.bedtimeModeActive = this._isCurrentTimeOnSchedule();
    }
  }
};

Signals.addSignalMethods(Scheduler.prototype);
