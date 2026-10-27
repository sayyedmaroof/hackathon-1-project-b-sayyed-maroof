'use client'

import { useState } from 'react'

export function AuthField({
  label,
  name,
  type = 'text',
  autoComplete,
  required,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  autoComplete?: string
  required?: boolean
  defaultValue?: string
}) {
  const [hidden, setHidden] = useState(true)
  const isPassword = type === 'password'
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      <span className="flex min-h-11 items-center rounded-xl border border-border bg-surface px-3">
        <input
          name={name}
          type={isPassword && !hidden ? 'text' : type}
          autoComplete={autoComplete}
          required={required}
          defaultValue={defaultValue}
          className="min-h-11 w-full bg-transparent outline-none"
        />
        {isPassword ? (
          <button type="button" className="min-h-11 px-2 text-sm font-semibold text-primary" onClick={() => setHidden((v) => !v)}>
            {hidden ? 'Show' : 'Hide'}
          </button>
        ) : null}
      </span>
    </label>
  )
}
