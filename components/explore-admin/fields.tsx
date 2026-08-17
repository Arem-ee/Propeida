'use client'

export function TextInput({
  name,
  label,
  value,
  onChange,
  required,
  placeholder,
  hint,
}: {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  hint?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px] focus:border-blue-500 focus:outline-none"
      />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export function TextArea({
  name,
  label,
  value,
  onChange,
  rows,
  placeholder,
  hint,
}: {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  hint?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows ?? 4}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
      />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export function ListField({
  name,
  label,
  value,
  onChange,
  hint,
}: {
  name: string
  label: string
  value: string[]
  onChange: (value: string[]) => void
  hint?: string
}) {
  return (
    <TextArea
      name={name}
      label={label}
      value={value.join('\n')}
      onChange={(text) =>
        onChange(
          text
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        )
      }
      rows={3}
      hint={hint ?? 'One item per line'}
    />
  )
}

export function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
}: {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px] focus:border-blue-500 focus:outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export function ChipMultiSelect({
  name,
  label,
  options,
  selected,
  onToggle,
}: {
  name: string
  label: string
  options: { id: string; name: string }[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
      {options.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-xs text-gray-400">
          No options available yet — create some first.
        </p>
      ) : (
        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-gray-100 bg-white p-3">
          {options.map((option) => {
            const active = selected.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                name={name}
                onClick={() => onToggle(option.id)}
                className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all min-h-[40px] cursor-pointer ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}