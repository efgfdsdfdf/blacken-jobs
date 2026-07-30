import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function generateInterviewPrep(job: any, careerProfile: any) {
  const prompt = `Create a full interview prep report for this candidate and job.
Job: ${JSON.stringify(job)}
Profile: ${JSON.stringify(careerProfile)}

Return a JSON object with:
- prepReport: string (summary strategy)
- mockQuestions: string[] (5 likely questions)
- suggestedAnswers: string[] (answers for those questions)
- companyResearch: string (key facts about company, assuming generic if not specified)
- technicalTopics: string[] (topics to brush up on)
Only return the raw JSON object.`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^```(json)?/, '').replace(/```$/, '').trim()
    return JSON.parse(rawJson)
  } catch (e) {
    console.error('AI interview prep generation failed', e)
    throw e
  }
}
