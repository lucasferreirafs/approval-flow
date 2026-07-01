interface CustomLegendProps {
  payload?: Array<{
    value: string
    color: string
    payload: {
      color: string
      value: number
    }
  }>,
  total: number
}

export function CustomLegend({ payload, total }: CustomLegendProps) {
  if (!payload) return null

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => {
        const percentage = ((entry.payload.value / total) * 100).toFixed(0)

        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: entry.payload.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.value}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {entry.payload.value}
            </span>
            <span className="text-xs text-muted-foreground">
              ({percentage == "NaN" ? 0 : percentage}%)
            </span>
          </div>
        )
      })}
    </div>
  )
}