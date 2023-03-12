import { fetch, ProxyAgent } from 'undici'

export const fetchApi = async (options) => {
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', options)

  if (!response.ok) await handleFetchError(response)

  return response

}


const handleFetchError = async (response) => {

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
