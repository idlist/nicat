import Dexie, { type Table } from 'dexie'
import type { Block } from '@/types'
import type { RawLangData } from './lang'
import type { SheetSettings } from './settings'

export interface NicatFile {
  slot: number
  name: string
  langs: RawLangData
  settings: SheetSettings
  content: Block[]
}

export class NicatDatabase extends Dexie {
  files!: Table<NicatFile>

  constructor() {
    super('nicat')
    this.version(1).stores({
      files: 'slot, name',
    })
  }
}

export const db = new NicatDatabase()
