const { Gio, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;
const { Settings } = Me.imports.modules.Settings;

var Preferences = class {
  constructor() {
    this._buttonLocationRow = null;
    this._buttonVisibilityCombo = null;

    this._automaticScheduleConnect = null;
    this._buttonVisibilityConnect = null;

    this._settings = new Settings();
    this._settings.enable();

    this._builder = new Gtk.Builder();
    this._builder.add_from_file(GLib.build_filenamev([Me.path, "ui", "preferences.ui"]));

    this.widget = this._builder.get_object("preferences");
    this.widget.connect("destroy", () => this._cleanUp());

    this._connectSettings();
  }

  _cleanUp() {
    this._disconnectSettings();

    this._settings.disable();
    this._settings = null;
    this._builder = null;
  }

  _connectSettings() {
    logDebug("Connecting Preferences to settings...");

    this._automaticScheduleConnect = this._settings.connect("automatic-schedule-changed", this._onAutomaticScheduleChanged.bind(this));
    this._buttonVisibilityConnect = this._settings.connect("button-visibility-changed", this._onButtonVisibilityChanged.bind(this));

    const bedtimeModeSwitch = this._builder.get_object("bedtime_mode_switch");
    this._settings.gSettings.bind("bedtime-mode-active", bedtimeModeSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const autoScheduleSwitch = this._builder.get_object("automatic_schedule_switch");
    this._settings.gSettings.bind("automatic-schedule", autoScheduleSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const scheduleTimesFrame = this._builder.get_object("schedule_times_frame");
    this._settings.gSettings.bind("automatic-schedule", scheduleTimesFrame, "sensitive", Gio.SettingsBindFlags.DEFAULT);

    const buttonLocationCombo = this._builder.get_object("ondemand_button_location_combo");
    this._settings.gSettings.bind("ondemand-button-location", buttonLocationCombo, "active_id", Gio.SettingsBindFlags.DEFAULT);

    this._buttonVisibilityCombo = this._builder.get_object("ondemand_button_visibility_combo");
    this._settings.gSettings.bind("ondemand-button-visibility", this._buttonVisibilityCombo, "active_id", Gio.SettingsBindFlags.DEFAULT);

    this._buttonLocationRow = this._builder.get_object("ondemand_button_location_row");

    this._handleSpinner("schedule_start_hours_spin", "schedule-start-hours");
    this._handleSpinner("schedule_start_minutes_spin", "schedule-start-minutes");
    this._handleSpinner("schedule_end_hours_spin", "schedule-end-hours");
    this._handleSpinner("schedule_end_minutes_spin", "schedule-end-minutes");
  }

  _handleSpinner(spinnerId, settingsValueKey) {
    const spinner = this._builder.get_object(spinnerId);

    this._settings.gSettings.bind(settingsValueKey, spinner, "value", Gio.SettingsBindFlags.DEFAULT);

    spinner.connect("output", () => {
      const text = spinner.value.toString().padStart(2, "0");
      spinner.set_text(text);
      return true;
    });
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
        break;

      case "always":
        this._buttonLocationRow.sensitive = true;
        break;

      case "never":
        this._buttonLocationRow.sensitive = false;
        break;
    }
  }

  _disconnectSettings() {
    logDebug("Disconnecting Preferences from settings...");

    this._settings.disconnect(this._automaticScheduleConnect);
    this._settings.disconnect(this._buttonVisibilityConnect);
  }
};
