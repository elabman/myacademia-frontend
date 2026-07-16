import { GraduationCap } from 'lucide-react'
import { theme } from '../theme'

function Logo({ compact = false, inverse = false }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-xl shadow-md ${
          compact ? 'h-8 w-8' : 'h-9 w-9'
        } ${theme.classes.logoMark}`}
      >
        <GraduationCap size={compact ? 19 : 22} strokeWidth={2.2} />
      </div>

      <span
        className={`${compact ? 'text-base' : 'text-lg'} font-bold ${
          inverse ? theme.classes.logoTextInverse : theme.classes.logoText
        }`}
      >
        MyAcademia
      </span>
    </div>
  )
}

export default Logo
