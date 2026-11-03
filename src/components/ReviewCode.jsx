import { REVIEW_CODE_TYPE } from '../utils/reviewOptions'
import DataMatrixCode from './DataMatrixCode'
import QrCode from './QrCode'

// Draws the staff review code in whichever format REVIEW_CODE_TYPE selects.
function ReviewCode(props) {
  return REVIEW_CODE_TYPE === 'datamatrix' ? (
    <DataMatrixCode {...props} />
  ) : (
    <QrCode {...props} />
  )
}

export default ReviewCode
