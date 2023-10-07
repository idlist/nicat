type Lang = string

interface BaseBlock {
  type: string
  content: Record<Lang, string>
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  style?: string
}

export interface CommentBlock extends BaseBlock {
  type: 'comment'
}

export type Block =
  | TextBlock
  | CommentBlock
