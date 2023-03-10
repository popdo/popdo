import { fetch } from 'undici'
const post = async (options:any) => {
  return await fetch('https://api.openai.com/v1/chat/completions', options)
}
