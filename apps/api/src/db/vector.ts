import { customType } from 'drizzle-orm/pg-core'

export const vector = customType<{
  data: number[] | null
  driverData: string | null
  config: { dimensions: number }
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`
  },
  toDriver(value) {
    if (!value || value.length === 0) {
      return null
    }

    return `[${value.join(',')}]`
  },
  fromDriver(value) {
    if (!value) {
      return null
    }

    const normalized = value.replace(/^\[/, '').replace(/\]$/, '')

    if (!normalized) {
      return []
    }

    return normalized.split(',').map((item) => Number(item.trim()))
  },
})
