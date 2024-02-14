import './App.css'
import React, { useEffect, useState } from 'react'
import { getHighestXValue, getHighestYValue, getLowestXValue, getLowestYValue, movePath } from './PathHelpers';
`
<svg
  viewBox="0 0 600 600"
  xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="100" x="300" y="150" rx="20" ry="20" fill="blue" />
  <text
    y="400"
    x="110"
    fill="black"
    font-family="Arial, Helvetica, sans-serif"
    font-size="50">Hello</text>
    <path
      fill="orange"
      d="M 10,30
        A 20,20 0,0,1 50,30
        A 20,20 0,0,1 90,30
        Q 90,60 50,90
        Q 10,60 10,30 z" />
    <path
      fill="purple"
      d="M 60,80
        A 20,20 0,0,1 100,80
        A 20,20 0,0,1 140,80
        Q 140,110 100,140
        Q 60,110 60,80 z" />
  <polygon points="200,10 250,190 150,190" fill="lime" />
</svg>
`

/*
  - Add an event listener for mousedown on the canvas
  - On mousedown, check if the mouse is over an element
  - If it is, check if that element is the active element
  - if it isn't, set that element as the active element
  - if it is, add an event listener for mousemove on the canvas
  - on mousemove, update the position of the active element to the mouse position (offset of the mouse position from the top left of the canvas)
  - add an event listener for mouseup on the canvas
  - on mouseup, set the active element to null


  FOR DRAGGING ELEMENTS:
  - Add an event listener for mousedown on the canvas
  - On mousedown, check if the mouse is over an element
  - If it is, set that element as the active element and set the mouse position as the offset from the top left of the element
  - Add an event listener for mousemove on the canvas
  - on mousemove, if an element is active, update the position of the element to the mouse position minus the offset
  - Add an event listener for mouseup on the canvas
  - on mouseup, set the active element to null

  other possible solution for dragging elements
  - add an event listener for mousedown on the canvas
  - on mousedown, check if the mouse is over an element
  - if it is, set that element as the active element and set the mouse position as the offset from the top left of the element
  - add an event listener for mousemove on the canvas
  - on mousemove, if an element is active, update the position of the element to the mouse position minus the offset
  - add an event listener for mouseup on the canvas
  - on mouseup, cancel the event listener for mousemove

  is it possible to move the element with absolute positioning?
  - get the x and y coordinates of the element
  - set the x and y coordinates of the element to the mouse position minus the offset
  - if the element is a path, update the d attribute with the new x and y coordinates


*/

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

interface Attributes {
  [key: string]: string
}

interface SvgElementCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

