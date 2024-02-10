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

interface PathCommandsObject {
  [key: string]: number[];
}

export const extractPathCommands = (pathString: string): PathCommandsObject => {
  const pathCommands: PathCommandsObject = {};

  const regex = /([a-df-zA-DF-Z])([^a-df-zA-DF-Z]*)/g;
  let match;
  while ((match = regex.exec(pathString)) !== null) {
      const [, command, paramsString] = match;
      const type = command.toUpperCase();
      
      // Extract coordinates from the command
      const coords: number[] = paramsString.trim().split(/[ ,]+/).map(parseFloat);

      if (!pathCommands[type]) {
          pathCommands[type] = [];
      }
      pathCommands[type].push(...coords);
  }

  return pathCommands;
}
