"use client"

import React, { useState } from "react"
import { toast } from "sonner"
import { 
  User, Briefcase, GraduationCap, Award, Languages, MapPin, Settings, Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { TagInput } from "./tag-input"
import { DynamicList } from "./dynamic-list"

// Helper for standard text inputs to keep styling DRY
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`flex h-11 w-full rounded-md border border-white/10 bg-zinc-950/50 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner ${props.className || ''}`}
  />
)

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`flex min-h-[100px] w-full rounded-md border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner resize-y ${props.className || ''}`}
  />
)

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`flex h-11 w-full rounded-md border border-white/10 bg-zinc-950/50 px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner appearance-none ${props.className || ''}`}
  >
    {props.children}
  </select>
)

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={`text-sm font-medium text-zinc-300 mb-1.5 block ${className || ''}`}>
    {children}
  </label>
)

export function CareerProfilePage({ initialData }: { initialData: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [data, setData] = useState({
    personalInfo: initialData.personalInfo || { title: "", yearsOfExperience: "", bio: "" },
    skills: initialData.skills || [],
    education: initialData.education || [],
    certifications: initialData.certifications || [],
    languages: initialData.languages || [],
    preferences: initialData.preferences || {
      titles: [], countries: [], cities: [], industries: [],
      salaryMin: "", salaryMax: "", currency: "USD",
      workAuthorization: "", locationPreference: "hybrid", relocation: false
    },
    automationSettings: initialData.automationSettings || {
      maxDailyApplications: 50, autoApply: false, approvalRequired: true, searchInterval: 30
    }
  })

  const updateSection = (section: string, value: any) => {
    setData(prev => ({ ...prev, [section]: value }))
  }

  const updateNested = (section: keyof typeof data, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/career-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      
      if (!res.ok) throw new Error("Failed to save profile")
      
      toast.success("Profile saved successfully", {
        description: "Your career profile has been updated."
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to save profile", {
        description: "Please try again later."
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Personal Info */}
      <Card className="bg-zinc-900/60 border-white/5 backdrop-blur-md shadow-xl overflow-hidden glass-card animate-slide-in-up" style={{ animationDelay: '150ms' }}>
        <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <User className="w-5 h-5 text-blue-400" />
            Personal Info
          </CardTitle>
          <CardDescription className="text-zinc-400">Your current role and professional summary.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Job Title</Label>
              <Input 
                value={data.personalInfo.title} 
                onChange={e => updateNested("personalInfo", "title", e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div>
              <Label>Years of Experience</Label>
              <Input 
                type="number"
                value={data.personalInfo.yearsOfExperience} 
                onChange={e => updateNested("personalInfo", "yearsOfExperience", e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
          </div>
          <div>
            <Label>Professional Bio</Label>
            <Textarea 
              value={data.personalInfo.bio} 
              onChange={e => updateNested("personalInfo", "bio", e.target.value)}
              placeholder="A brief summary of your background, achievements, and career goals..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="bg-zinc-900/60 border-white/5 backdrop-blur-md shadow-xl overflow-hidden glass-card animate-slide-in-up" style={{ animationDelay: '200ms' }}>
        <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Award className="w-5 h-5 text-blue-400" />
            Skills & Technologies
          </CardTitle>
          <CardDescription className="text-zinc-400">Add the skills you want to highlight for potential jobs.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Label>Core Skills</Label>
          <TagInput 
            value={data.skills} 
            onChange={val => updateSection("skills", val)} 
            placeholder="Type a skill and press Enter..."
          />
        </CardContent>
      </Card>

      {/* Experience & Job Preferences */}
      <Card className="bg-zinc-900/60 border-white/5 backdrop-blur-md shadow-xl overflow-hidden glass-card animate-slide-in-up" style={{ animationDelay: '250ms' }}>
        <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Briefcase className="w-5 h-5 text-blue-400" />
            Job Preferences
          </CardTitle>
          <CardDescription className="text-zinc-400">Tell BLACK AI what kind of roles you are looking for.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Preferred Titles</Label>
              <TagInput 
                value={data.preferences.titles} 
                onChange={val => updateNested("preferences", "titles", val)} 
                placeholder="e.g. Frontend Engineer..."
              />
            </div>
            <div>
              <Label>Industries</Label>
              <TagInput 
                value={data.preferences.industries} 
                onChange={val => updateNested("preferences", "industries", val)} 
                placeholder="e.g. SaaS, FinTech..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Min Salary</Label>
              <Input 
                type="number"
                value={data.preferences.salaryMin} 
                onChange={e => updateNested("preferences", "salaryMin", e.target.value)}
                placeholder="e.g. 100000"
              />
            </div>
            <div>
              <Label>Max Salary</Label>
              <Input 
                type="number"
                value={data.preferences.salaryMax} 
                onChange={e => updateNested("preferences", "salaryMax", e.target.value)}
                placeholder="e.g. 150000"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select 
                value={data.preferences.currency} 
                onChange={e => updateNested("preferences", "currency", e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-6">
            <div>
              <Label>Location Preference</Label>
              <Select 
                value={data.preferences.locationPreference} 
                onChange={e => updateNested("preferences", "locationPreference", e.target.value)}
              >
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
                <option value="any">Any</option>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input 
                type="checkbox" 
                id="relocation"
                checked={data.preferences.relocation}
                onChange={e => updateNested("preferences", "relocation", e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-zinc-950 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-zinc-900"
              />
              <label htmlFor="relocation" className="text-sm font-medium text-zinc-300 cursor-pointer">
                Open to relocation
              </label>
            </div>
            <div>
              <Label>Work Authorization</Label>
              <Select 
                value={data.preferences.workAuthorization} 
                onChange={e => updateNested("preferences", "workAuthorization", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="us_citizen">US Citizen</option>
                <option value="green_card">Green Card</option>
                <option value="h1b">H1-B Visa</option>
                <option value="require_sponsorship">Require Sponsorship</option>
                <option value="other">Other / Not Applicable</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Preferred Countries</Label>
              <TagInput 
                value={data.preferences.countries} 
                onChange={val => updateNested("preferences", "countries", val)} 
                placeholder="e.g. US, UK, Canada..."
              />
            </div>
            <div>
              <Label>Preferred Cities</Label>
              <TagInput 
                value={data.preferences.cities} 
                onChange={val => updateNested("preferences", "cities", val)} 
                placeholder="e.g. New York, London..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="bg-zinc-900/60 border-white/5 backdrop-blur-md shadow-xl overflow-hidden glass-card animate-slide-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            Education
          </CardTitle>
          <CardDescription className="text-zinc-400">Your academic background and degrees.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <DynamicList
            items={data.education}
            onChange={items => updateSection("education", items)}
            addLabel="Add Education"
            emptyItem={{ degree: "", institution: "", year: "", field: "" }}
            renderItem={(item, index, update) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Degree</Label>
                  <Input 
                    value={item.degree} 
                    onChange={e => update({ ...item, degree: e.target.value })} 
                    placeholder="e.g. BS Computer Science" 
                  />
                </div>
                <div>
                  <Label>Institution</Label>
                  <Input 
                    value={item.institution} 
                    onChange={e => update({ ...item, institution: e.target.value })} 
                    placeholder="e.g. MIT" 
                  />
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Input 
                    value={item.field} 
                    onChange={e => update({ ...item, field: e.target.value })} 
                    placeholder="e.g. Software Engineering" 
                  />
                </div>
                <div>
                  <Label>Graduation Year</Label>
                  <Input 
                    value={item.year} 
                    onChange={e => update({ ...item, year: e.target.value })} 
                    placeholder="e.g. 2020" 
                  />
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card className="bg-zinc-900/60 border-white/5 backdrop-blur-md shadow-xl overflow-hidden glass-card animate-slide-in-up" style={{ animationDelay: '350ms' }}>
        <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Settings className="w-5 h-5 text-blue-400" />
            Automation Settings
          </CardTitle>
          <CardDescription className="text-zinc-400">Configure how BLACK AI automates your job hunt.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <Label>Max Daily Applications</Label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="200" 
                    value={data.automationSettings.maxDailyApplications}
                    onChange={e => updateNested("automationSettings", "maxDailyApplications", parseInt(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="w-12 text-center text-zinc-300 font-medium bg-zinc-800/50 py-1 rounded-md border border-white/5">
                    {data.automationSettings.maxDailyApplications}
                  </span>
                </div>
              </div>
              
              <div>
                <Label>Search Interval (minutes)</Label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="15" 
                    max="120" 
                    step="15"
                    value={data.automationSettings.searchInterval}
                    onChange={e => updateNested("automationSettings", "searchInterval", parseInt(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="w-12 text-center text-zinc-300 font-medium bg-zinc-800/50 py-1 rounded-md border border-white/5">
                    {data.automationSettings.searchInterval}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-zinc-950/30 p-5 rounded-xl border border-white/5">
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox" 
                  id="autoApply"
                  checked={data.automationSettings.autoApply}
                  onChange={e => updateNested("automationSettings", "autoApply", e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/10 bg-zinc-950 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-zinc-900"
                />
                <div>
                  <label htmlFor="autoApply" className="text-base font-medium text-zinc-100 cursor-pointer">
                    Enable Auto-Apply
                  </label>
                  <p className="text-sm text-zinc-500 mt-1">Allow the AI to automatically submit applications on your behalf using your profile data.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox" 
                  id="approvalRequired"
                  checked={data.automationSettings.approvalRequired}
                  onChange={e => updateNested("automationSettings", "approvalRequired", e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-white/10 bg-zinc-950 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-zinc-900"
                />
                <div>
                  <label htmlFor="approvalRequired" className="text-base font-medium text-zinc-100 cursor-pointer">
                    Require Manual Approval
                  </label>
                  <p className="text-sm text-zinc-500 mt-1">Review each application draft before it is submitted to the employer.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-50 animate-slide-in-up" style={{ animationDelay: '500ms' }}>
        <Button 
          size="lg" 
          onClick={handleSave} 
          disabled={isSaving}
          className="rounded-full shadow-2xl bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/20 gap-2 px-8 h-14 text-base font-medium transition-all hover:scale-105 active:scale-95"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving Profile..." : "Save Profile"}
        </Button>
      </div>
    </div>
  )
}
