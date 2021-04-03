"use strict";

const { Gio, GLib, St } = imports.gi;
const { main } = imports.ui;
const { Button: PanelMenuButton } = imports.ui.panelMenu;
const { PopupImageMenuItem } = imports.ui.popupMenu;

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const extension = Me.imports.extension;

const { loopRun, logDebug } = Me.imports.utils;

var Decorator = class {
  constructor() {
    this._button = null;
    this._topBarItemsCheckLoopId = null;

    this._buttonLocationConnect = null;
    this._buttonBarPositionOffsetConnect = null;
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
    this._removeLoops();
  }

  _connectSettings() {
    logDebug("Connecting Decorator to settings...");

    this._buttonLocationConnect = extension.settings.connect("button-location-changed", this._onButtonLocationChanged.bind(this));
    this._buttonBarPositionOffsetConnect = extension.settings.connect(
      "button-bar-position-offset-changed",
      this._onButtonBarPositionOffsetChanged.bind(this)
    );
    this._buttonVisibilityConnect = extension.settings.connect("button-visibility-changed", this._onButtonVisibilityChanged.bind(this));
    this._activeScheduleConnect = extension.scheduler.connect("active-schedule-changed", this._onActiveScheduleChanged.bind(this));
  }

  _disconnectSettings() {
    logDebug("Disconnecting Decorator from settings...");

    extension.settings.disconnect(this._buttonLocationConnect);
    extension.settings.disconnect(this._buttonBarPositionOffsetConnect);
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
    const currentCount = main.panel._rightBox.get_children().length;

    if (extension.settings.buttonBarPositionOffset > currentCount) {
      // This happens after a gnome restart and we need to wait and recheck the top bar items count
      this._topBarItemsCheckLoopId = loopRun(this._checkTopBarItems.bind(this), 1000);
      return 0;
    } else {
      const computedPosition = currentCount - extension.settings.buttonBarPositionOffset;
      logDebug(`Computed top bar position is '${computedPosition}'`);
      logDebug(`Offset is '${extension.settings.buttonBarPositionOffset}', top bar count is '${currentCount}'`);

      return computedPosition;
    }
  }

  _checkTopBarItems() {
    const currentCount = main.panel._rightBox.get_children().length;

    if (extension.settings.buttonBarPositionOffset > currentCount) {
      logDebug("Offset greater than bar items count, continue check loop");
      return true; // continue loop
    } else {
      logDebug("Offset ok, redrawing button");
      this._redrawButton();
    }
  }

  _getMenuItemPosition(aggregateMenu) {
    const items = aggregateMenu.menu._getMenuItems();
    return items.indexOf(aggregateMenu._system.menu) - 1;
  }

  _onButtonLocationChanged() {
    this._redrawButton();
  }

  _onButtonVisibilityChanged() {
    this._redrawButton();
  }

  _onButtonBarPositionOffsetChanged() {
    if (this._getTopBarPosition() <= 0) {
      logDebug("Button is at the left most position, resetting offset to 0");
      extension.settings.buttonBarPositionOffset = 0;
      return;
    }
    this._redrawButton();
  }

  _onActiveScheduleChanged() {
    if (extension.settings.buttonVisibility === "active-schedule") {
      this._redrawButton();
    }
  }

  _redrawButton() {
    this._removeButton();
    this._addButton();
  }

  _toggleBedtimeMode() {
    extension.settings.bedtimeModeActive = !extension.settings.bedtimeModeActive;
  }

  _removeLoops() {
    if (this._topBarItemsCheckLoopId) {
      GLib.Source.remove(this._topBarItemsCheckLoopId);
      this._topBarItemsCheckLoopId = null;
    }
  }
};
