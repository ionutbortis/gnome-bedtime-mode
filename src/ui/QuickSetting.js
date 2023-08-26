"use strict";

import Gio from "gi://Gio";
import GObject from "gi://GObject";

import { panel as MainPanel } from "resource:///org/gnome/shell/ui/main.js";
import { QuickToggle, SystemIndicator } from "resource:///org/gnome/shell/ui/quickSettings.js";
import { gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";

import { logDebug, loopRun } from "../utils.js";

const BedtimeModeToggle = GObject.registerClass(
  class BedtimeModeToggle extends QuickToggle {
    constructor(extension) {
      super({
        title: _("Bedtime Mode"),
        gicon: extension.icon,
        toggleMode: true,
      });

      extension.getSettings().bind("bedtime-mode-active", this, "checked", Gio.SettingsBindFlags.DEFAULT);
    }
  }
);

const BedtimeModeIndicator = GObject.registerClass(
  class BedtimeModeIndicator extends SystemIndicator {
    constructor(extension) {
      super();

      this.quickSettingsItems.push(new BedtimeModeToggle(extension));

      this.connect("destroy", () => {
        this.quickSettingsItems.forEach((item) => item.destroy());
      });
    }
  }
);

export class QuickSetting {
  #extension;

  #indicator;
  #quickSettings;
  #checkMaxRetries;
  #checkRetryDelay;
  #checkLoopSource;

  constructor(extension) {
    this.#extension = extension;

    this.#quickSettings = MainPanel.statusArea.quickSettings;

    this.#checkMaxRetries = 4;
    this.#checkRetryDelay = 50;
  }

  create() {
    this.#indicator = new BedtimeModeIndicator(this.#extension);

    this.#checkLoopSource = loopRun(this.#checkDarkModeIndicator.bind(this), this.#checkRetryDelay);
  }

  destroy() {
    this.#destroyCheckLoopSource();

    this.#indicator?.destroy();
    this.#indicator = null;
    this.#quickSettings = null;
  }

  #checkDarkModeIndicator() {
    this.#checkMaxRetries--;
    logDebug(`Dark Mode indicator check retries left ${this.#checkMaxRetries}`);

    const found = !!this.#quickSettings._darkMode;

    return (this.#checkMaxRetries > 0 && !found) || this.#addIndicator(found);
  }

  #addIndicator(darkModeFound) {
    this.#destroyCheckLoopSource();

    switch (darkModeFound) {
      case true:
        logDebug(`Adding extension indicator before Dark Mode...`);

        this.#quickSettings._addItemsBefore(this.#indicator.quickSettingsItems, this.#quickSettings._darkMode.quickSettingsItems[0]);
        break;

      case false:
        logDebug(`Adding extension indicator without placement...`);

        this.#quickSettings.addExternalIndicator(this.#indicator);
        break;
    }
  }

  #destroyCheckLoopSource() {
    if (this.#checkLoopSource) {
      logDebug(`Destroying Dark Mode check Loop Source ${this.#checkLoopSource.get_id()}`);

      this.#checkLoopSource.destroy();
      this.#checkLoopSource = null;
    }
  }
}
