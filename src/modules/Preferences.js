"use strict";

const { Gio, Gtk } = imports.gi;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;

const { getPreferencesUiFile, logDebug, ShellVersion } = Me.imports.utils;
const { Settings } = Me.imports.modules.Settings;
const { SignalManager } = Me.imports.modules.SignalManager;

const ColorTonePresets = Me.imports.modules.Presets.ColorTones;

var Preferences = class {
  constructor() {
    this._buttonLocationRow = null;
    this._buttonPositionRow = null;
    this._buttonAppearanceRow = null;
    this._buttonVisibilityCombo = null;

    this._signalManager = new SignalManager();
    this._signalManager.enable();

    this._settings = new Settings(this._signalManager);
    this._settings.enable();

    this._builder = new Gtk.Builder();
    this._builder.set_translation_domain(Me.metadata["gettext-domain"]);
    this._builder.add_from_file(getPreferencesUiFile());

    this.widget = this._builder.get_object("preferences");
    this.widget.connect("realize", () => this._handleWindowSize());
    this.widget.connect("destroy", () => this._cleanUp());

    this._createConnections();
    this._handleUIElements();
  }

  _handleWindowSize() {
    const window = ShellVersion < 40 ? this.widget.get_toplevel() : this.widget.get_root();

    window.default_width = 650;
    window.default_height = 750;

    ShellVersion < 40 && window.resize(window.default_width, window.default_height);
  }

  _cleanUp() {
    this._settings.disable();
    this._signalManager.disable();

    this._settings = null;
    this._signalManager = null;
    this._builder = null;
  }

  _createConnections() {
    logDebug("Creating connections for Preferences...");

    this._signalManager.connect(this, this._settings, "automatic-schedule-changed", this._onAutomaticScheduleChanged.name);
    this._signalManager.connect(this, this._settings, "button-visibility-changed", this._onButtonVisibilityChanged.name);
    this._signalManager.connect(this, this._settings, "button-location-changed", this._onButtonLocationChanged.name);
  }

  _handleUIElements() {
    this._handleScheduleElements();
    this._handleOnDemandElements();
    this._handleColorToneElements();
  }

  _handleScheduleElements() {
    const autoScheduleSwitch = this._builder.get_object("automatic_schedule_switch");
    this._settings.gSettings.bind("automatic-schedule", autoScheduleSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const scheduleTimesFrame = this._builder.get_object("schedule_times_frame");
    this._settings.gSettings.bind("automatic-schedule", scheduleTimesFrame, "sensitive", Gio.SettingsBindFlags.DEFAULT);

    this._handleScheduleSpinner("schedule_start_hours_spin", "schedule-start-hours");
    this._handleScheduleSpinner("schedule_start_minutes_spin", "schedule-start-minutes");
    this._handleScheduleSpinner("schedule_end_hours_spin", "schedule-end-hours");
    this._handleScheduleSpinner("schedule_end_minutes_spin", "schedule-end-minutes");
  }

  _handleScheduleSpinner(spinnerId, settingsValueKey) {
    const spinner = this._builder.get_object(spinnerId);

    this._settings.gSettings.bind(settingsValueKey, spinner, "value", Gio.SettingsBindFlags.DEFAULT);

    spinner.connect("output", () => {
      const text = spinner.value.toString().padStart(2, "0");
      spinner.set_text(text);
      return true;
    });
  }

  _handleOnDemandElements() {
    const bedtimeModeSwitch = this._builder.get_object("bedtime_mode_switch");
    this._settings.gSettings.bind("bedtime-mode-active", bedtimeModeSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const buttonLocationCombo = this._builder.get_object("ondemand_button_location_combo");
    this._settings.gSettings.bind("ondemand-button-location", buttonLocationCombo, "active_id", Gio.SettingsBindFlags.DEFAULT);

    this._buttonVisibilityCombo = this._builder.get_object("ondemand_button_visibility_combo");
    this._settings.gSettings.bind("ondemand-button-visibility", this._buttonVisibilityCombo, "active_id", Gio.SettingsBindFlags.DEFAULT);

    this._buttonLocationRow = this._builder.get_object("ondemand_button_location_row");
    this._buttonLocationRow.sensitive = this._settings.buttonVisibility !== "never";

    const buttonOnOfIndicatorSwitch = this._builder.get_object("ondemand_button_onoff_indicator_switch");
    this._settings.gSettings.bind("ondemand-button-bar-onoff-indicator", buttonOnOfIndicatorSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    this._buttonAppearanceRow = this._builder.get_object("ondemand_button_appearance_row");
    this._buttonAppearanceRow.sensitive = this._settings.buttonLocation === "bar" && this._settings.buttonVisibility !== "never";

    this._handleButtonPositionElements();
  }

  _handleButtonPositionElements() {
    this._buttonPositionRow = this._builder.get_object("ondemand_button_position_row");
    this._buttonPositionRow.sensitive = this._settings.buttonLocation === "bar" && this._settings.buttonVisibility !== "never";

    const manualPositionSwitch = this._builder.get_object("ondemand_button_manual_position_switch");
    this._settings.gSettings.bind("ondemand-button-bar-manual-position", manualPositionSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const manualPositionValueSpinner = this._builder.get_object("ondemand_button_manual_position_spin");
    this._settings.gSettings.bind("ondemand-button-bar-position-value", manualPositionValueSpinner, "value", Gio.SettingsBindFlags.DEFAULT);
    this._settings.gSettings.bind("ondemand-button-bar-manual-position", manualPositionValueSpinner, "sensitive", Gio.SettingsBindFlags.DEFAULT);
  }

  _handleColorToneElements() {
    const colorToneCombo = this._builder.get_object("color_tone_presets_combo");
    ColorTonePresets.forEach((preset) => colorToneCombo.append(preset.id, _(preset.displayName)));

    this._settings.gSettings.bind("color-tone-preset", colorToneCombo, "active_id", Gio.SettingsBindFlags.DEFAULT);

    const colorToneFactorSpinner = this._builder.get_object("color_tone_factor_spin");
    this._settings.gSettings.bind("color-tone-factor", colorToneFactorSpinner, "value", Gio.SettingsBindFlags.DEFAULT);
  }

  _onAutomaticScheduleChanged() {
    if (!this._settings.automaticSchedule && this._settings.buttonVisibility === "active-schedule") {
      this._buttonVisibilityCombo.active_id = "always";
    }
  }

  _onButtonVisibilityChanged() {
    switch (this._settings.buttonVisibility) {
      case "active-schedule":
        this._settings.automaticSchedule = true;
        this._buttonLocationRow.sensitive = true;
        this._buttonPositionRow.sensitive = this._settings.buttonLocation === "bar";
        this._buttonAppearanceRow.sensitive = this._settings.buttonLocation === "bar";
        break;

      case "always":
        this._buttonLocationRow.sensitive = true;
        this._buttonPositionRow.sensitive = this._settings.buttonLocation === "bar";
        this._buttonAppearanceRow.sensitive = this._settings.buttonLocation === "bar";
        break;

      case "never":
        this._buttonLocationRow.sensitive = false;
        this._buttonPositionRow.sensitive = false;
        this._buttonAppearanceRow.sensitive = false;
        break;
    }
  }

  _onButtonLocationChanged() {
    this._buttonPositionRow.sensitive = this._settings.buttonLocation === "bar";
    this._buttonAppearanceRow.sensitive = this._settings.buttonLocation === "bar";
  }
};
