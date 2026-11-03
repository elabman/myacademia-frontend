export const reviewRatings = [
  { value: 1, emoji: '😡', label: 'Very Poor' },
  { value: 2, emoji: '🙁', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😍', label: 'Excellent' },
]

export function getRating(value) {
  return reviewRatings.find((rating) => rating.value === Number(value)) ?? null
}

// Format of the code printed on each staff member's office card:
// 'qrcode' (default, every phone camera reads it) or 'datamatrix'.
// Both generators are kept (QrCode.jsx, DataMatrixCode.jsx); change this to switch.
export const REVIEW_CODE_TYPE = 'qrcode'

// The code on each staff member's office card encodes this URL.
export function getReviewUrl(staffId) {
  return `${window.location.origin}/review/${staffId}`
}
