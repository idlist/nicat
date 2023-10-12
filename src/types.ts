type Lang = string

interface BaseBlock {
  type: string
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  style?: string
  content: Record<Lang, string>
}

export interface CommentBlock extends BaseBlock {
  type: 'comment'
  content: Record<Lang, string>
}

export type Block =
  | TextBlock
  | CommentBlock

export interface RawLangData {
  id: number
  dict: Record<string, string>
  order: number[]
}