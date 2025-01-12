import { VatPreference } from '@prisma/client'

const VAT_RATE = 0.18 // 18% VAT rate

export type { VatPreference }

export function calculateVat(amount: number, vatPreference: VatPreference) {
  if (vatPreference === 'VAT_INCLUSIVE') {
    // For VAT inclusive, the amount already includes VAT
    // So we need to calculate backwards to get the base price
    const basePrice = amount / (1 + VAT_RATE)
    const vatAmount = amount - basePrice
    return {
      basePrice,
      vatAmount,
      totalPrice: amount
    }
  } else {
    // For VAT exclusive, the amount is the base price
    // We need to add VAT to get the total
    const basePrice = amount
    const vatAmount = amount * VAT_RATE
    const totalPrice = basePrice + vatAmount
    return {
      basePrice,
      vatAmount,
      totalPrice
    }
  }
}

export function formatVatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function getVatBreakdown(amount: number, vatPreference: VatPreference) {
  const { basePrice, vatAmount, totalPrice } = calculateVat(amount, vatPreference)
  return {
    basePrice: formatVatAmount(basePrice),
    vatAmount: formatVatAmount(vatAmount),
    totalPrice: formatVatAmount(totalPrice)
  }
} 