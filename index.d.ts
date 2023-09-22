import {SpacetimeDBClient, ReducerEvent} from '@clockworklabs/spacetimedb-sdk'

export {}

declare global {
/***  HELPERS   ***/
  export type Red = ReducerEvent | undefined
  export type I<T extends new (...args: any[]) =>any> = InstanceType<T>
  export type IN<T extends new (...args: any[]) =>any> = InstanceType<T> | null
  export type CB<T extends Table> = (v:IN<T>, vOld?:IN<T>, red?:Red)=>void
  export type noop = (()=>void)

  export interface sClient extends SpacetimeDBClient {
    solidified?: boolean;
  }

/***   STDB TYPES   ***/
  // Would be nice if SpacetimeDB exposed such types for building helper functions
  export interface Table {
    new (...args: any[]): any;
    onInsert: (cb: (value: any, reducerEvent: Red) => void) => void;
    onDelete: (cb: (value: any, reducerEvent: Red) => void) => void;
    onUpdate: (cb: (value: any, oldValue: any, reducerEvent: Red) => void) => void;
    removeOnInsert: (cb: (value: any, reducerEvent: Red) => void) => void;
    removeOnDelete: (cb: (value: any, reducerEvent: Red) => void) => void;
    removeOnUpdate: (cb: (value: any, oldValue: any, reducerEvent: Red) => void) => void;
    all: ()=>any[];
    //[index:string]: (cb:(...args: any[]) => void)=>void;
  }

  export class DBOp {
    public type: "insert" | "delete";
    public instance: any;
    public rowPk: string;
  
    constructor(type: "insert" | "delete", rowPk: string, instance: any) {
      this.type = type;
      this.rowPk = rowPk;
      this.instance = instance;
    }
  }

  // Strongly Typed
  /* export interface StrongTable<T extends new (...args: any[]) =>any> {
    new (...args: any[]): I<T>;
    onInsert: (cb: (value: I<T>, reducerEvent: Red) => void) => void;
    onDelete: (cb: (value: I<T>, reducerEvent: Red) => void) => void;
    onUpdate: (cb: (value: I<T>, oldValue: I<T>, reducerEvent: Red) => void) => void;
    removeOnInsert: (cb: (value: I<T>, reducerEvent: Red) => void) => void;
    removeOnDelete: (cb: (value: I<T>, reducerEvent: Red) => void) => void;
    removeOnUpdate: (cb: (value: I<T>, oldValue: I<T>, reducerEvent: Red) => void) => void;
    all: ()=>I<T>[];
    [index:string]: (cb:(...args: any[]) => void)=>void
  }

  export type InsertCB<T extends Table> = (cb: (value: I<T>, reducerEvent: Red) => void) => void;
  export type updateCB<T extends Table> = (cb: (value: I<T>, reducerEvent: Red) => void) => void;
  export type deleteCB<T extends Table> = (cb: (value: I<T>, oldValue: I<T>, reducerEvent: Red) => void) => void;
 */

  /* 
  // Table3
  export type InsertCB<T> = (cb: (value: T, reducerEvent: Red) => void) => void;
  export type updateCB<T> = (cb: (value: T, reducerEvent: Red) => void) => void;
  export type deleteCB<T> = (cb: (value: T, oldValue: T, reducerEvent: Red) => void) => void;
  export interface Table3<T extends new (...args: any[]) =>any> {
    new (...args: any[]): I<T>;
    onInsert: InsertCB<T>
    onUpdate: updateCB<T>
    onDelete: deleteCB<T>;
    removeOnInsert: InsertCB<T>;
    removeOnUpdate: updateCB<T>
    removeOnDelete: deleteCB<T>;
    all: ()=>I<T>[];
    [index:string]: (cb:(...args: any[]) => void)=>void
  } */

  // Table4
  export type InsertCB<T> = (cb: (value: T, reducerEvent: Red) => void) => void;
  export type updateCB<T> = (cb: (value: T, reducerEvent: Red) => void) => void;
  export type deleteCB<T> = (cb: (value: T, oldValue: T, reducerEvent: Red) => void) => void;
  export interface Table4<T extends new (...args: any[]) =>any> {
    new (...args: any[]): I<T>;
    onInsert: InsertCB<Table4<T>>
    onUpdate: updateCB<Table4<T>>
    onDelete: deleteCB<Table4<T>>;
    removeOnInsert: InsertCB<Table4<T>>;
    removeOnUpdate: updateCB<Table4<T>>
    removeOnDelete: deleteCB<Table4<T>>;
    all: ()=>I<Table4<T>>[];
    [index:string]: (cb:(...args: any[]) => void)=>void
  }
}