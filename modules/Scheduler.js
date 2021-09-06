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
    this._timerLoopSource = null;

    this._activeSchedule = false;
  }

  get activeSchedule() {
    return this._activeSchedule;
  }

  enable() {
    logDebug("Enabling Scheduler...");

    this._createConnections();
    this._enableTimer();
  }

  disable() {
    logDebug("Disabling Scheduler...");
    this._disableTimer();
  }

  _createConnections() {
    logDebug("Creating connections for Scheduler...");

    extension.signalManager.connect(this, extension.settings, "automatic-schedule-changed", this._onAutomaticScheduleChanged.name);
    extension.signalManager.connect(this, extension.settings, "schedule-times-changed", this._onScheduleTimesChanged.name);
  }

  _enableTimer() {
    if (extension.settings.automaticSchedule) {
      extension.settings.bedtimeModeActive = this._isCurrentTimeOnSchedule();

      this._timerLoopSource = loopRun(this._checkScheduleLoop.bind(this), this._timerLoopMillis);
    }
  }

  _disableTimer() {
    this._timerLoopSource && this._timerLoopSource.destroy();
    this._timerLoopSource = null;
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
