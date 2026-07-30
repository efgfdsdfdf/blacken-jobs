import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function classifyEmail(subject: string, body: string) {
  const prompt = `Classify this email related to a job application.
Subject: ${subject}
Body: ${body}

Return a JSON object with:
- category: string ('INTERVIEW', 'REJECTION', 'OFFER', 'UPDATE', 'OTHER')
- summary: string (brief summary)
- actionRequired: boolean
- deadline: string (ISO date if found, or null)
- priority: string ('HIGH', 'MEDIUM', 'LOW')
Only return the raw JSON object.`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^```(json)?/, '').replace(/```$/, '').trim()
    return JSON.parse(rawJson)
  } catch (e) {
    console.error('AI email classification failed', e)
    throw e
  }
}
