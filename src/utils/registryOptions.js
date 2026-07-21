export function toOptions(items, labelKeys, valueKeys = ['id', 'value']) {
  const seenValues = new Set()

  return items
    .map((item) => {
      const valueKey = valueKeys.find((key) => item[key])
      const value = valueKey ? item[valueKey] : undefined
      const labelKey = labelKeys.find((key) => item[key])
      const label = labelKey ? item[labelKey] : item.label

      if (!value || !label || seenValues.has(String(value))) {
        return null
      }

      seenValues.add(String(value))
      return { label, value }
    })
    .filter(Boolean)
}

export function staticOptions(values) {
  return values.map((value) => ({ label: value, value }))
}
