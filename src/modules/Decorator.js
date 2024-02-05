"use strict";

import St from "gi://St";
import Clutter from "gi://Clutter";

import { Button as PanelMenuButton } from "resource:///org/gnome/shell/ui/panelMenu.js";
import { panel as MainPanel } from "resource:///org/gnome/shell/ui/main.js";

import { ModuleBase } from "./ModuleBase.js";
import { QuickSetting } from "../ui/QuickSetting.js";
import { logDebug } from "../utils.js";

export class Decorator extends ModuleBase {
  #button;

  constructor(extension) {
    super(extension);
  }

  enable() {
    logDebug("Enabling Decorator...");

    this.#createConnections();
    this.#addButton();
  }

  disable() {
    logDebug("Disabling Decorator...");

    this.#removeButton();
  }

  #createConnections() {
    logDebug("Creating connections for Decorator...");

    this.createConnection(this.extension.settings, "bedtime-mode-active-changed", this.onBedtimeModeActiveChanged.name);
    this.createConnection(this.extension.settings, "button-location-changed", this.onButtonLocationChanged.name);
    this.createConnection(this.extension.settings, "button-bar-manual-position-changed", this.onButtonBarManualPositionChanged.name);
    this.createConnection(this.extension.settings, "button-bar-position-value-changed", this.onButtonBarPositionValueChanged.name);
    this.createConnection(this.extension.settings, "button-bar-onoff-indicator-changed", this.onButtonBarOnOffIndicatorChanged.name);
    this.createConnection(this.extension.settings, "button-visibility-changed", this.onButtonVisibilityChanged.name);
    this.createConnection(this.extension.scheduler, "active-schedule-changed", this.onActiveScheduleChanged.name);
  }

  #addButton() {
    if (!this.#shouldDisplayButton()) return;

    switch (this.extension.settings.buttonLocation) {
      case "bar":
        this.#addButtonToBar();
        break;

      case "menu":
        this.#addButtonToMenu();
        break;
    }
  }

  #shouldDisplayButton() {
    switch (this.extension.settings.buttonVisibility) {
      case "active-schedule":
        return this.extension.scheduler.activeSchedule;

      case "always":
        return true;

      case "never":
        return false;
    }
  }

  #removeButton() {
    if (this.#button) {
      logDebug("Removing On-demand button...");

      this.#button.destroy();
      this.#button = null;
    }
  }

  #addButtonToBar() {
    logDebug("Adding On-demand button to Top Bar...");

    const extensionIcon = this.extension.icon;
    const icon = new St.Icon({
      gicon: extensionIcon,
      style_class: "system-status-icon",
    });

    this.#button = new PanelMenuButton(0.0);

    this.#button.add_child(icon);
    this.#button.connect("button-press-event", () => this.#toggleBedtimeMode());
    this.#button.connect("touch-event", () => this.#toggleBedtimeMode());
    this.#button.connect("scroll-event", (_actor, _event) => this.#handleButtonScroll(_event));
    this.#button.opacity = this.#getButtonOpacity();
    this.#button.update = () => {
      this.#button.opacity = this.#getButtonOpacity();
    };

    MainPanel.addToStatusArea("BedtimeModeToggleButton", this.#button, this.#getTopBarPosition());
  }

  #addButtonToMenu() {
    logDebug("Adding On-demand button to System Menu...");

    this.#button = new QuickSetting(this.extension);
    this.#button.create();
  }

  #getButtonOpacity() {
    const fullOpacity = 255;
    const reducedOpacity = 0.35 * fullOpacity;

    if (!this.extension.settings.buttonBarOnOffIndicator) return fullOpacity;

    return this.extension.settings.bedtimeModeActive ? fullOpacity : reducedOpacity;
  }

  #handleButtonScroll(event) {
    if (!(this.extension.settings.buttonBarScrollEnabled && this.extension.settings.bedtimeModeActive)) return;

    switch (event.get_scroll_direction()) {
      case Clutter.ScrollDirection.UP:
        this.#increaseColorToneFactor();
        break;

      case Clutter.ScrollDirection.DOWN:
        this.#decreaseColorToneFactor();
        break;
    }
  }

  #increaseColorToneFactor() {
    if (this.extension.settings.colorToneFactor <= 95) this.extension.settings.colorToneFactor += 5;
    else this.extension.settings.colorToneFactor = 100;
  }

  #decreaseColorToneFactor() {
    if (this.extension.settings.colorToneFactor >= 15) this.extension.settings.colorToneFactor -= 5;
    else this.extension.settings.colorToneFactor = 10;
  }

  #getTopBarPosition() {
    const quickSettingsMenuFinder = (entry) => {
      return entry.get_child && entry.get_child() === MainPanel.statusArea.quickSettings;
    };
    const quickSettingsMenuIndex = MainPanel._rightBox.get_children().findIndex(quickSettingsMenuFinder);

    const defaultValue = quickSettingsMenuIndex > -1 ? quickSettingsMenuIndex : 0;
    const manualPosition = this.extension.settings.buttonBarManualPosition;
    const manualValue = this.extension.settings.buttonBarPositionValue;

    logDebug(`Get Top Bar position: manual={${manualPosition}, ${manualValue}} default=${defaultValue}`);

    return manualPosition ? manualValue : defaultValue;
  }

  #updateButton() {
    if (this.#button && this.#button.update) {
      logDebug("Updating On-demand button state...");
      this.#button.update();
    }
  }

  #redrawButton() {
    this.#removeButton();
    this.#addButton();
  }

  #toggleBedtimeMode() {
    this.extension.settings.bedtimeModeActive = !this.extension.settings.bedtimeModeActive;
  }

  onBedtimeModeActiveChanged() {
    this.#updateButton();
  }

  onButtonLocationChanged() {
    this.#redrawButton();
  }

  onButtonVisibilityChanged() {
    this.#redrawButton();
  }

  onButtonBarManualPositionChanged() {
    this.extension.settings.buttonLocation === "bar" && this.#redrawButton();
  }

  onButtonBarPositionValueChanged() {
    this.extension.settings.buttonLocation === "bar" && this.#redrawButton();
  }

  onButtonBarOnOffIndicatorChanged() {
    this.extension.settings.buttonLocation === "bar" && this.#updateButton();
  }

  onActiveScheduleChanged() {
    this.extension.settings.buttonVisibility === "active-schedule" && this.#redrawButton();
  }
}
