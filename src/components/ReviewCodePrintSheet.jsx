import { createPortal } from 'react-dom'
import DataMatrixCode from './DataMatrixCode'

const CARDS_PER_PAGE = 6

// Hidden on screen. When printing, the app (#root) is hidden and only this sheet
// is shown, laid out in millimetres on A4 so the output never depends on the screen.
const printCss = `
.rcp-sheet { display: none; }

@media print {
  @page { size: A4 portrait; margin: 12mm; }
  html, body { background: #fff !important; }
  #root { display: none !important; }
  .rcp-sheet { display: block; color: #0f172a; font-family: Helvetica, Arial, sans-serif; }

  .rcp-page { height: 271mm; break-after: page; page-break-after: always; }
  .rcp-page:last-child { break-after: auto; page-break-after: auto; }

  .rcp-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 8mm;
    height: 100%;
  }
  .rcp-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4mm; padding: 5mm; text-align: center; overflow: hidden;
    border: 0.3mm dashed #94a3b8; /* cut guide */
  }
  .rcp-card .rcp-code { width: 46mm; }
  .rcp-card .rcp-name { font-size: 13pt; font-weight: 700; line-height: 1.2; }
  .rcp-card .rcp-dept { font-size: 10pt; color: #475569; }
  .rcp-card .rcp-hint { font-size: 9pt; color: #64748b; }

  /* One code: a single large card centred on the A4 page. */
  .rcp-single { display: flex; align-items: center; justify-content: center; height: 100%; }
  .rcp-single .rcp-card {
    width: 150mm; gap: 8mm; padding: 16mm 12mm;
    border: 0.4mm solid #cbd5e1; border-radius: 6mm;
  }
  .rcp-single .rcp-code { width: 100mm; }
  .rcp-single .rcp-name { font-size: 26pt; }
  .rcp-single .rcp-dept { font-size: 15pt; }
  .rcp-single .rcp-hint { font-size: 13pt; }

  .rcp-code canvas { display: block; width: 100%; height: auto; image-rendering: pixelated; }
}
`

function chunk(items, size) {
  const pages = []

  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size))
  }

  return pages
}

function Card({ member }) {
  return (
    <div className="rcp-card">
      <div className="rcp-code">
        <DataMatrixCode scale={8} text={member.url} />
      </div>
      <div>
        <div className="rcp-name">{member.name}</div>
        {member.department && <div className="rcp-dept">{member.department}</div>}
      </div>
      <div className="rcp-hint">Scan to leave a review</div>
    </div>
  )
}

/** members: [{ key, name, department, url }]; single prints one centred card per page. */
function ReviewCodePrintSheet({ members, single }) {
  return createPortal(
    <div className="rcp-sheet">
      <style>{printCss}</style>
      {single
        ? members.map((member) => (
            <div className="rcp-page" key={member.key}>
              <div className="rcp-single">
                <Card member={member} />
              </div>
            </div>
          ))
        : chunk(members, CARDS_PER_PAGE).map((page) => (
            <div className="rcp-page" key={page[0].key}>
              <div className="rcp-grid">
                {page.map((member) => (
                  <Card key={member.key} member={member} />
                ))}
              </div>
            </div>
          ))}
    </div>,
    document.body,
  )
}

export default ReviewCodePrintSheet
