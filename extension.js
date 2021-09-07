"use strict";

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;

const { SignalManager } = Me.imports.modules.SignalManager;
const { Settings } = Me.imports.modules.Settings;
const { Scheduler } = Me.imports.modules.Scheduler;
const { Decorator } = Me.imports.modules.Decorator;
const { Colorizer } = Me.imports.modules.Colorizer;

var signalManager = null;
var settings = null;
var scheduler = null;
var decorator = null;
var colorizer = null;

function enable() {
  logDebug("Enabling extension...");

  signalManager = new SignalManager();
  settings = new Settings(signalManager);
  scheduler = new Scheduler();
  decorator = new Decorator();
  colorizer = new Colorizer();

  signalManager.enable();
  settings.enable();
  scheduler.enable();
  decorator.enable();
  colorizer.enable();

  logDebug("Extension enabled");
}

function disable() {
  logDebug("Disabling extension...");

  decorator.disable();
  colorizer.disable();
  scheduler.disable();
  settings.disable();
  signalManager.disable();

  decorator = null;
  colorizer = null;
  scheduler = null;
  settings = null;
  signalManager = null;

  logDebug("Extension disabled");
}

function init() {
  logDebug("Initializing extension...");

  ExtensionUtils.initTranslations();
}
