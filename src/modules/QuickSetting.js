const { Gio, GObject } = imports.gi;
const { QuickToggle, SystemIndicator } = imports.ui.quickSettings;

const MainPanel = imports.ui.main.panel;

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
    const quickSettingsMenuGrid = this._quickSettingsPanel.menu._grid;

    const nightLightToggleFinder = (entry) => entry.iconName === "night-light-symbolic";
    const nightLightToggleIndex = quickSettingsMenuGrid.get_children().findIndex(nightLightToggleFinder);

    this._indicator = new Indicator();
    quickSettingsMenuGrid.insert_child_at_index(this._indicator.quickSettingsItems[0], nightLightToggleIndex);
  }

  destroy() {
    this._indicator.quickSettingsItems.forEach((item) => item.destroy());
    this._indicator.destroy();
    this._indicator = null;
  }
};
