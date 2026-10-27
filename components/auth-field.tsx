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
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        className="field min-h-11 w-full"
      />
    </label>
  )
}
