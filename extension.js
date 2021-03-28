"use strict";

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;

const { Settings } = Me.imports.modules.Settings;
const { Bedtime } = Me.imports.modules.Bedtime;
const { ScheduleTimer } = Me.imports.modules.ScheduleTimer;

var bedtime = null;
var settings = null;
var timer = null;

function enable() {
  logDebug("Enabling extension...");

  settings = new Settings();
  bedtime = new Bedtime();
  timer = new ScheduleTimer();

  settings.enable();
  bedtime.enable();
  timer.enable();

  logDebug("Extension enabled.");
}

function disable() {
  logDebug("Disabling extension...");

  bedtime.disable();
  settings.disable();
  timer.disable();

  bedtime = null;
  settings = null;
  timer = null;

  logDebug("Extension disabled.");
}

function init() {
  logDebug("Initializing extension...");
  // TODO add translations init here
}
