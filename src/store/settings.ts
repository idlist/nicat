import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useEditorStore } from './editor'
import useWindowSize from '@/use/windowSize'

export type RenderWidthType = 'default' | 'sheet-width' | 'custom'

export interface SheetSettings {
  sheetWidthUseDefault: boolean
  sheetWidthCustom: number | string
  renderWidthType: RenderWidthType
  renderWidthCustom: number | string
  scaleFactor: number
  renderIndex: boolean
}

export const useSettingsStore = defineStore('settings', () => {
  const editor = useEditorStore()
  const { width } = useWindowSize()

  const sheetWidthDefault = 1024
  const sheetWidthMin = 800
  const sheetWidthUseDefault = ref<boolean>(true)
  const sheetWidthCustom = ref<number | string>(sheetWidthDefault)
  const sheetWidth = ref<number>(sheetWidthDefault)

  const setCustomSheetWidth = () => {
    if (sheetWidthUseDefault.value || typeof sheetWidthCustom.value == 'string') {
      return
    } else if (sheetWidthCustom.value < sheetWidthMin) {
      sheetWidth.value = sheetWidthMin
    } else if (sheetWidthCustom.value > width.value) {
      sheetWidth.value = width.value
    } else {
      sheetWidth.value = sheetWidthCustom.value
    }
  }

  watch(sheetWidthUseDefault, (next) => {
    if (next == true) {
      sheetWidth.value = sheetWidthDefault
    } else {
      setCustomSheetWidth()
    }

    editor.save()
  })

  const renderWidthDefault = 1024
  const renderWidthMin = sheetWidthMin
  const renderWidthCustom = ref<number | string>(renderWidthDefault)
  const renderWidthType = ref<RenderWidthType>('default')

  const renderWidth = computed<number>(() => {
    if (renderWidthType.value == 'default') {
      return renderWidthDefault
    } else if (renderWidthType.value == 'sheet-width') {
      return sheetWidth.value
    } else {
      if (typeof renderWidthCustom.value == 'string') {
        return renderWidthDefault
      } else if (renderWidthCustom.value < renderWidthMin) {
        return renderWidthMin
      } else {
        return renderWidthCustom.value
      }
    }
  })

  watch(renderWidthType, () => {
    editor.save()
  })

  watch(renderWidthCustom, () => {
    editor.save()
  })

  const renderHeight = ref<number>(0)

  const scaleFactorInput = ref<number | string>(1)

  const scaleFactor = computed<number>(() => {
    if (typeof scaleFactorInput.value == 'string') {
      return 1
    } else if (scaleFactorInput.value <= 0) {
      return 1
    } else {
      return scaleFactorInput.value
    }
  })

  watch(scaleFactorInput, () => {
    editor.save()
  })

  const renderIndex = ref<boolean>(true)

  watch(renderIndex, () => {
    editor.save()
  })

  const raw = (): SheetSettings => {
    return {
      sheetWidthUseDefault: sheetWidthUseDefault.value,
      sheetWidthCustom: sheetWidthCustom.value,
      renderWidthType: renderWidthType.value,
      renderWidthCustom: renderWidthCustom.value,
      scaleFactor: scaleFactor.value,
      renderIndex: renderIndex.value,
    }
  }

  const restore = (data?: SheetSettings) => {
    sheetWidthUseDefault.value = data?.sheetWidthUseDefault ?? true
    sheetWidthCustom.value = data?.sheetWidthCustom ?? sheetWidthDefault
    renderWidthType.value = data?.renderWidthType ?? 'default'
    renderWidthCustom.value = data?.renderWidthCustom ?? renderWidthDefault
    scaleFactorInput.value = data?.scaleFactor ?? 1
    renderIndex.value = data?.renderIndex ?? true
  }

  return {
    width,
    sheetWidthUseDefault,
    sheetWidthCustom,
    sheetWidth,
    setCustomSheetWidth,
    renderWidthType,
    renderWidthCustom,
    renderWidth,
    renderHeight,
    scaleFactorInput,
    scaleFactor,
    renderIndex,
    restore,
    raw,
  }
})