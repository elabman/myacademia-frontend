import bwipjs from 'bwip-js'
import { useEffect, useRef } from 'react'

function QrCode({ className = '', scale = 4, text }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !text) {
      return
    }

    try {
      bwipjs.toCanvas(canvasRef.current, {
        bcid: 'qrcode',
        eclevel: 'M',
        paddingheight: 2,
        paddingwidth: 2,
        scale,
        text,
      })
    } catch {
      // Leave the canvas blank if the text cannot be encoded.
    }
  }, [scale, text])

  return <canvas aria-label="QR code" className={className} ref={canvasRef} />
}

export default QrCode
