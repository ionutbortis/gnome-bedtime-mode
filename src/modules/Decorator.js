"use strict";

import St from "gi://St";
import Clutter from "gi://Clutter";

import { Button as PanelMenuButton } from "resource:///org/gnome/shell/ui/panelMenu.js";
import { panel as MainPanel } from "resource:///org/gnome/shell/ui/main.js";

import { ModuleBase } from "./ModuleBase.js";
import { QuickSetting } from "../ui/QuickSetting.js";
import { logDebug } from "../utils.js";

export class Decorator extends ModuleBase {
  constructor(extension) {
    super(extension);

    this._button = null;
  }

  enable() {
    logDebug("Enabling Decorator...");

    this._createConnections();
    this._addButton();
  }

  disable() {
    logDebug("Disabling Decorator...");

    this._removeButton();
  }

  _createConnections() {
    logDebug("Creating connections for Decorator...");

    this.extension.signalManager.connect(
      this,
      this.extension.settings,
      "bedtime-mode-active-changed",
      this._onBedtimeModeActiveChanged.name
    );
    this.extension.signalManager.connect(
      this,
      this.extension.settings,
      "button-location-changed",
      this._onButtonLocationChanged.name
    );
    this.extension.signalManager.connect(
      this,
      this.extension.settings,
      "button-bar-manual-position-changed",
      this._onButtonBarManualPositionChanged.name
    );
    this.extension.signalManager.connect(
      this,
      this.extension.settings,
      "button-bar-position-value-changed",
      this._onButtonBarPositionValueChanged.name
    );
    this.extension.signalManager.connect(
      this,
      this.extension.settings,
      "button-bar-onoff-indicator-changed",
      this._onButtonBarOnOffIndicatorChanged.name
    );
    this.extension.signalManager.connect(
      this,
      this.extension.settings,
      "button-visibility-changed",
      this._onButtonVisibilityChanged.name
    );
    this.extension.signalManager.connect(
      this,
      this.extension.scheduler,
      "active-schedule-changed",
      this._onActiveScheduleChanged.name
    );
  }

  _addButton() {
    if (!this._shouldDisplayButton()) return;

    switch (this.extension.settings.buttonLocation) {
      case "bar":
        this._addButtonToBar();
        break;

      case "menu":
        this._addButtonToMenu();
        break;
    }
  }

  _shouldDisplayButton() {
    switch (this.extension.settings.buttonVisibility) {
      case "active-schedule":
        return this.extension.scheduler.activeSchedule;

      case "always":
        return true;

      case "never":
        return false;
    }
  }

  _removeButton() {
    if (this._button) {
      logDebug("Removing On-demand button...");

      this._button.destroy();
      this._button = null;
    }
  }

  _addButtonToBar() {
    logDebug("Adding On-demand button to Top Bar...");

    const extensionIcon = this.extension.icon;
    const icon = new St.Icon({
      gicon: extensionIcon,
      style_class: "system-status-icon",
    });

    this._button = new PanelMenuButton(0.0);

    this._button.add_actor(icon);
    this._button.connect("button-press-event", () => this._toggleBedtimeMode());
    this._button.connect("touch-event", () => this._toggleBedtimeMode());
    this._button.connect("scroll-event", (_actor, _event) => this._handleButtonScroll(_event));
    this._button.opacity = this._getButtonOpacity();
    this._button.update = () => {
      this._button.opacity = this._getButtonOpacity();
    };

    MainPanel.addToStatusArea("BedtimeModeToggleButton", this._button, this._getTopBarPosition());
  }

  _addButtonToMenu() {
    logDebug("Adding On-demand button to System Menu...");

    this._button = new QuickSetting(this.extension);
    this._button.create();
  }

  _getButtonOpacity() {
    const fullOpacity = 255;
    const reducedOpacity = 0.35 * fullOpacity;

    if (!this.extension.settings.buttonBarOnOffIndicator) return fullOpacity;

    return this.extension.settings.bedtimeModeActive ? fullOpacity : reducedOpacity;
  }

  _handleButtonScroll(event) {
    if (!(this.extension.settings.buttonBarScrollEnabled && this.extension.settings.bedtimeModeActive)) return;

    switch (event.get_scroll_direction()) {
      case Clutter.ScrollDirection.UP:
        this._increaseColorToneFactor();
        break;

      case Clutter.ScrollDirection.DOWN:
        this._decreaseColorToneFactor();
        break;
    }
  }

  _increaseColorToneFactor() {
    if (this.extension.settings.colorToneFactor <= 95) this.extension.settings.colorToneFactor += 5;
    else this.extension.settings.colorToneFactor = 100;
  }

  _decreaseColorToneFactor() {
    if (this.extension.settings.colorToneFactor >= 15) this.extension.settings.colorToneFactor -= 5;
    else this.extension.settings.colorToneFactor = 10;
  }

  _getTopBarPosition() {
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

  _onBedtimeModeActiveChanged() {
    this._updateButton();
  }

  _onButtonLocationChanged() {
    this._redrawButton();
  }

  _onButtonVisibilityChanged() {
    this._redrawButton();
  }

  _onButtonBarManualPositionChanged() {
    this.extension.settings.buttonLocation === "bar" && this._redrawButton();
  }

  _onButtonBarPositionValueChanged() {
    this.extension.settings.buttonLocation === "bar" && this._redrawButton();
  }

  _onButtonBarOnOffIndicatorChanged() {
    this.extension.settings.buttonLocation === "bar" && this._updateButton();
  }

  _onActiveScheduleChanged() {
    this.extension.settings.buttonVisibility === "active-schedule" && this._redrawButton();
  }

  _updateButton() {
    if (this._button && this._button.update) {
      logDebug("Updating On-demand button state...");
      this._button.update();
    }
  }

  _redrawButton() {
    this._removeButton();
    this._addButton();
  }

  _toggleBedtimeMode() {
    this.extension.settings.bedtimeModeActive = !this.extension.settings.bedtimeModeActive;
  }
}
