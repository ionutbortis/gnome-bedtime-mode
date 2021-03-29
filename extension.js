"use strict";

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;

const { Settings } = Me.imports.modules.Settings;
const { Scheduler } = Me.imports.modules.Scheduler;
const { Bedtime } = Me.imports.modules.Bedtime;

var settings = null;
var scheduler = null;
var bedtime = null;

function enable() {
  logDebug("Enabling extension...");

  settings = new Settings();
  scheduler = new Scheduler();
  bedtime = new Bedtime();

  settings.enable();
  scheduler.enable();
  bedtime.enable();

  logDebug("Extension enabled.");
}

function disable() {
  logDebug("Disabling extension...");

  bedtime.disable();
  scheduler.disable();
  settings.disable();

  bedtime = null;
  scheduler = null;
  settings = null;

  logDebug("Extension disabled.");
}

function init() {
  logDebug("Initializing extension...");
  // TODO add translations init here
}
