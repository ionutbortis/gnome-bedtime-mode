"use strict";

const { Gio, GLib, St } = imports.gi;
const { Button: PanelMenuButton } = imports.ui.panelMenu;
const { PopupImageMenuItem } = imports.ui.popupMenu;
const MainPanel = imports.ui.main.panel;

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata["gettext-domain"]);
const _ = Gettext.gettext;

const extension = Me.imports.extension;
const { logDebug } = Me.imports.utils;

var Decorator = class {
  constructor() {
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

    extension.signalManager.connect(this, extension.settings, "bedtime-mode-active-changed", this._onBedtimeModeActiveChanged.name);
    extension.signalManager.connect(this, extension.settings, "button-location-changed", this._onButtonLocationChanged.name);
    extension.signalManager.connect(this, extension.settings, "button-bar-manual-position-changed", this._onButtonBarManualPositionChanged.name);
    extension.signalManager.connect(this, extension.settings, "button-bar-position-value-changed", this._onButtonBarPositionValueChanged.name);
    extension.signalManager.connect(this, extension.settings, "button-bar-onoff-indicator-changed", this._onButtonBarOnOffIndicatorChanged.name);
    extension.signalManager.connect(this, extension.settings, "button-visibility-changed", this._onButtonVisibilityChanged.name);
    extension.signalManager.connect(this, extension.scheduler, "active-schedule-changed", this._onActiveScheduleChanged.name);
  }

  _addButton() {
    if (!this._shouldDisplayButton()) return;

    switch (extension.settings.buttonLocation) {
      case "bar":
        this._addButtonToBar();
        break;

      case "menu":
        this._addButtonToMenu();
        break;
    }
  }

  _shouldDisplayButton() {
    switch (extension.settings.buttonVisibility) {
      case "active-schedule":
        return extension.scheduler.activeSchedule;

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

    const icon = new St.Icon({
      gicon: this._getButtonIcon(),
      style_class: "system-status-icon",
    });

    this._button = new PanelMenuButton(0.0);

    this._button.add_actor(icon);
    this._button.connect("button-press-event", () => this._toggleBedtimeMode());
    this._button.connect("touch-event", () => this._toggleBedtimeMode());
    this._button.opacity = this._getButtonOpacity();
    this._button.update = () => {
      this._button.opacity = this._getButtonOpacity();
    };

    MainPanel.addToStatusArea("BedtimeModeToggleButton", this._button, this._getTopBarPosition());
  }

  _addButtonToMenu() {
    logDebug("Adding On-demand button to System Menu...");

    this._button = new PopupImageMenuItem(this._getMenuItemLabel(), this._getButtonIcon());

    this._button.connect("activate", () => this._toggleBedtimeMode());
    this._button.update = () => {
      this._button.label.text = this._getMenuItemLabel();
      this._button.setIcon(this._getButtonIcon());
    };

    const aggregateMenu = MainPanel.statusArea.aggregateMenu;

    aggregateMenu.menu.addMenuItem(this._button, this._getMenuItemPosition(aggregateMenu));
  }

  _getButtonIcon() {
    return Gio.icon_new_for_string(GLib.build_filenamev([Me.path, "icons", "status", "bedtime-mode-symbolic.svg"]));
  }

  _getButtonOpacity() {
    const fullOpacity = 255;
    const reducedOpacity = 0.35 * 255;

    if (!extension.settings.buttonBarOnOffIndicator) return fullOpacity;

    return extension.settings.bedtimeModeActive ? fullOpacity : reducedOpacity;
  }

  _getMenuItemLabel() {
    return extension.settings.bedtimeModeActive ? _("Turn Off Bedtime Mode") : _("Turn On Bedtime Mode");
  }

  _getTopBarPosition() {
    const aggregateMenuFinder = (entry) => entry.get_child() === MainPanel.statusArea.aggregateMenu;
    const aggregateMenuIndex = MainPanel._rightBox.get_children().findIndex(aggregateMenuFinder);

    const defaultValue = aggregateMenuIndex > -1 ? aggregateMenuIndex : 0;
    const manualPosition = extension.settings.buttonBarManualPosition;
    const manualValue = extension.settings.buttonBarPositionValue;

    logDebug(`Get Top Bar position: manual={${manualPosition}, ${manualValue}} default=${defaultValue}`);

    return manualPosition ? manualValue : defaultValue;
  }

  _getMenuItemPosition(aggregateMenu) {
    const items = aggregateMenu.menu._getMenuItems();
    return items.indexOf(aggregateMenu._system.menu) - 1;
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
    extension.settings.buttonLocation === "bar" && this._redrawButton();
  }

  _onButtonBarPositionValueChanged() {
    extension.settings.buttonLocation === "bar" && this._redrawButton();
  }

  _onButtonBarOnOffIndicatorChanged() {
    extension.settings.buttonLocation === "bar" && this._updateButton();
  }

  _onActiveScheduleChanged() {
    extension.settings.buttonVisibility === "active-schedule" && this._redrawButton();
  }

  _updateButton() {
    if (this._button) {
      logDebug("Updating On-demand button state...");
      this._button.update();
    }
  }

  _redrawButton() {
    this._removeButton();
    this._addButton();
  }

  _toggleBedtimeMode() {
    extension.settings.bedtimeModeActive = !extension.settings.bedtimeModeActive;
  }
};
