export as namespace liblouis;

export enum LOG {
     ALL   =     0,
     DEBUG = 10000,
     INFO  = 20000,
     WARN  = 30000,
     ERROR = 40000,
     FATAL = 50000,
     OFF   = 60000
}

export function disableOnDemandTableLoading() : void;
export function enableOnDemandTableLoading(tableurl :string) : void;
export function loadTable(tablename :string, url :string) : void;
export function translateString(table :string, inbuf :string) : string;
export function backTranslateString(table :string, inbuf :string) : string;
export function registerLogCallback(fn :(i? :int, msg? :msg) => any) : void;
export function version() : string;
export function setLogLevel(lvl :LOG) : void;
export function getTable(table :string) : number;
export function checkTable(table :string) : number;
export function free() : void;
export function charSize() : number;
export function getFilesystem() : any;
export function setLiblouisBuild(build : any) : void;
export function compileString(table :string, str :string) : boolean;
