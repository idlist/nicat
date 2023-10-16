import { ref, toRaw, toValue } from 'vue'
import { defineStore } from 'pinia'
import { useEditorStore } from './editor'

export interface RawLangData {
  id: number
  dict: Record<string, string>
  order: number[]
}

export const useLangStore = defineStore('lang', () => {
  const id = ref<number>(1)
  const dict = ref<Record<string, string>>({})
  const order = ref<number[]>([])

  const editor = useEditorStore()

  const _id = (id: number | string) => {
    return typeof id == 'number' ? id : parseInt(id)
  }

  const add = () => {
    dict.value[id.value] = `Language ${id.value}`
    order.value.push(id.value)
    id.value++

    for (const block of editor.content) {
      block.content[id.value] = ''
    }

    editor.save()
  }

  const remove = (id: number | string) => {
    id = _id(id)
    delete dict.value[id]
    order.value = order.value.filter((o) => o != id)

    for (const block of editor.content) {
      delete block.content[id]
    }

    editor.save()
  }

  const move = (which: number | string, direction: -1 | 1) => {
    which = _id(which)
    const current = order.value.indexOf(which)

    if (current == 0 && direction == -1) {
      return
    }
    if (current == order.value.length - 1 && direction == 1) {
      return
    }

    const next = current + direction
    order.value.splice(current, 1)
    order.value.splice(next, 0, which)

    editor.save()
  }

  const rename = (id: number | string, name: string) => {
    dict.value[id] = name

    editor.save()
  }

  const reset = () => {
    id.value = 1
    dict.value = {}
    order.value = []
  }

  const init = () => {
    id.value = 3
    dict.value = { 1: 'English', 2: 'Chinese' }
    order.value = [1, 2]
  }

  const raw = (): RawLangData => {
    return {
      id: toValue(id),
      dict: toRaw(toValue(dict)),
      order: toRaw(toValue(order)),
    }
  }

  const restore = (data: RawLangData) => {
    id.value = data.id
    dict.value = data.dict
    order.value = data.order
  }

  return {
    id,
    dict,
    order,
    add,
    remove,
    move,
    rename,
    reset,
    init,
    raw,
    restore,
  }
})