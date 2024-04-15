export interface ApiResponse {
  success: boolean
  message: string
  isAcceptingMessages?: boolean
  messages?: string[]
  status?: number
}
