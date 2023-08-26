"use strict";

import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { Settings } from "../modules/Settings.js";
import { ColorTones as ColorTonePresets } from "../model/Presets.js";
import { SignalManager } from "../events/SignalManager.js";
import { logDebug } from "../utils.js";

export class Preferences {
  #signalManager;
  #settings;

  #builder;
  #widget;

  #buttonLocationRow;
  #buttonPositionRow;
  #buttonAppearanceRow;
  #buttonScrollRow;
  #buttonVisibilityCombo;

  constructor(extension) {
    this.#signalManager = new SignalManager();
    extension.signalManager = this.#signalManager;

    this.#settings = new Settings(extension);
    this.#settings.enable();

    this.#builder = new Gtk.Builder();
    this.#builder.set_translation_domain(extension.metadata["gettext-domain"]);
    this.#builder.add_from_file(extension.uiFile);

    this.#widget = this.#builder.get_object("preferences");
    this.#widget.connect("realize", () => this.#handleWindowSize());
    this.#widget.connect("destroy", () => this.#cleanUp());

    this.#createConnections();
    this.#handleUIElements();
  }

  get widget() {
    return this.#widget;
  }

  #handleWindowSize() {
    const window = this.#widget.get_root();

    window.default_width = 650;
    window.default_height = 750;
  }

  #cleanUp() {
    this.#settings.disable();
    this.#signalManager.disable();

    this.#settings = null;
    this.#signalManager = null;
    this.#builder = null;
  }

  #createConnections() {
    logDebug("Creating connections for Preferences...");

    this.#signalManager.connect(this, this.#settings, "automatic-schedule-changed", this.onAutomaticScheduleChanged.name);
    this.#signalManager.connect(this, this.#settings, "button-visibility-changed", this.onButtonVisibilityChanged.name);
    this.#signalManager.connect(this, this.#settings, "button-location-changed", this.onButtonLocationChanged.name);
  }

  #handleUIElements() {
    this.#handleScheduleElements();
    this.#handleOnDemandElements();
    this.#handleColorToneElements();
  }

  #handleScheduleElements() {
    const autoScheduleSwitch = this.#builder.get_object("automatic_schedule_switch");
    this.#settings.gSettings.bind("automatic-schedule", autoScheduleSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const scheduleTimesFrame = this.#builder.get_object("schedule_times_frame");
    this.#settings.gSettings.bind("automatic-schedule", scheduleTimesFrame, "sensitive", Gio.SettingsBindFlags.DEFAULT);

    this.#handleScheduleSpinner("schedule_start_hours_spin", "schedule-start-hours");
    this.#handleScheduleSpinner("schedule_start_minutes_spin", "schedule-start-minutes");
    this.#handleScheduleSpinner("schedule_end_hours_spin", "schedule-end-hours");
    this.#handleScheduleSpinner("schedule_end_minutes_spin", "schedule-end-minutes");
  }

  #handleScheduleSpinner(spinnerId, settingsValueKey) {
    const spinner = this.#builder.get_object(spinnerId);

    this.#settings.gSettings.bind(settingsValueKey, spinner, "value", Gio.SettingsBindFlags.DEFAULT);

    spinner.connect("output", () => {
      const text = spinner.value.toString().padStart(2, "0");
      spinner.set_text(text);
      return true;
    });
  }

  #handleOnDemandElements() {
    const bedtimeModeSwitch = this.#builder.get_object("bedtime_mode_switch");
    this.#settings.gSettings.bind("bedtime-mode-active", bedtimeModeSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const buttonLocationCombo = this.#builder.get_object("ondemand_button_location_combo");
    this.#settings.gSettings.bind("ondemand-button-location", buttonLocationCombo, "active_id", Gio.SettingsBindFlags.DEFAULT);

    this.#buttonVisibilityCombo = this.#builder.get_object("ondemand_button_visibility_combo");
    this.#settings.gSettings.bind("ondemand-button-visibility", this.#buttonVisibilityCombo, "active_id", Gio.SettingsBindFlags.DEFAULT);

    this.#buttonLocationRow = this.#builder.get_object("ondemand_button_location_row");
    this.#buttonLocationRow.sensitive = this.#isButtonVisible();

    const buttonOnOfIndicatorSwitch = this.#builder.get_object("ondemand_button_onoff_indicator_switch");
    this.#settings.gSettings.bind("ondemand-button-bar-onoff-indicator", buttonOnOfIndicatorSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    this.#buttonAppearanceRow = this.#builder.get_object("ondemand_button_appearance_row");
    this.#buttonAppearanceRow.sensitive = this.#isButtonVisible() && this.#isButtonLocatedInTopBar();

    this.#handleButtonPositionElements();
  }

  #handleButtonPositionElements() {
    this.#buttonPositionRow = this.#builder.get_object("ondemand_button_position_row");
    this.#buttonPositionRow.sensitive = this.#isButtonVisible() && this.#isButtonLocatedInTopBar();

    const manualPositionSwitch = this.#builder.get_object("ondemand_button_manual_position_switch");
    this.#settings.gSettings.bind("ondemand-button-bar-manual-position", manualPositionSwitch, "active", Gio.SettingsBindFlags.DEFAULT);

    const manualPositionValueSpinner = this.#builder.get_object("ondemand_button_manual_position_spin");
    this.#settings.gSettings.bind("ondemand-button-bar-position-value", manualPositionValueSpinner, "value", Gio.SettingsBindFlags.DEFAULT);
    this.#settings.gSettings.bind("ondemand-button-bar-manual-position", manualPositionValueSpinner, "sensitive", Gio.SettingsBindFlags.DEFAULT);
  }

  #handleColorToneElements() {
    const colorToneCombo = this.#builder.get_object("color_tone_presets_combo");
    ColorTonePresets.forEach((preset) => colorToneCombo.append(preset.id, _(preset.displayName)));

    this.#settings.gSettings.bind("color-tone-preset", colorToneCombo, "active_id", Gio.SettingsBindFlags.DEFAULT);

    const colorToneFactorSpinner = this.#builder.get_object("color_tone_factor_spin");
    this.#settings.gSettings.bind("color-tone-factor", colorToneFactorSpinner, "value", Gio.SettingsBindFlags.DEFAULT);

    this.#buttonScrollRow = this.#builder.get_object("ondemand_button_scroll_row");
    this.#buttonScrollRow.sensitive = this.#isButtonVisible() && this.#isButtonLocatedInTopBar();

    const buttonScrollEnabledSwitch = this.#builder.get_object("ondemand_button_scroll_enabled_switch");
    this.#settings.gSettings.bind("ondemand-button-bar-scroll-enabled", buttonScrollEnabledSwitch, "active", Gio.SettingsBindFlags.DEFAULT);
  }

  #isButtonVisible() {
    return this.#settings.buttonVisibility !== "never";
  }

  #isButtonLocatedInTopBar() {
    return this.#settings.buttonLocation === "bar";
  }

  onAutomaticScheduleChanged() {
    if (!this.#settings.automaticSchedule && this.#settings.buttonVisibility === "active-schedule") {
      this.#buttonVisibilityCombo.active_id = "always";
    }
  }

  onButtonVisibilityChanged() {
    switch (this.#settings.buttonVisibility) {
      case "active-schedule":
        this.#settings.automaticSchedule = true;

        this.#buttonLocationRow.sensitive = true;
        this.#buttonPositionRow.sensitive = this.#isButtonLocatedInTopBar();
        this.#buttonAppearanceRow.sensitive = this.#isButtonLocatedInTopBar();
        this.#buttonScrollRow.sensitive = this.#isButtonLocatedInTopBar();
        break;

      case "always":
        this.#buttonLocationRow.sensitive = true;
        this.#buttonPositionRow.sensitive = this.#isButtonLocatedInTopBar();
        this.#buttonAppearanceRow.sensitive = this.#isButtonLocatedInTopBar();
        this.#buttonScrollRow.sensitive = this.#isButtonLocatedInTopBar();
        break;

      case "never":
        this.#buttonLocationRow.sensitive = false;
        this.#buttonPositionRow.sensitive = false;
        this.#buttonAppearanceRow.sensitive = false;
        this.#buttonScrollRow.sensitive = false;
        break;
    }
  }

  onButtonLocationChanged() {
    this.#buttonPositionRow.sensitive = this.#isButtonLocatedInTopBar();
    this.#buttonAppearanceRow.sensitive = this.#isButtonLocatedInTopBar();
    this.#buttonScrollRow.sensitive = this.#isButtonLocatedInTopBar();
  }
}
