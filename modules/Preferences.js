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
    this._settings.gSettings.bind("automatic-schedule", autoSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const scheduleTimesFrame = this._builder.get_object("schedule_times_frame");
    this._settings.gSettings.bind("automatic-schedule", scheduleTimesFrame, "sensitive", Gio.SettingsBindFlags.DEFAULT);

    const scheduleStartHoursSpin = this._builder.get_object("schedule_start_hours_spin");
    scheduleStartHoursSpin.value = this._settings.scheduleStartHours;
    scheduleStartHoursSpin.connect("output", () => {
      const text = scheduleStartHoursSpin.adjustment.value.toString().padStart(2, "0");
      scheduleStartHoursSpin.set_text(text);
      return true;
    });
    scheduleStartHoursSpin.connect("value-changed", () => {
      this._settings.scheduleStartHours = scheduleStartHoursSpin.value;
    });

    const scheduleStartMinutesSpin = this._builder.get_object("schedule_start_minutes_spin");
    scheduleStartMinutesSpin.value = this._settings.scheduleStartMinutes;
    scheduleStartMinutesSpin.connect("output", () => {
      const text = scheduleStartMinutesSpin.adjustment.value.toString().padStart(2, "0");
      scheduleStartMinutesSpin.set_text(text);
      return true;
    });
    scheduleStartMinutesSpin.connect("value-changed", () => {
      this._settings.scheduleStartMinutes = scheduleStartMinutesSpin.value;
    });

    const scheduleEndHoursSpin = this._builder.get_object("schedule_end_hours_spin");
    scheduleEndHoursSpin.value = this._settings.scheduleEndHours;
    scheduleEndHoursSpin.connect("output", () => {
      const text = scheduleEndHoursSpin.adjustment.value.toString().padStart(2, "0");
      scheduleEndHoursSpin.set_text(text);
      return true;
    });
    scheduleEndHoursSpin.connect("value-changed", () => {
      this._settings.scheduleEndHours = scheduleEndHoursSpin.value;
    });

    const scheduleEndMinutesSpin = this._builder.get_object("schedule_end_minutes_spin");
    scheduleEndMinutesSpin.value = this._settings.scheduleEndMinutes;
    scheduleEndMinutesSpin.connect("output", () => {
      const text = scheduleEndMinutesSpin.adjustment.value.toString().padStart(2, "0");
      scheduleEndMinutesSpin.set_text(text);
      return true;
    });
    scheduleEndMinutesSpin.connect("value-changed", () => {
      this._settings.scheduleEndMinutes = scheduleEndMinutesSpin.value;
    });
  }
};
