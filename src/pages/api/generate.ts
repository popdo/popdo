import type { APIRoute } from 'astro'

// #vercel-disable-blocks
import { fetch, ProxyAgent } from 'undici'
// #vercel-end

const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/,'')

export const post: APIRoute = async (context) => {
  const options = await context.request.json()
  const {headers,body} = options


  const initOptions = {
    headers,
    method: 'POST',
    body: JSON.stringify(body),
  }
  // #vercel-disable-blocks
  if (httpsProxy) {
    initOptions['dispatcher'] = new ProxyAgent(httpsProxy)
  }
  // #vercel-end

  // @ts-ignore
  return await fetch(`${baseUrl}/v1/chat/completions`, initOptions) as Response

}
