const { Gio, GObject } = imports.gi;
const { QuickToggle } = imports.ui.quickSettings;

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

var QuickSetting = class {
  constructor() {
    this._toggle = null;
    this._quickSettingsPanel = MainPanel.statusArea.quickSettings;
  }

  create() {
    const quickSettingsMenuGrid = this._quickSettingsPanel.menu._grid;

    const nightLightToggleFinder = (entry) => entry.iconName === "night-light-symbolic";
    const nightLightToggleIndex = quickSettingsMenuGrid.get_children().findIndex(nightLightToggleFinder);

    this._toggle = new BedtimeModeToggle();
    quickSettingsMenuGrid.insert_child_at_index(this._toggle, nightLightToggleIndex);
  }

  destroy() {
    this._toggle?.destroy();
    this._toggle = null;
  }
};
