"use strict";

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { logDebug } = Me.imports.utils;

var SignalManager = class {
  constructor() {
    this._connections = [];
  }

  enable() {}

  disable() {
    logDebug("Removing connections managed by SignalManager...");

    this._connections.forEach((connection) => connection.to.disconnect(connection.id));
    this._connections.length = 0;
  }

  connect(from, to, eventName, handlerName) {
    this._connections.push({
      from: from,
      to: to,
      id: to.connect(eventName, from[handlerName].bind(from)),
    });
  }
};