const App = () => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [svgString, setSvgString] = useState('')
  const [svgElements, setSvgElements] = useState<Element[] | null>(null)
  const [activeElement, setActiveElement] = useState<Element | null>(null)
  const [activeElementOffset, setActiveElementOffset] = useState({ x: 0, y: 0 })
  const [movingEventListeners, setMovingEventListeners] = useState(false)
  const [svgElementCoordinates, setSvgElementCoordinates] = useState< SvgElementCoordinates[] | null>(null)
  
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  const DEFAULT_CANVAS_WIDTH = 1000
  const DEFAULT_CANVAS_HEIGHT = 1000
  const DEFAULT_TEXT_ASCENDING = 0.75

  // get the canvas element and set it to the canvas state on mount
  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById('svgCanvas') as HTMLCanvasElement
    setCanvas(canvas ?? null)
  }, [])

  const getTextSizes = (
    text: string,
    fontSize: string,
    fontName: string,
  ) => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return { width: 0, height: 0 };

    ctx.font = `${fontSize}px ${fontName}`;
    const width = ctx.measureText(text).width;
    const height = parseInt(fontSize);

    console.log('width: ', width, 'height: ', height)
    return { width, height };
  };

  const containsMouse = (element: Element, index: number, mouseX: number, mouseY: number) => {
    const attributes :SVGAttributes = getAttributes(element);
    const tagName = element.tagName;

    // TODO: Change this function to use the svgElementCoordinates state to check if the mouse is within the bounds of the element
    const elementCoordinates = svgElementCoordinates![index];
    console.log('elementCoordinates: ', elementCoordinates)
 
    switch (tagName) {
      case 'rect':
        const x = parseInt(attributes.x!);
        const y = parseInt(attributes.y!);
        const width = parseInt(attributes.width!);
        const height = parseInt(attributes.height!);
      
        if (mouseX > x && mouseX < (x + width) && mouseY > y && mouseY < (y + height)) {
          // console.log('rect clicked');
          setActiveElement(element);
          const offsetX = mouseX - x
          const offsetY = mouseY - y
          setActiveElementOffset({ x: offsetX, y: offsetY })
          return true;
        }
        break
      case 'circle':
        const cx = parseInt(attributes.cx!);
        const cy = parseInt(attributes.cy!);
        const r = parseInt(attributes.r!);
        if (Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2) < r) {
          // console.log('circle clicked');
          setActiveElement(element);
          const offsetX = mouseX - cx
          const offsetY = mouseY - cy
          setActiveElementOffset({ x: offsetX, y: offsetY })
          return true;
        }
        break
      case 'ellipse':
        const cx2 = parseInt(attributes.cx!);
        const cy2 = parseInt(attributes.cy!);
        const rx = parseInt(attributes.rx!);
        const ry = parseInt(attributes.ry!);
        if (Math.sqrt((mouseX - cx2) ** 2 / rx ** 2 + (mouseY - cy2) ** 2 / ry ** 2) < 1) {
          // console.log('ellipse clicked');
          setActiveElement(element);
          const offsetX = mouseX - cx2
          const offsetY = mouseY - cy2
          setActiveElementOffset({ x: offsetX, y: offsetY })
          return true;
        }
        break
      case 'line':
        const x1 = parseInt(attributes.x1!)
        const y1 = parseInt(attributes.y1!)
        const x2 = parseInt(attributes.x2!)
        const y2 = parseInt(attributes.y2!)

        if (mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2) {
          // console.log('line clicked');
          setActiveElement(element);
          const offsetX = mouseX - x1
          const offsetY = mouseY - y1
          setActiveElementOffset({ x: offsetX, y: offsetY })
          return true;
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
          // console.log('polyline clicked');
          setActiveElement(element);
          const offsetX = mouseX - minX
          const offsetY = mouseY - minY
          setActiveElementOffset({ x: offsetX, y: offsetY })
          return true;
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
          // console.log('polygon clicked');
          setActiveElement(element);
          const offsetX = mouseX - minX2
          const offsetY = mouseY - minY2
          setActiveElementOffset({ x: offsetX, y: offsetY })
          return true;
        }
        break
      case 'path':
        const path = new Path2D(attributes.d!)
        if (canvas?.getContext('2d')?.isPointInPath(path, mouseX, mouseY)) {
          // console.log('path clicked');
          setActiveElement(element);

          // get the lowest x and y values of the path
          const offsetX = mouseX - getLowestXValue(attributes.d!)
          const offsetY = mouseY - getLowestYValue(attributes.d!)
          setActiveElementOffset({ x: offsetX, y: offsetY })

          return true;
        }
        break
      case 'text':
        const textContent = element.textContent?.replace(/\s+/g, ' ').trim()
        const textSizes = getTextSizes(textContent!, attributes['font-size']!, attributes['font-family']!);
        const textWidth = Math.round(textSizes.width);
        const textHeight = Math.round(textSizes.height);
        const textX = parseInt(attributes.x!)
        const textY = parseInt(attributes.y!)
        if (mouseX > textX && mouseX < (textX + textWidth) && mouseY > (textY - (textHeight * DEFAULT_TEXT_ASCENDING)) && mouseY < (textY + (textHeight * (1 - DEFAULT_TEXT_ASCENDING)))) {
          // console.log('text clicked');
          setActiveElement(element);

          // calculate the offset of the mouse from the top left of the text, but keep in mind that the text is drawn from the bottom left
          const offsetX = mouseX - textX
          const offsetY = mouseY - textY
          setActiveElementOffset({ x: offsetX, y: offsetY })

          return true;
        }
        break
      default:
        setActiveElement(null);
        return false;
        break
    }
  }
  
  const getAttributes = (element: Element) => {
    const attributeObject = [...element.attributes].reduce((acc, attribute) => {
      const key = attribute.name
      const value = attribute.value
      return {...acc, [key]: value}
    }, {})
    
    return attributeObject
  }

  const handleSVGChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSvgString(e.target.value)
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
        // remove all unnecessary whitespace from the path string
        const pathString = attributes.d?.replace(/\s+/g, ' ').trim()
        const path = new Path2D(pathString)
        ctx.fillStyle = attributes.fill
        ctx.fill(path)
        break
      case 'text':
        const textContent = element.textContent?.replace(/\s+/g, ' ').trim()
        ctx.font = `${attributes['font-size']}px ${attributes['font-family']}`
        ctx.fillStyle = attributes.fill
        ctx.fillText(textContent!, parseInt(attributes.x), parseInt(attributes.y))
        break
      case 'multiLineText':
        // clean up the text content and split it into lines
        const multiTextContent = element.textContent?.replace(/\s+/g, ' ').trim()
        const textLines = multiTextContent?.split('\n')
        textLines?.forEach((line, index) => {
          ctx.font = `${attributes['font-size']}px ${attributes['font-family']}`
          ctx.fillStyle = attributes.fill
          ctx.fillText(line, parseInt(attributes.x), parseInt(attributes.y) + (parseInt(attributes['font-size']) * (index + 1)))

          const textSizes = getTextSizes(line, attributes['font-size']!, attributes['font-family']!);
          const textWidth = Math.round(textSizes.width);
          const textHeight = Math.round(textSizes.height);

          // console.log('textWidth: ', textWidth, 'textHeight: ', textHeight, 'textX: ', parseInt(attributes.x), 'textY: ', parseInt(attributes.y) + (parseInt(attributes['font-size']) * index))
          ctx.strokeStyle = 'red'
          ctx.strokeRect(parseInt(attributes.x), parseInt(attributes.y) + (parseInt(attributes['font-size']) * index), textWidth, textHeight)
        })
        break
      default:
        break
    }
  }

  const calculateElementCoordinates = (element: Element, attributes: Attributes) => {
    console.log('calculating element coordinates')
    console.log('element: ', element, 'attributes: ', attributes)
    // TODO: create a switch statement that calculates the coordinates of the element and sets the svgElementCoordinates state
    const tagName = element.tagName
    switch (tagName) {
      case 'rect':
        const x = parseInt(attributes.x!)
        const y = parseInt(attributes.y!)
        const width = parseInt(attributes.width!)
        const height = parseInt(attributes.height!)
        setSvgElementCoordinates([...svgElementCoordinates!, { x, y, width, height }])
        break
      case 'circle':
        const cx = parseInt(attributes.cx!)
        const cy = parseInt(attributes.cy!)
        const r = parseInt(attributes.r!)
        setSvgElementCoordinates([...svgElementCoordinates!, { x: cx - r, y: cy - r, width: r * 2, height: r * 2 }])
        break
      case 'ellipse':
        const cx2 = parseInt(attributes.cx!)
        const cy2 = parseInt(attributes.cy!)
        const rx = parseInt(attributes.rx!)
        const ry = parseInt(attributes.ry!)
        setSvgElementCoordinates([...svgElementCoordinates!, { x: cx2 - rx, y: cy2 - ry, width: rx * 2, height: ry * 2 }])
        break
      case 'line':
        const x1 = parseInt(attributes.x1!)
        const y1 = parseInt(attributes.y1!)
        const x2 = parseInt(attributes.x2!)
        const y2 = parseInt(attributes.y2!)
        const lineMinX = Math.min(x1, x2)
        const lineMinY = Math.min(y1, y2)
        const lineMaxX = Math.max(x1, x2)
        const lineMaxY = Math.max(y1, y2)
        setSvgElementCoordinates([...svgElementCoordinates!, { x: lineMinX, y: lineMinY, width: lineMaxX - lineMinX, height: lineMaxY - lineMinY }])
        break
      case 'polyline':
        const points = attributes.points.split(' ').map(point => point.split(',').map(Number))
        const xPoints = points.map(point => point[0])
        const yPoints = points.map(point => point[1])
        const minX = Math.min(...xPoints)
        const minY = Math.min(...yPoints)
        const maxX = Math.max(...xPoints)
        const maxY = Math.max(...yPoints)
        setSvgElementCoordinates([...svgElementCoordinates!, { x: minX, y: minY, width: maxX - minX, height: maxY - minY }])
        break
      case 'polygon':
        const points2 = attributes.points.split(' ').map(point => point.split(',').map(Number))
        const xPoints2 = points2.map(point => point[0])
        const yPoints2 = points2.map(point => point[1])
        const minX2 = Math.min(...xPoints2)
        const minY2 = Math.min(...yPoints2)
        const maxX2 = Math.max(...xPoints2)
        const maxY2 = Math.max(...yPoints2)
        setSvgElementCoordinates([...svgElementCoordinates!, { x: minX2, y: minY2, width: maxX2 - minX2, height: maxY2 - minY2 }])
        break
      case 'path':
        const pathString = attributes.d!
        const pathMinX = getLowestXValue(pathString)
        const pathMinY = getLowestYValue(pathString)
        const pathMaxX = getHighestXValue(pathString)
        const pathMaxY = getHighestYValue(pathString)
        setSvgElementCoordinates([...svgElementCoordinates!, { x: pathMinX, y: pathMinY, width: pathMaxX - pathMinX, height: pathMaxY - pathMinY }])
        break
      case 'text':
        const textContent = element.textContent?.replace(/\s+/g, ' ').trim()
        const textSizes = getTextSizes(textContent!, attributes['font-size']!, attributes['font-family']!);
        const textWidth = Math.round(textSizes.width);
        const textHeight = Math.round(textSizes.height);
        const textX = parseInt(attributes.x!)
        const textY = parseInt(attributes.y!)
        setSvgElementCoordinates([...svgElementCoordinates!, { x: textX, y: textY, width: textWidth, height: textHeight }])
        break
      default:
        break
    }
  }
  
  const loadSvg = () => {
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    
    const svg = new DOMParser().parseFromString(svgString, 'image/svg+xml')
    const svgChildren = [...svg.children[0].children];

    svgChildren.forEach((element, index) => {
      if (element.tagName === 'path') {
        const pathString = (getAttributes(element) as Attributes).d?.replace(/\s+/g, ' ').trim()
        svgChildren[index].setAttribute('d', pathString)
      }
    })

    setSvgElements(svgChildren)

    svgChildren.forEach((element) => {
      const attributes: Attributes = getAttributes(element)
      calculateElementCoordinates(element, attributes)
      addToCanvas(ctx, element, attributes)
    })
  }

  const clearCanvas = () => {
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas?.width ?? DEFAULT_CANVAS_WIDTH, canvas?.height ?? DEFAULT_CANVAS_HEIGHT);

    setSvgElements(null)
    setActiveElement(null)
    // setElementCoordinates(null)
  }

  const moveElement = (element: Element, x: number, y: number) => {
    const attributes: Attributes = getAttributes(element)
    const tagName = element.tagName
    x = x - activeElementOffset.x
    y = y - activeElementOffset.y

    switch (tagName) {
      case 'rect':
        element.setAttribute('x', x.toString())
        element.setAttribute('y', y.toString())
        break
      case 'circle':
        element.setAttribute('cx', x.toString())
        element.setAttribute('cy', y.toString())
        break
      case 'ellipse':
        element.setAttribute('cx', x.toString())
        element.setAttribute('cy', y.toString())
        break
      case 'line':
        element.setAttribute('x1', x.toString())
        element.setAttribute('y1', y.toString())
        break
      case 'polyline':
        const points = attributes.points.split(' ').map(point => point.split(',').map(Number))
        const xPoints = points.map(point => point[0])
        const yPoints = points.map(point => point[1])
        const minX = Math.min(...xPoints)
        const minY = Math.min(...yPoints)
        const xDiff = x - minX
        const yDiff = y - minY
        const newPoints = points.map(point => [point[0] + xDiff, point[1] + yDiff])
        const newPointsString = newPoints.map(point => point.join(',')).join(' ')
        element.setAttribute('points', newPointsString)
        break
      case 'polygon':
        const points2 = attributes.points.split(' ').map(point => point.split(',').map(Number))
        const xPoints2 = points2.map(point => point[0])
        const yPoints2 = points2.map(point => point[1])
        const minX2 = Math.min(...xPoints2)
        const minY2 = Math.min(...yPoints2)
        const xDiff2 = x - minX2
        const yDiff2 = y - minY2
        const newPoints2 = points2.map(point => [point[0] + xDiff2, point[1] + yDiff2])
        const newPointsString2 = newPoints2.map(point => point.join(',')).join(' ')
        element.setAttribute('points', newPointsString2)
        break
      case 'path':
        movePath(attributes.d!, x, y)
        break
      case 'text':
        element.setAttribute('x', x.toString())
        element.setAttribute('y', y.toString())
        break
      default:
        break
    }

    resetCanvas()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleMouseMove = (e: MouseEvent) => {
    if (!activeElement) return;
    const offsetX = e.offsetX
    const offsetY = e.offsetY
    
    // setTimeout(() => {
    //   console.log('moving at frame rate')
    //   moveElement(activeElement!, offsetX, offsetY)
    // }, frameTime)

    // move the element to the offset
    moveElement(activeElement, offsetX, offsetY)
  }

  const resetCanvas = () => {
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas?.width ?? DEFAULT_CANVAS_WIDTH, canvas?.height ?? DEFAULT_CANVAS_HEIGHT);
    svgElements?.forEach((element) => {
      const attributes: Attributes = getAttributes(element)
      addToCanvas(ctx, element, attributes)
    })
  }

  const handleMouseUp = () => {
    canvas?.removeEventListener('mousemove', handleMouseMove)
    setMovingEventListeners(false)
    resetCanvas()
    // clearCanvas() TODO: rework the move function so it updates the svg elements array
    // loadSvg()
  }

  const handleCanvasClick = (e: MouseEvent) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    const elArrLength = svgElements ? svgElements.length : 0;

    for (let i = elArrLength - 1; i >= 0; i--) {
      const element = svgElements![i];
      if (containsMouse(element, i, mouseX, mouseY)) {
        if (!activeElement || element !== activeElement) {
          setActiveElement(element);
          return;
        }

        if (element === activeElement && !movingEventListeners) {
          setMovingEventListeners(true);
          canvas?.addEventListener('mousemove', handleMouseMove);
          canvas?.addEventListener('mouseup', handleMouseUp, { once: true });
        } else {
          setActiveElement(null);
          setMovingEventListeners(false);
          resetCanvas();
        }
        return;
      }
    }
  }
  

  useEffect(() => {
    if (!activeElement) return;
    // console.log('activeElement: ', activeElement)
    // setEditable(getAttributes(activeElement!))
  }, [activeElement])

  useEffect(() => {
    if (!canvas || !svgElements) return;
    
    canvas?.addEventListener('mousemove', (e) => {
      setMouseX(e.offsetX)
      setMouseY(e.offsetY)
    })

    canvas?.addEventListener('mousedown', handleCanvasClick, {once: true})
    // canvas?.addEventListener('mousemove', handleMouseMove)
    // canvas?.addEventListener('mouseup', () => {
    //   canvas?.removeEventListener('mousemove', handleMouseMove)
    //   resetCanvas()
    // })

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
