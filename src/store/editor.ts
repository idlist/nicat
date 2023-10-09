import { ref, shallowRef, toValue, triggerRef, watch } from 'vue'
import { defineStore } from 'pinia'
import { throttle } from 'lodash-es'
import Logger from 'reggol'
import { db, type NicatFile } from './db'
import { useLangStore } from './lang'
import type { Block } from '@/types'

const log = new Logger('editor-store')

export const useEditorStore = defineStore('editor', () => {
  const slot = ref<number>(1)
  const name = ref<string>('')
  const content = shallowRef<Block[]>([])

  const langs = useLangStore()

  const empty = () => {
    return Object.fromEntries(Object.values(langs.dict).map((lang) => [lang, '']))
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

    save()
  }

  const rowRemove = (i: number) => {
    content.value.splice(i, 1)
    save()
  }

  // const rowMove = (i: number, direction: -1 | 1) => {
  //   const current = { ...content.value[i] }
  // }

  const rowSetType = (i: number, type: Block['type']) => {
    content.value[i].type = type
    save()
  }

  const cleanUnused = () => {
    content.value = content.value.filter((block) => {
      let hasContent = false

      for (const input of Object.values(block.content)) {
        if (input.trim() != '') {
          hasContent = true
        }
      }

      return hasContent
    })

    if (content.value.length == 0) {
      rowInsert()
    }

    save()
  }

  const reset = () => {
    content.value = []
    langs.reset()
    save()
  }

  const init = () => {
    content.value = []
    langs.init()
    rowInsert()
    save()
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

  const saveThrottled = throttle(async () => {
    const file = raw()
    localStorage.setItem('slot', file.slot.toString())

    await db.files.put(file)
    log.info(`Data saved to slot ${slot.value}`)
  }, 1000)

  const save = () => {
    triggerRef(content)
    saveThrottled()
  }

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
    save()
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
    save()
  }

  watch(name, async () => {
    await save()
  })

  return {
    slot,
    slotChange,
    name,
    langs,
    content,
    rowInsert,
    rowRemove,
    rowSetType,
    cleanUnused,
    init,
    reset,
    save,
    load,
    copy,
  }
})
