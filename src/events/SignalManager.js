"use strict";

import { logDebug } from "../utils.js";

export class SignalManager {
  #connections;

  constructor() {
    this.#connections = [];
  }

  connect(from, to, eventName, handlerName) {
    this.#connections.push({
      from: from,
      to: to,
      id: to.connect(eventName, from[handlerName].bind(from)),
    });
  }

  disable() {
    logDebug("Removing connections managed by SignalManager...");

    this.#connections.forEach((connection) => connection.to.disconnect(connection.id));
    this.#connections.length = 0;
  }
}
