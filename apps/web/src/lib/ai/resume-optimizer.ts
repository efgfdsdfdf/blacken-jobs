import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export async function optimizeResume(resumeText: string, jobDescription: string) {
  const prompt = `Optimize this resume for this job description to maximize ATS score.
Resume: ${resumeText}
Job: ${jobDescription}

Return a JSON object with:
- optimizedResume: string (the full optimized text)
- keywords: string[] (keywords added)
- improvements: string[] (list of changes made)
Only return the raw JSON object.`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^```(json)?/, '').replace(/```$/, '').trim()
    return JSON.parse(rawJson)
  } catch (e) {
    console.error('AI resume optimization failed', e)
    throw e
  }
}

export async function generateCoverLetter(resumeText: string, jobDescription: string, companyName: string) {
  const prompt = `Write a compelling cover letter for ${companyName} based on this resume and job description.
Resume: ${resumeText}
Job: ${jobDescription}

Return a JSON object with:
- coverLetter: string (the letter content)
Only return the raw JSON object.`

  try {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      prompt,
    })
    const rawJson = text.replace(/^```(json)?/, '').replace(/```$/, '').trim()
    return JSON.parse(rawJson).coverLetter || text
  } catch (e) {
    console.error('AI cover letter generation failed', e)
    throw e
  }
}
