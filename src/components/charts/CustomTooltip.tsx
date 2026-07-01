interface CustomTooltipProps {
   active?: boolean
   payload?: Array<{
      name: string
      value: number
      payload: {
         name: string
         value: number
         color: string
      }
   }>,
   total: number
}

export function CustomTooltip({ active, payload, total }: CustomTooltipProps) {
   if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / total) * 100).toFixed(1)

      return (
         <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-35">
            <div className="flex items-center gap-2 mb-1">
               <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: data.payload.color }}
               />
               <span className="font-medium text-foreground">{data.name}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{data.value}</div>
            <div className="text-sm text-muted-foreground">{percentage == "NaN" ? 0 : percentage}% do total</div>
         </div>
      )
   }
   return null
}