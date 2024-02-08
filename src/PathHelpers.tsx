export const getCoords = (dAttribute: string): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} => {
  const pathSegments = dAttribute.match(/[a-zA-Z]|-?[0-9]*\.?[0-9]+(?:e-?[0-9]+)?/g) ?? [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let currentX = 0, currentY = 0;

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    if (/[a-zA-Z]/.test(segment)) {
      // Move to command (M/m) or line to command (L/l)
      currentX = parseFloat(pathSegments[i + 1]);
      currentY = parseFloat(pathSegments[i + 2]);
      minX = Math.min(minX, currentX);
      minY = Math.min(minY, currentY);
      maxX = Math.max(maxX, currentX);
      maxY = Math.max(maxY, currentY);
      i += 2;
    } else if (segment === 'z' || segment === 'Z') {
      // Close path command
      // No need to update coordinates
    } else {
      // Other commands (horizontal/vertical line, curve, etc.)
      // Update coordinates if necessary
      const val = parseFloat(segment);
      if (!isNaN(val)) {
        if (/[Hh]/.test(pathSegments[i - 1])) {
          currentX = val;
          minX = Math.min(minX, currentX);
          maxX = Math.max(maxX, currentX);
        } else if (/[Vv]/.test(pathSegments[i - 1])) {
          currentY = val;
          minY = Math.min(minY, currentY);
          maxY = Math.max(maxY, currentY);
        } else {
          if (/[l]/.test(pathSegments[i - 1])) {
            currentX += val;
            minX = Math.min(minX, currentX);
            maxX = Math.max(maxX, currentX);
          } else if (/[t]/.test(pathSegments[i - 1])) {
            currentX += val;
            currentY += val;
            minX = Math.min(minX, currentX);
            minY = Math.min(minY, currentY);
            maxX = Math.max(maxX, currentX);
            maxY = Math.max(maxY, currentY);
          } else if (/[h]/.test(pathSegments[i - 1])) {
            currentX += val;
            minX = Math.min(minX, currentX);
            maxX = Math.max(maxX, currentX);
          } else if (/[v]/.test(pathSegments[i - 1])) {
            currentY += val;
            minY = Math.min(minY, currentY);
            maxY = Math.max(maxY, currentY);
          } else if (/[aA]/.test(pathSegments[i - 1])) {
            // For elliptical arc, skip 6 arguments (2 coords for center, 1 rotation, 1 flag for arc, 2 coords for endpoint)
            i += 6;
          } else if (/[cCsSqQtT]/.test(pathSegments[i - 1])) {
            // For cubic Bezier, smooth cubic Bezier, quadratic Bezier, and smooth quadratic Bezier, skip 4 arguments (2 control points, 1 coordinate)
            i += 4;
          }
        }
      }
    }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}

type PathCommand = {
  type: string;
  coords: number[];
}

type Point = [number, number];

export const calculateLowestYValue = (pathString: string, numSamples: number = 10): number => {
  let lowestY: number = Infinity;

  // Regular expression to match path commands and their coordinates
  const pathCommands: PathCommand[] | null = pathString.match(/[a-df-zA-DF-Z][^a-df-zA-DF-Z]*/g)?.map((command: string): PathCommand => {
      // Extract command type
      const type: string = command.charAt(0).toUpperCase();
      
      // Extract coordinates from the command
      const coords: number[] = command.slice(1).trim().split(/[ ,]+/).map(parseFloat);

      return { type, coords };
  }) ?? null;

  if (!pathCommands) {
      console.error("Invalid path string:", pathString);
      return NaN;
  }

  // Iterate through each path command
  pathCommands.forEach((command: PathCommand): void => {
      // Extract command type and coordinates
      const { type, coords } = command;

      // Calculate lowest y-coordinate for each command type
      switch (type) {
          case 'M':
          case 'L':
          case 'T':
              // For MoveTo (M), LineTo (L), and Shorthand/smooth quadratic Bezier Curve (T) commands
              for (let i: number = 1; i < coords.length; i += 2) {
                  lowestY = Math.min(lowestY, coords[i]);
              }
              break;
          case 'Q':
          case 'S':
              console.log('Q & S', coords);
              // For Quadratic Bezier Curve (Q) and Smooth cubic Bezier Curve (S) commands
              // Sample points along the curve and find the lowest y-coordinate
              const qPoints: Point[] = sampleQuadraticBezier(coords, numSamples);
              qPoints.forEach((p: Point): void => {
                  lowestY = Math.min(lowestY, p[1]);
              });
              break;
          case 'C':
              console.log('C', coords);
              // For Cubic Bezier Curve (C) commands
              // Sample points along the curve and find the lowest y-coordinate
              const cPoints: Point[] = sampleCubicBezier(coords, numSamples);
              cPoints.forEach((p: Point): void => {
                  lowestY = Math.min(lowestY, p[1]);
              });
              break;
          case 'A':
              console.log('A', coords);
              // For Elliptical Arc Curve (A) commands
              // The y-coordinate of the endpoint is considered
              lowestY = Math.min(lowestY, coords[6]);
              console.log("A Lowest: ", lowestY);
              break;
          case 'H':
              // For Horizontal LineTo (H) commands
              // No y-coordinate is involved, so no calculation is needed
              break;
          case 'V':
              // For Vertical LineTo (V) commands
              lowestY = Math.min(lowestY, coords[0]);
              break;
          case 'Z':
              // ClosePath (Z) command
              // No y-coordinate is involved, so no calculation is needed
              break;
          default:
              console.error("Unsupported path command:", type);
      }
  });

  return lowestY;
}

// Function to sample points along a quadratic Bezier curve
function sampleQuadraticBezier(coords: number[], numSamples: number): Point[] {
  const points: Point[] = [];
  for (let t: number = 0; t <= 1; t += 1 / numSamples) {
      const x: number = (1 - t) * (1 - t) * coords[0] + 2 * (1 - t) * t * coords[2] + t * t * coords[4];
      const y: number = (1 - t) * (1 - t) * coords[1] + 2 * (1 - t) * t * coords[3] + t * t * coords[5];
      points.push([x, y]);
  }
  console.log('QuadraticCurve: ', points)
  return points;
}

// Function to sample points along a cubic Bezier curve
function sampleCubicBezier(coords: number[], numSamples: number): Point[] {
  const points: Point[] = [];
  for (let t: number = 0; t <= 1; t += 1 / numSamples) {
      const x: number = (1 - t) * (1 - t) * (1 - t) * coords[0] + 3 * (1 - t) * (1 - t) * t * coords[2] + 3 * (1 - t) * t * t * coords[4] + t * t * t * coords[6];
      const y: number = (1 - t) * (1 - t) * (1 - t) * coords[1] + 3 * (1 - t) * (1 - t) * t * coords[3] + 3 * (1 - t) * t * t * coords[5] + t * t * t * coords[7];
      points.push([x, y]);
  }
  console.log('SampleCurve: ', points);
  return points;
}

const pathString = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z";
const lowestYValue = calculateLowestYValue(pathString);
console.log("Lowest y-value:", lowestYValue); // Output the lowest y-value
