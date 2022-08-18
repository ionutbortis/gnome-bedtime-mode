"use strict";

const { Gio, GLib, St, Clutter } = imports.gi;
const { Button: PanelMenuButton } = imports.ui.panelMenu;
const { PopupImageMenuItem } = imports.ui.popupMenu;
const MainPanel = imports.ui.main.panel;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;

const extension = Me.imports.extension;
const { getExtensionIcon, logDebug } = Me.imports.utils;

const { QuickSetting } = Me.imports.modules.QuickSetting;

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
      gicon: getExtensionIcon(),
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

    this._button = new QuickSetting();
    this._button.create();
  }

  _getButtonOpacity() {
    const fullOpacity = 255;
    const reducedOpacity = 0.35 * fullOpacity;

    if (!extension.settings.buttonBarOnOffIndicator) return fullOpacity;

    return extension.settings.bedtimeModeActive ? fullOpacity : reducedOpacity;
  }

  _handleButtonScroll(event) {
    if (!(extension.settings.buttonBarScrollEnabled && extension.settings.bedtimeModeActive)) return;

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
    if (extension.settings.colorToneFactor <= 95) extension.settings.colorToneFactor += 5;
    else extension.settings.colorToneFactor = 100;
  }

  _decreaseColorToneFactor() {
    if (extension.settings.colorToneFactor >= 15) extension.settings.colorToneFactor -= 5;
    else extension.settings.colorToneFactor = 10;
  }

  _getMenuItemLabel() {
    return extension.settings.bedtimeModeActive ? _("Turn Off Bedtime Mode") : _("Turn On Bedtime Mode");
  }

  _getTopBarPosition() {
    const quickSettingsMenuFinder = (entry) => entry.get_child() === MainPanel.statusArea.quickSettings;
    const quickSettingsMenuIndex = MainPanel._rightBox.get_children().findIndex(quickSettingsMenuFinder);

    const defaultValue = quickSettingsMenuIndex > -1 ? quickSettingsMenuIndex : 0;
    const manualPosition = extension.settings.buttonBarManualPosition;
    const manualValue = extension.settings.buttonBarPositionValue;

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
    extension.settings.bedtimeModeActive = !extension.settings.bedtimeModeActive;
  }
};
