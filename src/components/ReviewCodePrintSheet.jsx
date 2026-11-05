import { createPortal } from 'react-dom'
import logo from '../assets/images/kigali-college-logo.png'
import ReviewCode from './ReviewCode'

const BRAND_BLUE = '#1076bd' // taken from the Kigali College logo
const SCAN_PROMPT = 'Scan to leave a review on service provided'

// Hidden on screen. When printing, the app (#root) is hidden and only this sheet
// is shown, laid out in millimetres on A4 (one framed page per code) so the output
// never depends on the screen. The page margin is 0 because Chrome draws its date,
// title, URL and page-number header/footer inside the margin; the spacing comes from
// the page height and the frame instead. print-color-adjust keeps the blue frame and
// button even when "Background graphics" is off in the print dialog.
const printCss = `
.rcp-sheet { display: none; }

@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { background: #fff !important; margin: 0; }
  #root { display: none !important; }
  .rcp-sheet {
    display: block; color: #0f172a; font-family: Helvetica, Arial, sans-serif;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  .rcp-page {
    display: flex; align-items: center; justify-content: center;
    height: 296mm; /* a hair under 297mm so no blank page follows */
    break-after: page; page-break-after: always;
  }
  .rcp-page:last-child { break-after: auto; page-break-after: auto; }

  /* Double frame: thick outer line, thin inner line. */
  .rcp-frame {
    box-sizing: border-box; width: 192mm; height: 278mm; padding: 2.5mm;
    border: 1.6mm solid ${BRAND_BLUE}; border-radius: 4mm;
  }
  .rcp-frame-inner {
    box-sizing: border-box; height: 100%; padding: 10mm 14mm;
    border: 0.5mm solid ${BRAND_BLUE}; border-radius: 2.5mm;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 9mm; text-align: center;
  }

  .rcp-logo { width: 92mm; height: auto; display: block; }
  /* Blue rule with the Rwanda green and yellow from the logo. */
  .rcp-rule { display: flex; width: 92mm; height: 1.4mm; margin-top: -3mm; }
  .rcp-rule span:nth-child(1) { flex: 1; background: ${BRAND_BLUE}; }
  .rcp-rule span:nth-child(2) { width: 14mm; background: #fce014; }
  .rcp-rule span:nth-child(3) { width: 14mm; background: #10a048; }

  /* For now the card names the department only, not the staff member. */
  .rcp-dept { font-size: 26pt; font-weight: 700; line-height: 1.2; color: ${BRAND_BLUE}; }

  .rcp-codebox {
    box-sizing: content-box; width: 92mm; padding: 5mm;
    border: 0.8mm solid ${BRAND_BLUE}; border-radius: 5mm;
  }
  .rcp-codebox canvas { display: block; width: 100%; height: auto; image-rendering: pixelated; }

  .rcp-button {
    padding: 4mm 9mm; border-radius: 999px; background: ${BRAND_BLUE};
    color: #fff; font-size: 15pt; font-weight: 700;
  }
}
`

function Card({ member }) {
  return (
    <div className="rcp-frame">
      <div className="rcp-frame-inner">
        <img alt="Kigali College" className="rcp-logo" src={logo} />
        <div className="rcp-rule">
          <span />
          <span />
          <span />
        </div>
        {member.department && <div className="rcp-dept">{member.department}</div>}
        <div className="rcp-codebox">
          <ReviewCode scale={8} text={member.url} />
        </div>
        <div className="rcp-button">{SCAN_PROMPT}</div>
      </div>
    </div>
  )
}

/** members: [{ key, name, department, url }]; every code gets its own framed A4 page. */
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
