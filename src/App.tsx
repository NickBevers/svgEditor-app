/* eslint-disable no-case-declarations */
import './App.css'
import React, { useEffect, useState } from 'react'

// const tempSVG =`
// <svg
//   viewBox="0 0 600 600"
//   xmlns="http://www.w3.org/2000/svg">
//   <rect width="200" height="100" x="100" y="50" rx="20" ry="20" fill="blue" />
//   <text
//     y="400"
//     x="110"
//     fill="black"
//     font-family="Arial, Helvetica, sans-serif"
//     font-size="50"
//     font-size-adjust="1">
//     Hello
//   </text>
//   <polygon points="200,10 250,190 150,190" fill="lime" />
// </svg>`

interface SVGAttributes {
  // Presentation Attributes
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDasharray?: string;
  opacity?: string;
  transform?: string;

  // Geometry Attributes
  width?: string;
  height?: string;
  x?: string;
  y?: string;
  cx?: string;
  cy?: string;
  r?: string;
  rx?: string;
  ry?: string;
  points?: string;
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;

  // Text Attributes
  'font-family'?: string;
  'font-size'?: string;
  'text-anchor'?: 'start' | 'middle' | 'end';
  'font-size-adjust'?: string;

  // Path Attributes
  d?: string;

  // Gradient and Pattern Attributes
  gradientUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
  gradientTransform?: string;
  stops?: Array<{ offset: string; color: string }>;
  patternUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
  patternContentUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
  patternTransform?: string;

  // Filter Attributes
  filter?: string;
  stdDeviation?: number | string;
  kernelMatrix?: string;

  // Animation and Interaction Attributes
  animate?: string;
  animateTransform?: string;
  animateMotion?: string;
  onmouseover?: (event: MouseEvent) => void;
  onclick?: (event: MouseEvent) => void;
  // Add more event handlers as needed
}


