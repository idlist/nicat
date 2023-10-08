import { ref, shallowRef, toRaw, toValue, triggerRef, watch } from 'vue'
import { defineStore } from 'pinia'
import { debounce } from 'lodash-es'
import Logger from 'reggol'
import { db, type NicatFile } from './db'
import type { Block, RawLangData } from '@/types'

const log = new Logger('editor-store')

export const useEditorStore = defineStore('editor', () => {
  const slot = ref<number>(1)
  const name = ref<string>('')
  const content = shallowRef<Block[]>([])

  const trigger = async () => {
    triggerRef(content)
    await save()
  }

  const langs = {
    id: ref<number>(1),
    dict: ref<Record<string, string>>({}),
    order: ref<number[]>([]),

    _id(id: number | string) {
      return typeof id == 'number' ? id : parseInt(id)
    },

    add() {
      const { id, dict, order } = langs
      dict.value[langs.id.value] = `Language ${id.value}`
      order.value.push(id.value)
      id.value++

      for (const block of content.value) {
        block.content[id.value] = ''
      }

      trigger()
    },

    remove(id: number | string) {
      id = langs._id(id)
      const { dict, order } = langs
      delete dict.value[id]
      order.value = order.value.filter((o) => o != id)

      for (const block of content.value) {
        delete block.content[id]
      }

      trigger()
    },

    move(id: number | string, direction: -1 | 1) {
      id = langs._id(id)
      const { order } = langs
      const current = order.value.indexOf(id)

      if (current == 0 && direction == -1) {
        return
      }
      if (current == order.value.length - 1 && direction == 1) {
        return
      }

      const next = current + direction
      order.value.splice(current, 1)
      order.value.splice(next, 0, id)
    },

    rename(id: number | string, name: string) {
      const { dict } = langs
      dict.value[id] = name

      trigger()
    },

    reset() {
      const { id, dict, order } = langs
      id.value = 1
      dict.value = {}
      order.value = []
    },

    init() {
      const { id, dict, order } = langs
      id.value = 3
      dict.value = { 1: 'English', 2: 'Chinese' }
      order.value = [1, 2]
    },

    raw(): RawLangData {
      const { id, dict, order } = langs

      return {
        id: toValue(id),
        dict: toRaw(toValue(dict)),
        order: toRaw(toValue(order)),
      }
    },

    restore(data: RawLangData) {
      const { id, dict, order } = langs
      id.value = data.id
      dict.value = data.dict
      order.value = data.order
    },
  }

  const empty = () => {
    return Object.fromEntries(Object.values(langs).map((lang) => [lang, '']))
  }

  const rowInsert = (i: number = content.value.length) => {
    if (i < content.value.length) {
      content.value.splice(i, 0, {
        type: 'text',
        content: empty(),
      })
    } else {
      content.value.push({
        type: 'text',
        content: empty(),
      })
    }

    trigger()
  }

  const rowRemove = (i: number) => {
    content.value.splice(i, 1)
    trigger()
  }

  const rowTypeSet = (i: number, type: Block['type']) => {
    content.value[i].type = type
    trigger()
  }

  const reset = () => {
    content.value = []
    langs.reset()
    trigger()
  }

  const init = () => {
    content.value = []
    langs.init()
    rowInsert()
  }

  const raw = (): NicatFile => {
    return {
      slot: toValue(slot),
      name: toValue(name),
      langs: langs.raw(),
      content: toValue(content),
    }
  }

  const restore = (file: NicatFile, to?: number) => {
    slot.value = to ?? file.slot
    name.value = file.name
    langs.restore(file.langs)
    content.value = file.content

    localStorage.setItem('slot', slot.value.toString())
  }

  const save = debounce(async () => {
    const file = raw()
    localStorage.setItem('slot', file.slot.toString())

    await db.files.put(file)
    log.info(`Data saved to slot ${slot.value}`)
  }, 1000)

  const load = async () => {
    const slotStored = localStorage.getItem('slot')
    if (!slotStored) {
      slot.value = 1
      init()
      return
    }

    slot.value = parseInt(slotStored)
    const file = await db.files.where('slot').equals(slot.value).first()
    if (!file) {
      init()
      return
    }

    restore(file)
    trigger()
  }

  const copy = async (from: number, to?: number) => {
    if (typeof to === 'undefined') {
      to = slot.value
    }

    const file = await db.files.where('slot').equals(from).first()
    if (!file) {
      init()
      return
    }

    restore(file, to)
    trigger()
  }

  const slotChange = async (to: number) => {
    if (to == slot.value) {
      return
    }

    await save()

    const file = await db.files.where('slot').equals(to).first()
    if (!file) {
      init()
      return
    }

    restore(file)
    trigger()
  }

  watch(name, async () => {
    await save()
  })

  return {
    slot,
    name,
    langs,
    content,
    trigger,
    rowInsert,
    rowRemove,
    rowTypeSet,
    init,
    reset,
    save,
    load,
    copy,
    slotChange,
  }
})
