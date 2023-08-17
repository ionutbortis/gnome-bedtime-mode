"use strict";

import { logDebug } from "../utils.js";

export class SignalManager {
  constructor() {
    this._connections = [];
  }

  connect(from, to, eventName, handlerName) {
    this._connections.push({
      from: from,
      to: to,
      id: to.connect(eventName, from[handlerName].bind(from)),
    });
  }

  disable() {
    logDebug("Removing connections managed by SignalManager...");

    this._connections.forEach((connection) => connection.to.disconnect(connection.id));
    this._connections.length = 0;
  }
}
