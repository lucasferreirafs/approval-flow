interface ColorPickerProps {
   value: string
   onChange: (color: string) => void
}

const COLOR_PALETTE = [
   { label: 'Violeta', value: '#8b5cf6' },
   { label: 'Azul', value: '#3357FF' },
   { label: 'Verde', value: '#22c55e' },
   { label: 'Laranja', value: '#f59e0b' },
   { label: 'Vermelho', value: '#ef4444' },
   { label: 'Rosa', value: '#ec4899' },
   { label: 'Ciano', value: '#06b6d4' },
   { label: 'Amarelo', value: '#eab308' },
   { label: 'Cinza', value: '#6b7280' },
   { label: 'Indigo', value: '#6366f1' },
]

export function ColorPicker({ value, onChange }: ColorPickerProps) {
   return (
      <div className="space-y-2">
         <label className="text-sm font-medium text-foreground">Cor do departamento</label>
         <div className="flex flex-wrap gap-2">
            {COLOR_PALETTE.map((color) => (
               <button
                  key={color.value}
                  type="button"
                  onClick={() => onChange(color.value)}
                  title={color.label}
                  className={`
                     w-8 h-8 rounded-full transition-all
                     ${value === color.value
                        ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                        : 'hover:scale-105'
                     }
                  `}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Selecionar cor ${color.label}`}
               />
            ))}
         </div>

         <div className="flex items-center gap-2 mt-2">
            <div
               className="w-6 h-6 rounded-full border border-border shrink-0"
               style={{ backgroundColor: value }}
            />
            <input
               type="text"
               value={value}
               onChange={(e) => onChange(e.target.value)}
               placeholder="#000000"
               maxLength={7}
               className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background outline-none focus:border-violet-400 focus:ring-2 focus:ring-ring/20"
            />
         </div>
      </div>
   )
}