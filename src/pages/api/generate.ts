import type { APIRoute } from 'astro'
import { parseOpenAIStream } from '@/utils/openAI'

// #vercel-disable-blocks
import { fetch, ProxyAgent } from 'undici'
// #vercel-end

const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/,'')

export const post: APIRoute = async (context) => {
  const options = await context.request.json()

  // #vercel-disable-blocks
  if (httpsProxy) {
    options['dispatcher'] = new ProxyAgent(httpsProxy)
  }
  // #vercel-end

  // @ts-ignore
  const response = await fetch(`${baseUrl}/v1/chat/completions`, options) as Response

  return new Response(parseOpenAIStream(response))
}
