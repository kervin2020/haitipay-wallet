/// <reference types="node" />

declare global {
  var console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
  };
}

export {};
