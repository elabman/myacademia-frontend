import { createPortal } from 'react-dom'
import ReviewCode from './ReviewCode'

// Hidden on screen. When printing, the app (#root) is hidden and only this sheet
// is shown, laid out in millimetres on A4 (one code per page) so the output never
// depends on the screen. The page margin is 0 because Chrome draws its date, title,
// URL and page-number header/footer inside the margin; the spacing comes from the
// page height and centring instead.
const printCss = `
.rcp-sheet { display: none; }

@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { background: #fff !important; margin: 0; }
  #root { display: none !important; }
  .rcp-sheet { display: block; color: #0f172a; font-family: Helvetica, Arial, sans-serif; }

  .rcp-page {
    display: flex; align-items: center; justify-content: center;
    height: 296mm; /* a hair under 297mm so no blank page follows */
    break-after: page; page-break-after: always;
  }
  .rcp-page:last-child { break-after: auto; page-break-after: auto; }

  .rcp-card {
    display: flex; flex-direction: column; align-items: center;
    width: 150mm; gap: 8mm; padding: 16mm 12mm; text-align: center;
    border: 0.4mm solid #cbd5e1; border-radius: 6mm;
  }
  .rcp-code { width: 100mm; }
  .rcp-code canvas { display: block; width: 100%; height: auto; image-rendering: pixelated; }
  .rcp-name { font-size: 26pt; font-weight: 700; line-height: 1.2; }
  .rcp-dept { font-size: 15pt; color: #475569; }
  .rcp-hint { font-size: 13pt; color: #64748b; }
}
`

function Card({ member }) {
  return (
    <div className="rcp-card">
      <div className="rcp-code">
        <ReviewCode scale={8} text={member.url} />
      </div>
      <div>
        <div className="rcp-name">{member.name}</div>
        {member.department && <div className="rcp-dept">{member.department}</div>}
      </div>
      <div className="rcp-hint">Scan to leave a review</div>
    </div>
  )
}

/** members: [{ key, name, department, url }]; every code gets its own A4 page. */
function ReviewCodePrintSheet({ members }) {
  return createPortal(
    <div className="rcp-sheet">
      <style>{printCss}</style>
      {members.map((member) => (
        <div className="rcp-page" key={member.key}>
          <Card member={member} />
        </div>
      ))}
    </div>,
    document.body,
  )
}

export default ReviewCodePrintSheet
