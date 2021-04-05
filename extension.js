"use strict";

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;

const { Settings } = Me.imports.modules.Settings;
const { Scheduler } = Me.imports.modules.Scheduler;
const { Decorator } = Me.imports.modules.Decorator;
const { Bedtime } = Me.imports.modules.Bedtime;

var settings = null;
var scheduler = null;
var decorator = null;
var bedtime = null;

function enable() {
  logDebug("Enabling extension...");

  settings = new Settings();
  scheduler = new Scheduler();
  decorator = new Decorator();
  bedtime = new Bedtime();

  settings.enable();
  scheduler.enable();
  decorator.enable();
  bedtime.enable();

  logDebug("Extension enabled");
}

function disable() {
  logDebug("Disabling extension...");

  decorator.disable();
  bedtime.disable();
  scheduler.disable();
  settings.disable();

  decorator = null;
  bedtime = null;
  scheduler = null;
  settings = null;

  logDebug("Extension disabled");
}

function init() {
  logDebug("Initializing extension...");
}
