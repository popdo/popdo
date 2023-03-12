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

  // 创建响应对象，包括流式输出
  const res = new Response(body, { headers })

  // 将响应体流式输出给前端
  await body.pipeTo(context.response.body)

  return res

//   return new Response(body, {
//     headers: response.headers,
//     status: response.status,
//     statusText: response.statusText,
//   });

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
