"use strict";

import GLib from "gi://GLib";

import { ModuleBase } from "./ModuleBase.js";
import { loopRun, logDebug } from "../utils.js";

const Signals = imports.signals;

export class Scheduler extends ModuleBase {
  #timerLoopDelay;
  #timerLoopSource;

  #activeSchedule;

  constructor(extension) {
    super(extension);

    this.#timerLoopDelay = 2 * 1000;
    this.#activeSchedule = false;
  }

  get activeSchedule() {
    return this.#activeSchedule;
  }

  enable() {
    logDebug("Enabling Scheduler...");

    this.#createConnections();
    this.#enableTimer();
  }

  disable() {
    logDebug("Disabling Scheduler...");
    this.#disableTimer();
  }

  #createConnections() {
    logDebug("Creating connections for Scheduler...");

    this.createConnection(this.extension.settings, "automatic-schedule-changed", this.onAutomaticScheduleChanged.name);
    this.createConnection(this.extension.settings, "schedule-times-changed", this.onScheduleTimesChanged.name);
  }

  #enableTimer() {
    if (this.extension.settings.automaticSchedule) {
      this.extension.settings.bedtimeModeActive = this.#isCurrentTimeOnSchedule();

      this.#timerLoopSource = loopRun(this.#checkScheduleLoop.bind(this), this.#timerLoopDelay);
    }
  }

  #disableTimer() {
    this.#timerLoopSource?.destroy();
    this.#timerLoopSource = null;
  }

  #checkScheduleLoop() {
    const currentTimeOnSchedule = this.#isCurrentTimeOnSchedule();

    if (this.#activeSchedule !== currentTimeOnSchedule) {
      this.#activeSchedule = currentTimeOnSchedule;
      this.#signalActiveScheduleChange();

      this.extension.settings.bedtimeModeActive = this.#activeSchedule;
    }

    return true; // continue loop
  }

  #isCurrentTimeOnSchedule() {
    const currentTime = GLib.DateTime.new_now_local();

    const now = currentTime.get_hour() + currentTime.get_minute() / 60;
    const scheduleStart = this.extension.settings.scheduleStartHours + this.extension.settings.scheduleStartMinutes / 60;
    const scheduleEnd = this.extension.settings.scheduleEndHours + this.extension.settings.scheduleEndMinutes / 60;

    return scheduleEnd >= scheduleStart ? now >= scheduleStart && now < scheduleEnd : now >= scheduleStart || now < scheduleEnd;
  }

  #signalActiveScheduleChange() {
    logDebug(`Active Schedule changed to '${this.#activeSchedule}'`);

    this.emit("active-schedule-changed", this.#activeSchedule);
  }

  onAutomaticScheduleChanged() {
    if (this.extension.settings.automaticSchedule) {
      this.#enableTimer();
      this.extension.settings.bedtimeModeActive = this.#isCurrentTimeOnSchedule();
    } else {
      this.#disableTimer();
      this.extension.settings.bedtimeModeActive = false;
    }
  }

  onScheduleTimesChanged() {
    if (this.extension.settings.automaticSchedule) {
      this.extension.settings.bedtimeModeActive = this.#isCurrentTimeOnSchedule();
    }
  }
}

Signals.addSignalMethods(Scheduler.prototype);
