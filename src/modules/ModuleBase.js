"use strict";

export class ModuleBase {
  constructor(extension) {
    if (this.constructor === ModuleBase) throw new Error("ModuleBase cannot be used directly.");

    if (!extension) throw new Error(`${this.constructor.name} did not pass 'extension' to parent.`);

    this.extension = extension;
  }

  enable() {
    throw new Error("You need to implement 'enable' in subclass.");
  }

  disable() {
    throw new Error("You need to implement 'disable' in subclass.");
  }
}
