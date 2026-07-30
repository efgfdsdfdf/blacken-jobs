import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function analyzeJobMatch(job: any, careerProfile: any) {
  const prompt = `Analyze the compatibility between this job and the candidate's career profile.
Job: ${JSON.stringify(job)}
Profile: ${JSON.stringify(careerProfile)}

Return a JSON object with:
- score: number (0-100)
- skillMatches: string[]
- skillGaps: string[]
- experienceMatch: string (brief explanation)
- salaryMatch: string (brief explanation)
- explanation: string (overall summary)
Only return the raw JSON object.`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^```(json)?/, '').replace(/```$/, '').trim()
    return JSON.parse(rawJson)
  } catch (e) {
    console.error('AI match analysis failed', e)
    throw e
  }
}
