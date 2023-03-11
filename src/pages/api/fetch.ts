import type { APIRoute } from 'astro'
import { fetch, ProxyAgent } from 'undici'

const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/,'')

export const post:APIRoute = async (context:any) => {
  const options = await context.request.json()
//   const {headers,body} = options


//   const initOptions = {
//     headers,
//     method: 'POST',
//     body: JSON.stringify(body),
//   }
  
  if (httpsProxy) {
    options['dispatcher'] = new ProxyAgent(httpsProxy)
  }
  
  const response = await fetch(`${baseUrl}/v1/chat/completions`, options) as Response
  
  
  const stream = response.body
  if (!stream) {
    throw new Error('No stream')
  }
  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8')
  const data:any = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      const text = decoder.decode(value)
      data.push(text)
    }
    return data
  } catch (error) {
    console.error(error)
  } finally {
    reader.releaseLock()
  }
  
//   return response
}
