const { Gio, GLib, Gtk } = imports.gi;
const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();

const { logDebug } = Me.imports.utils;
const { Settings } = Me.imports.modules.Settings;

var Preferences = class {
  constructor() {
    this._settings = new Settings();
    this._settings.enable();

    this._builder = new Gtk.Builder();
    this._builder.add_from_file(GLib.build_filenamev([Me.path, "modules", "ui", "preferences.ui"]));

    this.widget = this._builder.get_object("preferences");

    this._connectSettings();
  }

  _connectSettings() {
    logDebug("Preferences _connectSettings method started...");

    const autoSwitch = this._builder.get_object("automatic_schedule_switch");
    this._settings.settings.bind("automatic-schedule", autoSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const scheduleTimesFrame = this._builder.get_object("schedule_times_frame");
    this._settings.settings.bind("automatic-schedule", scheduleTimesFrame, "sensitive", Gio.SettingsBindFlags.DEFAULT);

    const scheduleStartHoursSpin = this._builder.get_object("schedule_start_hours_spin");

    logDebug(`Schedule Start Hours setting is ${this._settings.settings.scheduleStartHours}`);

    scheduleStartHoursSpin.value = this._settings.settings.scheduleStartHours;
    scheduleStartHoursSpin.connect("output", () => {
      const text = scheduleStartHoursSpin.adjustment.value.toString().padStart(2, "0");
      scheduleStartHoursSpin.set_text(text);
      return true;
    });

    scheduleStartHoursSpin.connect("value-changed", () => {
      this._settings.settings.scheduleStartHours = scheduleStartHoursSpin.value;

      logDebug(`value-chaged handler called. Spinner value is ${scheduleStartHoursSpin.value}`);
    });
  }
};
