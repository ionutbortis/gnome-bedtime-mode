"use strict";

import GLib from "gi://GLib";
import Gio from "gi://Gio";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

import { SignalManager } from "./events/SignalManager.js";
import { Settings } from "./modules/Settings.js";
import { Scheduler } from "./modules/Scheduler.js";
import { Decorator } from "./modules/Decorator.js";
import { Colorizer } from "./modules/Colorizer.js";

import { logDebug } from "./utils.js";

export default class BedtimeMode extends Extension {
  constructor(metadata) {
    super(metadata);

    this.signalManager = null;
    this.settings = null;
    this.scheduler = null;
    this.decorator = null;
    this.colorizer = null;
  }

  enable() {
    logDebug("Enabling extension...");

    this.signalManager = new SignalManager();
    this.settings = new Settings(this);
    this.scheduler = new Scheduler(this);
    this.decorator = new Decorator(this);
    this.colorizer = new Colorizer(this);

    this.settings.enable();
    this.scheduler.enable();
    this.decorator.enable();
    this.colorizer.enable();

    logDebug("Extension enabled");
  }

  disable() {
    logDebug("Disabling extension...");

    this.decorator.disable();
    this.colorizer.disable();
    this.scheduler.disable();
    this.settings.disable();
    this.signalManager.disable();

    this.decorator = null;
    this.colorizer = null;
    this.scheduler = null;
    this.settings = null;
    this.signalManager = null;

    logDebug("Extension disabled");
  }

  get icon() {
    return Gio.icon_new_for_string(GLib.build_filenamev([this.path, "icons", "status", "bedtime-mode-symbolic.svg"]));
  }
}
