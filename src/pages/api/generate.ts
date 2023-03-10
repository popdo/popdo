import type { IApiOptions } from '@/types/IApi'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

export const generateMsg = async (options:IApiOptions) => {
  const response = await fetchApi(options)

  return new Response(parseOpenAIStream(response))
}

/**
 * 封装解析器
 * @param rawRespone openai返回的response
 * @returns 
 */
const parseOpenAIStream = (rawRespone:Response) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  // 将ReadableStream对象转换为异步可迭代对象
  async function* asyncGenerator() {
    const reader = rawRespone.body?.getReader()
    if (!reader) throw new Error('Failed to get reader')
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        yield value
      }
    } finally {
      reader.releaseLock()
    }
  }


  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            console.log('controller-colose')
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices && json.choices[0].delta?.content || ''
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(streamParser)

      for await (const chunk of asyncGenerator() as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return stream
  
}




/**
 * 请求API
 * @param options 
 * @returns 
 */
const fetchApi = async (options: IApiOptions) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', options)
  if (!response.ok) await handleFetchError(response)
  return response
}

/**
 * 处理请求错误
 * @param response 
 */
const handleFetchError = async (response: Response) => {
  const errorJson = await response.json()
  let eMsg = errorJson.error?.message || errorJson.message || 'Unknown error'
  if(response?.status === 400 && eMsg.startsWith("This model's maximum context length")){
    eMsg = '可能当前话题聊太久了，请删除部分聊天内容再继续，或者发起新的话题！'
  }
  if(response?.status === 429 && eMsg.startsWith("Rate limit reached for")){
    eMsg = '消息发送太快了，休息一下再发吧！'
  }
  throw new Error(`请求API错误-[${response.status}]: ${eMsg}`)
}
