/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
const { GLib } = imports.gi;

const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;

const { extensionUtils } = imports.misc;
const Me = extensionUtils.getCurrentExtension();

const { setInterval, logDebug } = Me.imports.utils;

class Bedtime {
  constructor() {
    this._transitions = 50;

    this._transitionDelayMillis = 50;

    this._color_effect = new Clutter.DesaturateEffect();
    this._color_effect.factor = 0;

    this._transitionStep = 0;

    this._transitionTimerId = null;
  }

  enable() {
    logDebug("Enabling extension...");
    this._turnOn();
  }

  disable() {
    logDebug("Disabling extension...");
    this._turnOff();
  }

  _turnOn() {
    this._transitionStep = 0;

    this._transitionTimerId = setInterval(
      this._smoothOn.bind(this),
      this._transitionDelayMillis
    );
  }

  _turnOff() {
    this._transitionStep = this._transitions;

    this._transitionTimerId = setInterval(
      this._smoothOff.bind(this),
      this._transitionDelayMillis
    );
  }

  _smoothOn() {
    this._transitionStep++;
    this._addEffect();

    return this._transitionStep < this._transitions;
  }

  _smoothOff() {
    this._transitionStep--;
    this._addEffect();

    if (this._transitionStep > 0) return true;
    else this._cleanUp();
  }

  _addEffect() {
    this._color_effect.factor = this._transitionStep / this._transitions;

    logDebug(`Effect factor: ${this._color_effect.factor}`);
    Main.uiGroup.add_effect(this._color_effect);
  }

  _removeEffect() {
    Main.uiGroup.remove_effect(this._color_effect);
  }

  _disableTransitionTimer() {
    if (this._transitionTimerId) {
      GLib.Source.remove(this._transitionTimerId);
      this._transitionTimerId = null;
    }
  }

  _cleanUp() {
    logDebug("Starting cleanup...");
    this._removeEffect();
    this._disableTransitionTimer();
  }
}

function init() {
  logDebug("Initializing extension...");
  return new Bedtime();
}
