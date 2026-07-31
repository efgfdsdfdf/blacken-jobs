"use client"

import * as React from "react"
import { 
  Brain, 
  Loader2, 
  ChevronRight, 
  CheckCircle, 
  Award, 
  TrendingUp,
  XCircle,
  HelpCircle,
  FileText,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Link from "next/link"

interface Question {
  question: string
  userAnswer: string
}

export function MockInterviewSession({ 
  interviewId, 
  company, 
  title,
  initialTab = "practice",
  companyResearch = "",
  technicalTopics = "",
  suggestedQuestions = ""
}: { 
  interviewId: string; 
  company: string; 
  title: string;
  initialTab?: string;
  companyResearch?: string;
  technicalTopics?: string;
  suggestedQuestions?: string;
}) {
  const [activeTab, setActiveTab] = React.useState(initialTab)
  const [loading, setLoading] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [evaluating, setEvaluating] = React.useState(false)
  const [questions, setQuestions] = React.useState<string[]>([])
  const [currentStep, setCurrentStep] = React.useState(0) // -1: Intro, 0-N: Questions, N+1: Result
  const [answers, setAnswers] = React.useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = React.useState("")
  const [result, setResult] = React.useState<any>(null)

  const fetchPrep = React.useCallback(async () => {
    try {
      setErrorMsg(null)
      const res = await fetch(`/api/interviews/${interviewId}/prep`)
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || "Failed to load prep questions")
      }
      const data = await res.json()
      if (!data.mockQuestions || data.mockQuestions.length === 0) {
        throw new Error("No mock questions found in database. Try retrying to generate them.")
      }
      setQuestions(data.mockQuestions || [])
      setAnswers(new Array(data.mockQuestions?.length || 0).fill(""))
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load questions")
      toast.error("Failed to load mock interview questions")
    } finally {
      setLoading(false)
    }
  }, [interviewId])

  React.useEffect(() => {
    fetchPrep()
  }, [fetchPrep])

  const handleNext = () => {
    const updated = [...answers]
    updated[currentStep] = currentAnswer
    setAnswers(updated)

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
      setCurrentAnswer(answers[currentStep + 1] || "")
    } else {
      // Submit all answers
      submitAnswers(updated)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const updated = [...answers]
      updated[currentStep] = currentAnswer
      setAnswers(updated)
      
      setCurrentStep(currentStep - 1)
      setCurrentAnswer(answers[currentStep - 1])
    }
  }

  const submitAnswers = async (finalAnswers: string[]) => {
    setEvaluating(true)
    try {
      const payload = questions.map((q, idx) => ({
        question: q,
        answer: finalAnswers[idx] || "No response provided."
      }))

      const res = await fetch(`/api/interviews/${interviewId}/prep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload })
      })

      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult(data)
      setCurrentStep(questions.length) // Go to result view
      toast.success("AI Evaluation complete!")
    } catch {
      toast.error("Failed to evaluate answers")
    } finally {
      setEvaluating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-zinc-400">Generating customized mock questions with AI...</p>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center p-4">
        <div className="rounded-full bg-red-500/10 p-3 text-red-500 border border-red-500/20">
          <XCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white mt-2">Mock Questions Generation Failed</h3>
        <p className="text-sm text-zinc-400 max-w-md">{errorMsg}</p>
        <Button onClick={() => { setLoading(true); fetchPrep(); }} className="mt-2 bg-primary text-white hover:bg-primary/80">
          Retry Question Generation
        </Button>
      </div>
    )
  }

  if (evaluating) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
        <p className="text-sm text-zinc-400">AI is evaluating your answers. This will take a few seconds...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-4 md:p-0">
      {/* Back to Interviews link */}
      <Link href="/interviews" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
        ← Back to Interviews
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{company}</h1>
          <p className="text-xs text-zinc-500">{title} Preparation Portal</p>
        </div>
      </div>

      {/* Tab Navigation buttons */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        <button 
          onClick={() => setActiveTab("practice")} 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "practice" ? "bg-primary text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          <Brain className="w-3.5 h-3.5" /> AI Practice Quiz
        </button>
        <button 
          onClick={() => setActiveTab("research")} 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "research" ? "bg-primary text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          <Search className="w-3.5 h-3.5" /> Company Insights
        </button>
        <button 
          onClick={() => setActiveTab("technical")} 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "technical" ? "bg-primary text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Technical Guide
        </button>
        <button 
          onClick={() => setActiveTab("questions")} 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "questions" ? "bg-primary text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Questions to Ask
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "practice" && (
        <div className="animate-fade-in space-y-6">
          {currentStep >= questions.length && result ? (
            // Results view
            <div className="space-y-8">
              <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-purple-500/20 text-2xl font-black text-purple-400">
                  {result.overallScore}%
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-400" />
                    Interview Practice Complete!
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2">{result.generalFeedback}</p>
                </div>
              </div>

              {/* Detailed Evaluations */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-zinc-300">Detailed Feedback</h3>
                {result.evaluations?.map((ev: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-semibold text-zinc-200 flex items-start gap-2">
                        <HelpCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                        Q{idx + 1}: {ev.question}
                      </p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                        ev.score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                        ev.score >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                        "text-red-400 bg-red-500/10 border-red-500/20"
                      }`}>
                        Score: {ev.score}%
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Your Answer:</p>
                      <p className="text-sm text-zinc-400 mt-1 italic">"{answers[idx] || "No response provided."}"</p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">AI Feedback:</p>
                      <p className="text-sm text-zinc-300 mt-1">{ev.feedback}</p>
                    </div>

                    {ev.modelAnswer && (
                      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-4">
                        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Ideal Answer
                        </p>
                        <p className="text-xs text-zinc-400 leading-relaxed">{ev.modelAnswer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button asChild className="bg-primary hover:bg-primary/80">
                  <Link href="/interviews">Back to Interviews</Link>
                </Button>
                <Button variant="outline" className="border-white/5" onClick={() => {
                  setCurrentStep(0)
                  setAnswers(new Array(questions.length).fill(""))
                  setCurrentAnswer("")
                  setResult(null)
                }}>
                  Practice Again
                </Button>
              </div>
            </div>
          ) : (
            // Questionnaire Form wizard
            <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-base font-bold text-zinc-200">{company}</h2>
                  <p className="text-xs text-zinc-500">{title} Practice Quiz</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Question {currentStep + 1} of {questions.length}
                </span>
              </div>

              <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                />
              </div>

              <div className="py-4 space-y-3">
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-primary" />
                  Interview Question
                </p>
                <p className="text-base font-bold text-zinc-200 leading-snug">{questions[currentStep]}</p>
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">Your Answer (type your response as you would say it):</label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your response here..."
                  rows={8}
                  className="w-full rounded-lg bg-zinc-800/40 border border-white/5 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  disabled={currentStep === 0}
                  className="text-zinc-400 disabled:opacity-30 text-xs"
                >
                  Previous
                </Button>
                <Button 
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/80 text-xs"
                >
                  {currentStep === questions.length - 1 ? "Submit Interview" : "Next Question"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "research" && (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" /> Company Research & Insights
          </h3>
          <Separator className="bg-white/5" />
          <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto pr-2">
            {companyResearch || "No company research report generated yet."}
          </div>
        </div>
      )}

      {activeTab === "technical" && (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Recommended Technical Guides
          </h3>
          <Separator className="bg-white/5" />
          <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto pr-2">
            {technicalTopics || "No technical guides found."}
          </div>
        </div>
      )}

      {activeTab === "questions" && (
        <div className="rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md p-6 space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" /> Questions to Ask the Interviewer
          </h3>
          <Separator className="bg-white/5" />
          <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto pr-2">
            {suggestedQuestions || "No custom questions generated."}
          </div>
        </div>
      )}
    </div>
  )
}
