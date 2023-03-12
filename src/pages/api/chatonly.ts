import type { APIRoute } from 'astro'
import { fetch, ProxyAgent } from 'undici'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/,'')

export const post:APIRoute = async (context:any) => {
  const options = await context.request.json()

  if (httpsProxy) {
    options['dispatcher'] = new ProxyAgent(httpsProxy)
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, options) as Response
  
  // 将响应体转换为ReadableStream对象
  const body = response.body

  // 设置响应头
  const headers = {
    'Content-Type': 'application/json',
    'Transfer-Encoding': 'chunked'
  }

  // 返回响应对象，包括流式输出
  return new Response(body, { headers })


//   return response
}
