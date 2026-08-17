'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/explore/slug'
import { UNIVERSITY_TYPES } from '@/lib/explore/constants'
import { TextInput, TextArea, SelectField, ChipMultiSelect } from './fields'

export interface UniversityFormValue {
  id?: string
  slug: string
  name: string
  location: string
  type: string
  description: string
  website: string
  courses: string[]
  published: boolean
}

export default function UniversityForm({
  initial,
  courses,
}: {
  initial?: Partial<UniversityFormValue>
  courses: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<UniversityFormValue>({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    location: initial?.location ?? '',
    type: initial?.type ?? '',
    description: initial?.description ?? '',
    website: initial?.website ?? '',
    courses: initial?.courses ?? [],
    published: initial?.published ?? false,
  })

  const set = <K extends keyof UniversityFormValue>(key: K, value: UniversityFormValue[K]) =>
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
      const res = await fetch(`/api/admin/explore/universities`, {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save university')
      router.push('/admin/explore/universities')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save university')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput name="name" label="Name" value={form.name} onChange={onNameChange} required />
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
          name="type"
          label="Type"
          value={form.type}
          onChange={(type) => set('type', type)}
          options={[...UNIVERSITY_TYPES]}
          placeholder="Select type"
        />
        <TextInput
          name="location"
          label="Location"
          value={form.location}
          onChange={(location) => set('location', location)}
          placeholder="e.g. Ilorin, Kwara State"
        />
      </div>

      <TextInput
        name="website"
        label="Website"
        value={form.website}
        onChange={(website) => set('website', website)}
        placeholder="https://…"
      />

      <TextArea
        name="description"
        label="Description"
        value={form.description}
        onChange={(value) => set('description', value)}
        rows={4}
      />

      <div className="flex items-center gap-2">
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

      <ChipMultiSelect
        name="courses"
        label="Courses offered here"
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
        {loading ? 'Saving…' : form.id ? 'Save changes' : 'Create university'}
      </button>
    </form>
  )
}