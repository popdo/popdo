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
  
  // 将response对象转化为可读流
  const body = Readable.from(await response.arrayBuffer())


  return body

//   return response
  
//   return response
  
  
// 一：
//   const body = await response.text() // 将Response对象转换为字符串

//   return new Response(body, response) // 返回一个新的Response对象

// 二：
  // 直接返回响应
//   return new Response(response.body, {
//     status: response.status,
//     statusText: response.statusText,
//     headers: response.headers
//   })


//   return response
}
