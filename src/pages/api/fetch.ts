import type { APIRoute } from 'astro'
import { fetch, ProxyAgent } from 'undici'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

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
  
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  
  if (httpsProxy) {
    options['dispatcher'] = new ProxyAgent(httpsProxy)
  }
  
  const response = await fetch(`${baseUrl}/v1/chat/completions`, options) as Response
  
  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(streamParser)
      for await (const chunk of response.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return new Response(stream)
  
//   return response
}
