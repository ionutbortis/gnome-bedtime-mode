"use strict";

export class ModuleBase {
  #extension;

  constructor(extension) {
    if (this.constructor === ModuleBase) throw new Error("ModuleBase cannot be used directly.");

    if (!extension) throw new Error(`${this.constructor.name} did not pass 'extension' to parent.`);
    if (!extension.signalManager) throw new Error("extension.signalManager is not initialized.");

    this.#extension = extension;
  }

  get extension() {
    return this.#extension;
  }

  createConnection(to, settingsKey, handlerName) {
    this.#extension.signalManager.connect(this, to, settingsKey, handlerName);
  }

  enable() {
    throw new Error("You need to implement 'enable' in subclass.");
  }

  disable() {
    throw new Error("You need to implement 'disable' in subclass.");
  }
}
