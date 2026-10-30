import bwipjs from 'bwip-js'
import { useEffect, useRef } from 'react'

function DataMatrixCode({ className = '', scale = 4, text }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !text) {
      return
    }

    try {
      bwipjs.toCanvas(canvasRef.current, {
        bcid: 'datamatrix',
        paddingwidth: 2,
        paddingheight: 2,
        scale,
        text,
      })
    } catch {
      // Leave the canvas blank if the text cannot be encoded.
    }
  }, [scale, text])

  return <canvas aria-label="Data Matrix code" className={className} ref={canvasRef} />
}

export default DataMatrixCode
