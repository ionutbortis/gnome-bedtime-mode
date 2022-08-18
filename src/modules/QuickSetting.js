const { Gio, GLib, GObject } = imports.gi;

const Main = imports.ui.main;
const MainPanel = Main.panel;

const { QuickToggle, SystemIndicator } = imports.ui.quickSettings;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { getExtensionIcon } = Me.imports.utils;

const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;

const BedtimeModeToggle = GObject.registerClass(
  class BedtimeModeToggle extends QuickToggle {
    _init() {
      super._init({
        label: _("Bedtime Mode"),
        gicon: getExtensionIcon(),
        toggleMode: true,
      });

      this._settings = ExtensionUtils.getSettings();
      this._settings.bind("bedtime-mode-active", this, "checked", Gio.SettingsBindFlags.DEFAULT);
    }
  }
);

const Indicator = GObject.registerClass(
  class Indicator extends SystemIndicator {
    _init() {
      super._init();
      this.quickSettingsItems.push(new BedtimeModeToggle());
    }
  }
);

var QuickSetting = class {
  constructor() {
    this._quickSettingsPanel = MainPanel.statusArea.quickSettings;
  }

  create() {
    this._indicator = new Indicator();
    this._quickSettingsPanel._indicators.add_child(this._indicator);
    this._quickSettingsPanel._addItems(this._indicator.quickSettingsItems);
  }

  destroy() {
    this._indicator.quickSettingsItems.forEach((item) => item.destroy());
    this._indicator.destroy();
    this._indicator = null;
  }
};
