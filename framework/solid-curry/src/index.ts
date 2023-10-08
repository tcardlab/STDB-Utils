
import { curryChange, curryCB, onChangeCB } from '@stdb-utils/curry'
import { onCleanup } from 'solid-js'


export function solidCurryChange<T extends Table> (table: I<T>) {
  let onCB = curryChange(table);
  let solidWrapper:curryCB = (cb, filterBypass=[], sub=['+','=','-']) => {
    let unsub = onCB(cb, filterBypass, sub)
    onCleanup(unsub) // will cleanup listeners automatically
    return unsub
  }
  return solidWrapper
}

export type {
  curryCB,
  onChangeCB
}