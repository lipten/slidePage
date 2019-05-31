// External libs

// These will have to remain until we (or someone else) writes
// proper .d.ts definition files for them.
declare var template:any;
// node's typings definitions currently break stuff, use this instead
declare var require:any;
declare var process:any;
declare var __dirname:any;
declare var module:any;
declare var DEBUG:boolean;
declare var window:Window;
declare var location:location;
declare var console:any;
declare var document:document;
declare var ca:any;
declare var __PRELOADED_STATE__:any;

interface System {
  import<T = any>(module: string): Promise<T>
}

declare const System: System

declare const iris: import('@cmao/iris').Iris;
declare const CodemaoAuth: any;