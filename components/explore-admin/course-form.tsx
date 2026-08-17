'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/explore/slug'
import { TextInput, TextArea, ChipMultiSelect } from './fields'

export interface CourseFormValue {
  id?: string
  slug: string
  name: string
  description: string
  careers: string[]
  universities: string[]
  published: boolean
}

export default function CourseForm({
  initial,
  careers,
  universities,
}: {
  initial?: Partial<CourseFormValue>
  careers: { id: string; name: string }[]
  universities: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CourseFormValue>({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    careers: initial?.careers ?? [],
    universities: initial?.universities ?? [],
    published: initial?.published ?? false,
  })

  const set = <K extends keyof CourseFormValue>(key: K, value: CourseFormValue[K]) =>
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
      const res = await fetch(`/api/admin/explore/courses`, {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save course')
      router.push('/admin/explore/courses')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course')
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
        name="careers"
        label="Careers this course leads to"
        options={careers}
        selected={form.careers}
        onToggle={(id) =>
          set(
            'careers',
            form.careers.includes(id) ? form.careers.filter((c) => c !== id) : [...form.careers, id],
          )
        }
      />

      <ChipMultiSelect
        name="universities"
        label="Universities offering this course"
        options={universities}
        selected={form.universities}
        onToggle={(id) =>
          set(
            'universities',
            form.universities.includes(id) ? form.universities.filter((u) => u !== id) : [...form.universities, id],
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
        {loading ? 'Saving…' : form.id ? 'Save changes' : 'Create course'}
      </button>
    </form>
  )
}