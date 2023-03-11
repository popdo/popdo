import type { APIRoute } from 'astro'
import { fetch, ProxyAgent } from 'undici'

const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/,'')

const post:APIRoute = async (context:any) => {
  const options = await context.request.json()
  const {headers,body} = options


  const initOptions = {
    headers,
    method: 'POST',
    body: JSON.stringify(body),
  }
  
  if (httpsProxy) {
    initOptions['dispatcher'] = new ProxyAgent(httpsProxy)
  }
  
  const response = await fetch(`${baseUrl}/v1/chat/completions`, initOptions) as Response
  
  return response
}
