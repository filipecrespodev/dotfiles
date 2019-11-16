"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ContextManager {
    constructor() {
        this._listeners = [];
    }
    set(ctx) {
        this._ctx = ctx;
        for (let callback of this._listeners) {
            callback(ctx);
        }
    }
    addInitiatedListener(listener) {
        this._listeners.push(listener);
    }
    get context() {
        return this._ctx;
    }
}
exports.contextManager = new ContextManager();
//# sourceMappingURL=context.js.map