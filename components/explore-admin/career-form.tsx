'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/explore/slug'
import { CAREER_CATEGORIES } from '@/lib/explore/constants'
import { TextInput, TextArea, ListField, SelectField, ChipMultiSelect } from './fields'

export interface CareerFormValue {
  id?: string
  slug: string
  name: string
  category: string
  short_description: string
  description: string
  career_progression: string
  what_you_do: string[]
  work_environments: string[]
  industries: string[]
  common_job_titles: string[]
  skills: string[]
  misconceptions: string[]
  related_careers: string[]
  courses: string[]
  published: boolean
}

export default function CareerForm({
  initial,
  courses,
}: {
  initial?: Partial<CareerFormValue>
  courses: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CareerFormValue>({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    short_description: initial?.short_description ?? '',
    description: initial?.description ?? '',
    career_progression: initial?.career_progression ?? '',
    what_you_do: initial?.what_you_do ?? [],
    work_environments: initial?.work_environments ?? [],
    industries: initial?.industries ?? [],
    common_job_titles: initial?.common_job_titles ?? [],
    skills: initial?.skills ?? [],
    misconceptions: initial?.misconceptions ?? [],
    related_careers: initial?.related_careers ?? [],
    courses: initial?.courses ?? [],
    published: initial?.published ?? false,
  })

  const set = <K extends keyof CareerFormValue>(key: K, value: CareerFormValue[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const onNameChange = (name: string) => {
    set('name', name)
    if (!form.slug) set('slug', slugify(name))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const body = { ...form, slug: form.slug.trim() || slugify(form.name) }
    try {
      const res = await fetch(`/api/admin/explore/careers`, {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save career')
      router.push('/admin/explore/careers')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save career')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          name="name"
          label="Name"
          value={form.name}
          onChange={onNameChange}
          required
        />
        <TextInput
          name="slug"
          label="Slug"
          value={form.slug}
          onChange={(slug) => set('slug', slug)}
          hint="Auto-generated from name if left blank"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="category"
          label="Category"
          value={form.category}
          onChange={(category) => set('category', category)}
          options={[...CAREER_CATEGORIES]}
          required
          placeholder="Select a category"
        />
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => set('published', event.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Published (visible to everyone)
          </label>
        </div>
      </div>

      <TextArea
        name="short_description"
        label="Short description"
        value={form.short_description}
        onChange={(value) => set('short_description', value)}
        rows={2}
        hint="One or two sentences shown on cards and in search results"
      />
      <TextArea
        name="description"
        label="Full description"
        value={form.description}
        onChange={(value) => set('description', value)}
        rows={5}
      />
      <TextArea
        name="career_progression"
        label="Career progression"
        value={form.career_progression}
        onChange={(value) => set('career_progression', value)}
        rows={4}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <ListField name="what_you_do" label="What you would do" value={form.what_you_do} onChange={(v) => set('what_you_do', v)} />
        <ListField name="work_environments" label="Where you would work" value={form.work_environments} onChange={(v) => set('work_environments', v)} />
        <ListField name="industries" label="Industries" value={form.industries} onChange={(v) => set('industries', v)} />
        <ListField name="common_job_titles" label="Common job titles" value={form.common_job_titles} onChange={(v) => set('common_job_titles', v)} />
        <ListField name="skills" label="Skills that help" value={form.skills} onChange={(v) => set('skills', v)} />
        <ListField name="misconceptions" label="Common misconceptions" value={form.misconceptions} onChange={(v) => set('misconceptions', v)} />
      </div>

      <ListField
        name="related_careers"
        label="Related careers (slugs)"
        value={form.related_careers}
        onChange={(v) => set('related_careers', v)}
        hint="One slug per line, e.g. medical-doctor"
      />

      <ChipMultiSelect
        name="courses"
        label="Courses that lead to this career"
        options={courses}
        selected={form.courses}
        onToggle={(id) =>
          set(
            'courses',
            form.courses.includes(id) ? form.courses.filter((c) => c !== id) : [...form.courses, id],
          )
        }
      />

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
      >
        {loading ? 'Saving…' : form.id ? 'Save changes' : 'Create career'}
      </button>
    </form>
  )
}