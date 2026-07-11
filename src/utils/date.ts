export function formatLocalDate(dateString: string, locale: string = 'pt-BR'): string {
   const [year, month, day] = dateString.split('T')[0].split('-')
   const date = new Date(Number(year), Number(month) - 1, Number(day))
   return date.toLocaleDateString(locale)
}