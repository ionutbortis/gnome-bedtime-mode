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

const { extensionUtils } = imports.misc;

const Me = extensionUtils.getCurrentExtension();
const config = Me.imports.config;

/**
 * Output a debug message to the console if the debug config is active.
 *
 * @param {string} message The message to log.
 */
function logDebug(message) {
  if (config.debug) log(`[DEBUG] ${Me.metadata.name}: ${message}`);
}

/**
 * This runs in a loop the provided function at the specified interval.
 * The function is run multiple times if it returns true. The loop is stopped
 * when the supplied function to run returns false.
 *
 * @param {*} func The function to loop at the specified interval
 * @param {*} interval The time in ms at which to loop call the function
 * @param  {...any} args Optional arguments to the function
 */
function loopRun(func, interval, ...args) {
  const wrappedFunc = () => {
    return func.apply(this, args);
  };
  return GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, wrappedFunc);
}
