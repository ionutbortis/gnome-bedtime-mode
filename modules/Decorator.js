"use strict";

const { Gio, GLib, St } = imports.gi;
const { main } = imports.ui;
const { Button: PanelMenuButton } = imports.ui.panelMenu;
const { PopupImageMenuItem } = imports.ui.popupMenu;

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const extension = Me.imports.extension;

const { logDebug } = Me.imports.utils;

var Decorator = class {
  constructor() {
    this._button = null;
    this._topBarItemsCheckLoopId = null;

    this._bedtimeModeActiveConnect = null;
    this._buttonLocationConnect = null;
    this._buttonBarManualPositionConnect = null;
    this._buttonBarPositionValueConnect = null;
    this._buttonVisibilityConnect = null;
    this._activeScheduleConnect = null;
  }

  enable() {
    logDebug("Enabling Decorator...");

    this._connectSettings();
    this._addButton();
  }

  disable() {
    logDebug("Disabling Decorator...");

    this._disconnectSettings();
    this._removeButton();
  }

  _connectSettings() {
    logDebug("Connecting Decorator to settings...");

    this._bedtimeModeActiveConnect = extension.settings.connect("bedtime-mode-active-changed", this._onBedtimeModeActiveChanged.bind(this));
    this._buttonLocationConnect = extension.settings.connect("button-location-changed", this._onButtonLocationChanged.bind(this));
    this._buttonBarManualPositionConnect = extension.settings.connect(
      "button-bar-manual-position-changed",
      this._onButtonBarManualPositionChanged.bind(this)
    );
    this._buttonBarPositionValueConnect = extension.settings.connect(
      "button-bar-position-value-changed",
      this._onButtonBarPositionValueChanged.bind(this)
    );
    this._buttonVisibilityConnect = extension.settings.connect("button-visibility-changed", this._onButtonVisibilityChanged.bind(this));
    this._activeScheduleConnect = extension.scheduler.connect("active-schedule-changed", this._onActiveScheduleChanged.bind(this));
  }

  _disconnectSettings() {
    logDebug("Disconnecting Decorator from settings...");

    extension.settings.disconnect(this._bedtimeModeActiveConnect);
    extension.settings.disconnect(this._buttonLocationConnect);
    extension.settings.disconnect(this._buttonBarManualPositionConnect);
    extension.settings.disconnect(this._buttonBarPositionValueConnect);
    extension.scheduler.disconnect(this._activeScheduleConnect);
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
    this._button.update = () => {};

    main.panel.addToStatusArea("BedtimeModeToggleButton", this._button, this._getTopBarPosition());
  }

  _addButtonToMenu() {
    logDebug("Adding On-demand button to System Menu...");

    this._button = new PopupImageMenuItem(this._getMenuItemLabel(), this._getButtonIcon());

    this._button.connect("activate", () => this._toggleBedtimeMode());
    this._button.update = () => {
      this._button.label.text = this._getMenuItemLabel();
      this._button.setIcon(this._getButtonIcon());
    };

    const aggregateMenu = main.panel.statusArea.aggregateMenu;

    aggregateMenu.menu.addMenuItem(this._button, this._getMenuItemPosition(aggregateMenu));
  }

  _getButtonIcon() {
    return Gio.icon_new_for_string(GLib.build_filenamev([Me.path, "icons", "status", "bedtime-mode-symbolic.svg"]));
  }

  _getMenuItemLabel() {
    return extension.settings.bedtimeModeActive ? "Turn Off Bedtime Mode" : "Turn On Bedtime Mode";
  }

  _getTopBarPosition() {
    const manualPosition = extension.settings.buttonBarManualPosition;
    const manualValue = extension.settings.buttonBarPositionValue;
    const defaultValue = main.panel._rightBox.get_n_children() - 1;

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
