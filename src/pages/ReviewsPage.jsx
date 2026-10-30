import { useCallback } from 'react'
import ApiListPage from '../components/ApiListPage'
import { listReviews } from '../services/reviewService'
import { getRating } from '../utils/reviewOptions'

const columns = [
  { key: 'staff_name', label: 'Staff' },
  { key: 'service_name', label: 'Service' },
  { key: 'rating_label', label: 'Rating' },
  { key: 'comment', label: 'Comment' },
  { key: 'reviewer_name', label: 'Reviewer' },
  { key: 'created_at', label: 'Created At' },
]

const filterKeys = ['staff_name', 'service_name', 'rating_label']

function ReviewsPage() {
  const loadData = useCallback(async (accessToken) => {
    const reviews = await listReviews(accessToken)

    return reviews.map((review) => {
      const rating = getRating(review.rating)

      return {
        ...review,
        rating_label: rating ? `${rating.emoji} ${rating.label}` : review.rating,
      }
    })
  }, [])

  return (
    <ApiListPage
      backTo="/dashboard/admin"
      columns={columns}
      emptyMessage="No reviews have been submitted yet."
      eyebrow="Public Feedback"
      filterKeys={filterKeys}
      loadData={loadData}
      title="Reviews"
    />
  )
}

export default ReviewsPage
