"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;

var ColorTones = [
  {
    id: "grayscale",
    displayName: _("Grayscale"),
    brightness: { red: 127, green: 127, blue: 127, alpha: 255 },
    contrast: { red: 127, green: 127, blue: 127, alpha: 255 },
  },
  {
    id: "amber",
    displayName: _("Amber"),
    brightness: { red: 143, green: 71, blue: 0, alpha: 255 },
    contrast: { red: 143, green: 135, blue: 127, alpha: 255 },
  },
  {
    id: "green",
    displayName: _("Green"),
    brightness: { red: 63, green: 127, blue: 0, alpha: 255 },
    contrast: { red: 127, green: 127, blue: 127, alpha: 255 },
  },
  {
    id: "cyan",
    displayName: _("Cyan"),
    brightness: { red: 0, green: 127, blue: 143, alpha: 255 },
    contrast: { red: 127, green: 127, blue: 143, alpha: 255 },
  },
  {
    id: "sepia",
    displayName: _("Sepia"),
    brightness: { red: 143, green: 127, blue: 95, alpha: 255 },
    contrast: { red: 143, green: 127, blue: 127, alpha: 255 },
  },
];
