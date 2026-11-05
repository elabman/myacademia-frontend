import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { theme } from '../theme'

function PasswordInput({ autoComplete, disabled, id, label, onChange, placeholder, value }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <label
        className={`mb-1.5 block text-xs font-semibold sm:text-sm ${theme.classes.label}`}
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <Lock
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.classes.icon}`}
          size={18}
        />
        <input
          autoComplete={autoComplete}
          className={`w-full rounded-xl border py-2.5 pl-11 pr-11 text-sm transition focus:outline-none focus:ring-2 sm:py-3 ${theme.classes.field}`}
          disabled={disabled}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          type={isVisible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition ${theme.classes.icon} ${theme.classes.iconHover}`}
          disabled={disabled}
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

export default PasswordInput
