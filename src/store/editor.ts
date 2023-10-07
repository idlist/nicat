import { ref, shallowRef, triggerRef, watch, toValue, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { debounce } from 'lodash-es'
import Logger from 'reggol'
import { db, type NicatFile } from './db'
import type { Block } from '@/types'

const log = new Logger('editor-store')

export const useEditorStore = defineStore('editor', () => {
  const slot = ref<number>(1)
  const name = ref<string>('')
  const langs = ref<string[]>([])
  const content = shallowRef<Block[]>([])

  const trigger = async () => {
    triggerRef(content)
    await save()
  }

  const setLang = (next: string[]) => {
    const prev = langs.value
    langs.value = next

    const dropped: string[] = []
    for (const lang of prev) {
      if (next.includes(lang)) {
        dropped.push(lang)
      }
    }
    const added: string[] = []
    for (const lang of next) {
      if (prev.includes(lang)) {
        added.push(lang)
      }
    }

    for (const block of content.value) {
      for (const lang of dropped) {
        delete block.content[lang]
      }
      for (const lang of added) {
        block.content[lang] = ''
      }
    }

    trigger()
  }

  const renameLang = (i: number, next: string) => {
    const prev = langs.value[i]

    for (const block of content.value) {
      const t = block.content[prev]
      delete block.content[prev]
      block.content[next] = t
    }

    langs.value[i] = next
    trigger()
  }

  const empty = () => {
    return Object.fromEntries(langs.value.map((lang) => [lang, '']))
  }

  const insert = (i: number = content.value.length) => {
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

  const remove = (i: number) => {
    content.value.splice(i, 1)
    trigger()
  }

  const setType = (i: number, type: Block['type']) => {
    content.value[i].type = type
    trigger()
  }

  const clear = () => {
    langs.value = []
    content.value = []
    trigger()
  }

  const init = () => {
    clear()
    langs.value = ['English', 'Chinese']
    insert()
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

    name.value = file.name
    langs.value = file.langs
    content.value = file.content
    trigger()
  }

  const copy = async (from: number, to?: number) => {
    let dest: number

    if (typeof to === 'undefined') {
      dest = slot.value
    } else {
      dest = to
    }

    const file = await db.files.where('slot').equals(from).first()
    if (!file) {
      init()
      return
    }

    await save()

    slot.value = dest
    localStorage.setItem('slot', slot.value.toString())
    name.value = file.name
    langs.value = file.langs
    content.value = file.content
    trigger()
  }

  const save = debounce(async (data?: NicatFile) => {
    const file: NicatFile = {
      slot: toValue(slot),
      name: toValue(name),
      langs: toRaw(toValue(langs)),
      content: toValue(content),
      ...data,
    }

    localStorage.setItem('slot', file.slot.toString())
    await db.files.put(file)
    log.info(`Data saved to slot ${slot.value}`)
  }, 1000)

  const setSlot = async (next: number) => {
    if (next == slot.value) {
      return
    }

    await save()

    const file = await db.files.where('slot').equals(next).first()
    if (!file) {
      init()
      return
    }

    localStorage.setItem('slot', slot.value.toString())
    name.value = file.name
    langs.value = file.langs
    content.value = file.content
    trigger()
  }

  watch(name, async () => {
    await save()
  })

  return {
    slot,
    setSlot,
    name,
    langs,
    setLang,
    renameLang,
    content,
    trigger,
    insert,
    remove,
    setType,
    init,
    clear,
    load,
    copy,
    save,
  }
})