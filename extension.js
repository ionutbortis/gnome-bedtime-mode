/* extension.js
 *
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

const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

class Bedtime {
  constructor() {
    this._transitions = 50;
    this._transition_delay_ms = 50;

    this._color_effect = new Clutter.DesaturateEffect();
    this._color_effect.factor = 0;
  }

  enable() {
    this._smooth_on();
  }

  disable() {
    this._smooth_off();
  }

  _smooth_on(step = 0) {
    Mainloop.timeout_add(this._transition_delay_ms, () => {
      step++;

      this._add_effect(step);

      step < this._transitions
        ? this._smooth_on(step)
        : this._add_effect(this._transitions);
    });
  }

  _smooth_off(step = this._transitions) {
    Mainloop.timeout_add(this._transition_delay_ms, () => {
      step--;

      this._add_effect(step);

      step > 0 ? this._smooth_off(step) : this._remove_effect();
    });
  }

  _add_effect(step) {
    this._color_effect.factor = step / this._transitions;
    Main.uiGroup.add_effect(this._color_effect);
  }

  _remove_effect() {
    Main.uiGroup.remove_effect(this._color_effect);
  }
}

function init() {
  return new Bedtime();
}