const App = () => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [svgString, setSvgString] = useState('')
  const [svgElements, setSvgElements] = useState<Element[] | null>(null)
  // const [activeElement, setActiveElement] = useState<Element | null>(null)

  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  const DEFAULT_CANVAS_WIDTH = 5000
  const DEFAULT_CANVAS_HEIGHT = 5000

  // get the canvas element and set it to the canvas state on mount
  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById('svgCanvas') as HTMLCanvasElement
    setCanvas(canvas ?? null)
  }, [])

  const getTextSizes = (text: string, fontSize: string, fontName: string, fontAspectRatio: string) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");

    textElement.setAttribute("font-size", fontSize);
    textElement.setAttribute("font-family", fontName);
    textElement.setAttribute("font-size-adjust", fontAspectRatio);
    textElement.textContent = text;

    svg.appendChild(textElement);
    document.body.appendChild(svg);
    const bbox = textElement.getBBox();
    const boundingBox = textElement.getBoundingClientRect();
    document.body.removeChild(svg);
    return { width: bbox.width, height: bbox.height, bWidth: boundingBox.width, bHeight: boundingBox.height};
}

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const containsMouse = (element: Element, mouseX: number, mouseY: number) => {
    const attributes :SVGAttributes = getAttributes(element);
    const tagName = element.tagName;

    switch (tagName) {
      case 'rect':
        const x = parseInt(attributes.x!);
        const y = parseInt(attributes.y!);
        const width = parseInt(attributes.width!);
        const height = parseInt(attributes.height!);
      
        if (mouseX > x && mouseX < (x + width) && mouseY > y && mouseY < (y + height)) {
          console.log('rect clicked');
          return true;
        }
        break
      case 'circle':
        const cx = parseInt(attributes.cx!);
        const cy = parseInt(attributes.cy!);
        const r = parseInt(attributes.r!);
        if (Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2) < r) {
          console.log('circle clicked')
        }
        break
      case 'ellipse':
        const cx2 = parseInt(attributes.cx!);
        const cy2 = parseInt(attributes.cy!);
        const rx = parseInt(attributes.rx!);
        const ry = parseInt(attributes.ry!);
        if (Math.sqrt((mouseX - cx2) ** 2 / rx ** 2 + (mouseY - cy2) ** 2 / ry ** 2) < 1) {
          console.log('ellipse clicked')
        }
        break
      case 'line':
        const x1 = parseInt(attributes.x1!)
        const y1 = parseInt(attributes.y1!)
        const x2 = parseInt(attributes.x2!)
        const y2 = parseInt(attributes.y2!)

        if (mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2) {
          console.log('line clicked')
        }
        break
      case 'polyline':
        const points = attributes.points?.split(' ').map(point => point.split(',').map(Number))
        const xPoints = points?.map(point => point[0]) ?? []
        const yPoints = points?.map(point => point[1]) ?? []
        const minX = Math.min(...xPoints)
        const maxX = Math.max(...xPoints)
        const minY = Math.min(...yPoints)
        const maxY = Math.max(...yPoints)
        if (mouseX > minX && mouseX < maxX && mouseY > minY && mouseY < maxY) {
          console.log('polyline clicked')
        }
        break
      case 'polygon':
        const points2 = attributes.points?.split(' ').map(point => point.split(',').map(Number)) ?? []
        const xPoints2 = points2.map(point => point[0]);
        const yPoints2 = points2.map(point => point[1]);
        const minX2 = Math.min(...xPoints2);
        const maxX2 = Math.max(...xPoints2);
        const minY2 = Math.min(...yPoints2);
        const maxY2 = Math.max(...yPoints2);
        if (mouseX > minX2 && mouseX < maxX2 && mouseY > minY2 && mouseY < maxY2) {
          console.log('polygon clicked')
        }
        break
      case 'path':
        const path = new Path2D(attributes.d!)
        if (canvas?.getContext('2d')?.isPointInPath(path, mouseX, mouseY)) {
          console.log('path clicked')
        }
        break
      case 'text':
        const textX = parseInt(attributes.x!)
        const textY = parseInt(attributes.y!)
        const textSizes = getTextSizes(element.textContent!, attributes['font-size']!, attributes['font-family']!, attributes['font-size-adjust']!);

        const textWidth = Math.round(textSizes.width);
        const textHeight = Math.round(textSizes.height);

        console.log('textWidth: ', textWidth, 'textHeight: ', textHeight, 'textX: ', textX, 'textY: ', textY)

        // if the mouse is within the bounds of the text element, log 'text clicked'
        if (mouseX > textX && mouseX < (textX + textWidth)) {
          console.log('x is within the bounds of the text')
        }

        console.log('mouseY: ', mouseY, 'textY: ', textY, 'textHeight: ', textHeight)

        if (mouseY > textY && mouseY < (textY + textHeight)) {
          console.log('y is within the bounds of the text')
        }

        if (mouseX > textX && mouseX < (textX + textWidth) && mouseY > textY && mouseY < (textY + textHeight)) {
          console.log('text clicked')
        }
        break
        default:
        break
    }
  }

  const handleSVGChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSvgString(e.target.value)
  }

  const getAttributes = (element: Element) => {
    const attributeObject = [...element.attributes].reduce((acc, attribute) => {
      const key = attribute.name
      const value = attribute.value
      return {...acc, [key]: value}
    }, {})
    
    return attributeObject
  }

  useEffect(() => {
    return;
  }, [svgElements])

  // make a key value type for the attributes (attributes is an object with key value pairs where the key is a string and the value is a string)
  interface Attributes {
    [key: string]: string
  }

  const addToCanvas = (ctx: CanvasRenderingContext2D, element: Element, attributes: Attributes) => {
    if (!ctx) return;
    const tagName = element.tagName
    // TODO: Make every case a function that takes the context and the attributes and draws the element
    switch (tagName) {
      case 'rect':
        ctx.fillStyle = attributes.fill
        ctx.fillRect(parseInt(attributes.x), parseInt(attributes.y), parseInt(attributes.width), parseInt(attributes.height))
        break
      case 'circle':
        ctx.beginPath()
        ctx.arc(parseInt(attributes.cx), parseInt(attributes.cy), parseInt(attributes.r), 0, 2 * Math.PI)
        ctx.fillStyle = attributes.fill
        ctx.fill()
        break
      case 'ellipse':
        ctx.beginPath()
        ctx.ellipse(parseInt(attributes.cx), parseInt(attributes.cy), parseInt(attributes.rx), parseInt(attributes.ry), 0, 0, 2 * Math.PI)
        ctx.fillStyle = attributes.fill
        ctx.fill()
        break
      case 'line':
        ctx.beginPath()
        ctx.moveTo(parseInt(attributes.x1), parseInt(attributes.y1))
        ctx.lineTo(parseInt(attributes.x2), parseInt(attributes.y2))
        ctx.stroke()
        break
      case 'polyline':
        const points = attributes.points.split(' ')
        ctx.beginPath()
        ctx.moveTo(parseInt(points[0]), parseInt(points[1]))
        points.forEach((_, index) => {
          if (index % 2 === 0) {
            ctx.lineTo(parseInt(points[index]), parseInt(points[index + 1]))
          }
        })
        ctx.stroke()
        break
      case 'polygon':
        const points2 = attributes.points.split(' ').map(point => point.split(',').map(Number));
        ctx.beginPath();
        ctx.moveTo(points2[0][0], points2[0][1]);
        for (let i = 1; i < points2.length; i++) {
          ctx.lineTo(points2[i][0], points2[i][1]);
        }
        ctx.closePath();
        ctx.fillStyle = attributes.fill;
        ctx.strokeStyle = attributes.stroke ?? 'red';
        ctx.lineWidth = Number(attributes.lineWidth) ?? 5;
        ctx.fill();
        ctx.stroke();
        break
      case 'path':
        const path = new Path2D(attributes.d)
        ctx.fillStyle = attributes.fill
        ctx.fill(path)
        break
      case 'text':
        const textContent = element.textContent?.replace(/\s+/g, ' ').trim()
        ctx.font = `${attributes['font-size']}px ${attributes['font-family']}`
        ctx.fillStyle = attributes.fill
        ctx.fillText(textContent!, parseInt(attributes.x), parseInt(attributes.y))

        const textSizes = getTextSizes(textContent!, attributes['font-size']!, attributes['font-family']!, attributes['font-size-adjust']!);
        const textWidth = Math.round(textSizes.width);
        const textHeight = Math.round(textSizes.height);
        
        console.log('textWidth: ', textWidth, 'textHeight: ', textHeight, 'textX: ', parseInt(attributes.x), 'textY: ', parseInt(attributes.y))
        ctx.strokeStyle = 'red'
        ctx.strokeRect(parseInt(attributes.x), parseInt(attributes.y), textWidth, textHeight)
        break
      // case 'multiLineText':
      //   // clean up the text content and split it into lines
      //   const textContent = element.textContent?.replace(/\s+/g, ' ').trim()
      //   const textLines = textContent?.split('\n')
      //   console.log('textLines: ', textLines)
      //   textLines?.forEach((line, index) => {
      //     ctx.font = `${attributes['font-size']}px ${attributes['font-family']}`
      //     ctx.fillStyle = attributes.fill
      //     ctx.fillText(line, parseInt(attributes.x), parseInt(attributes.y) + (parseInt(attributes['font-size']) * (index + 1)))

      //     const textSizes = getTextSizes(line, attributes['font-size']!, attributes['font-family']!, attributes['font-size-adjust']!);
      //     const textWidth = Math.round(textSizes.width);
      //     const textHeight = Math.round(textSizes.height);

      //     console.log('textWidth: ', textWidth, 'textHeight: ', textHeight, 'textX: ', parseInt(attributes.x), 'textY: ', parseInt(attributes.y) + (parseInt(attributes['font-size']) * index))
      //     ctx.strokeStyle = 'red'
      //     ctx.strokeRect(parseInt(attributes.x), parseInt(attributes.y) + (parseInt(attributes['font-size']) * index), textWidth, textHeight)
      //   })
      //   break
      default:
        break
    }
  }

  // const handleMouseOver = (e: React.MouseEvent<HTMLCanvasElement>) => {
  //   const canvas: HTMLCanvasElement = document.getElementById('svgCanvas') as HTMLCanvasElement
  //   const ctx = canvas.getContext('2d')
  //   if (!ctx) return

  //   const x = e.clientX
  //   const y = e.clientY
  //   const element = document.elementFromPoint(x, y)
  //   if (element) {
  //     console.log('element: ', element)
  //     const elementIndex = svgElements?.findIndex((svgElement) => svgElement === element)
  //     if (elementIndex !== -1) {
  //       const attributes = getAttributes(element)
  //       addToCanvas(ctx, element, attributes)
  //     }
  //   }
  // }
  
  const loadSvg = () => {
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    
    const svg = new DOMParser().parseFromString(svgString, 'image/svg+xml')
    const svgChildren = [...svg.children[0].children];
    setSvgElements(svgChildren)


    svgChildren.forEach((element) => {
      const attributes = getAttributes(element)
      addToCanvas(ctx, element, attributes)
    })
  }

  const clearCanvas = () => {
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas?.width ?? DEFAULT_CANVAS_WIDTH, canvas?.height ?? DEFAULT_CANVAS_HEIGHT);
  }

  useEffect(() => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    canvas?.addEventListener('mousemove', (e) => {
      setMouseX(e.offsetX)
      setMouseY(e.offsetY)
    })

    canvas?.addEventListener('mouseup', (e) => {
      const mouseX = e.offsetX
      const mouseY = e.offsetY

      // check if the x and y coordinates are within the bounds of any of the svg elements and if so, set the active element to that element
      svgElements?.reverse().forEach((el) => {
        containsMouse(el, mouseX, mouseY)
      })
    })

  }, [canvas, containsMouse, svgElements])

  return (
    <div>
      <div className='appContainer'>
        <canvas id='svgCanvas' className='border--red' width={600} height={600} />
        <div className='svgInput__container'>
          <textarea id="svgInput" className='svgInput' onChange={handleSVGChange}></textarea>
          
          <div className='button__container'>
            <button onClick={loadSvg}>Load SVG</button>
            <button onClick={clearCanvas}>Clear Canvas</button>
          </div>

          <div className="mousePosition">
            <p>Mouse X: {mouseX}</p>
            <p>Mouse Y: {mouseY}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
