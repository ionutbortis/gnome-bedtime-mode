"use strict";

import GLib from "gi://GLib";

import { ModuleBase } from "./ModuleBase.js";
import { loopRun, logDebug } from "../utils.js";

const Signals = imports.signals;

export class Scheduler extends ModuleBase {
  constructor(extension) {
    super(extension);

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

    this.extension.signalManager.connect(
      this,
      this.extension.settings,
      "automatic-schedule-changed",
      this._onAutomaticScheduleChanged.name
    );
    this.extension.signalManager.connect(
      this,
      this.extension.settings,
      "schedule-times-changed",
      this._onScheduleTimesChanged.name
    );
  }

  _enableTimer() {
    if (this.extension.settings.automaticSchedule) {
      this.extension.settings.bedtimeModeActive = this._isCurrentTimeOnSchedule();

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

      this.extension.settings.bedtimeModeActive = this._activeSchedule;
    }

    return true; // continue loop
  }

  _isCurrentTimeOnSchedule() {
    const currentTime = GLib.DateTime.new_now_local();

    const now = currentTime.get_hour() + currentTime.get_minute() / 60;
    const scheduleStart =
      this.extension.settings.scheduleStartHours + this.extension.settings.scheduleStartMinutes / 60;
    const scheduleEnd = this.extension.settings.scheduleEndHours + this.extension.settings.scheduleEndMinutes / 60;

    return scheduleEnd >= scheduleStart
      ? now >= scheduleStart && now < scheduleEnd
      : now >= scheduleStart || now < scheduleEnd;
  }

  _signalActiveScheduleChange() {
    logDebug(`Active Schedule changed to '${this._activeSchedule}'`);

    this.emit("active-schedule-changed", this._activeSchedule);
  }

  _onAutomaticScheduleChanged() {
    if (this.extension.settings.automaticSchedule) {
      this._enableTimer();
      this.extension.settings.bedtimeModeActive = this._isCurrentTimeOnSchedule();
    } else {
      this._disableTimer();
      this.extension.settings.bedtimeModeActive = false;
    }
  }

  _onScheduleTimesChanged() {
    if (this.extension.settings.automaticSchedule) {
      this.extension.settings.bedtimeModeActive = this._isCurrentTimeOnSchedule();
    }
  }
}

Signals.addSignalMethods(Scheduler.prototype);
