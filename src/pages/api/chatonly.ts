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
  

  // 将 Response 对象转换为 Readable 流
  const stream = new Readable({
    read() {
      // 读取 Response 对象中的数据并写入流中
      response.body.on('data', (chunk) => {
        this.push(chunk)
      })

      // 当 Response 对象中的数据全部写入流中后，结束流
      response.body.on('end', () => {
        this.push(null)
      })
    }
  })

  // 返回流
  return stream

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
