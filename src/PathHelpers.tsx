interface PathCommandsObject {
  [key: string]: number[];
}

export const extractPathCommands = (pathString: string): PathCommandsObject => {
  const pathCommands: PathCommandsObject = {};

  const regex = /([a-df-zA-DF-Z])([^a-df-zA-DF-Z]*)/g;
  let match;
  while ((match = regex.exec(pathString)) !== null) {
    const [, command, paramsString] = match;
    const type = command;
    
    // Extract coordinates from the command
    const coords: number[] = paramsString.trim().split(/[ ,]+/).map(parseFloat);

    if (!pathCommands[type]) {
        pathCommands[type] = [];
    }
    pathCommands[type].push(...coords);
  }

  return pathCommands;
}

const pathCommandIndexes: { [key: string]: { x: number[], y: number[] } } = {
  "M": { x: [0], y: [1] },
  "L": { x: [0], y: [1] },
  "H": { x: [0], y: [] },
  "V": { x: [], y: [0] },
  "C": { x: [0, 2, 4], y: [1, 3, 5] },
  "S": { x: [0, 2], y: [1, 3] },
  "Q": { x: [0, 2], y: [1, 3] },
  "T": { x: [0], y: [1] },
  "A": { x: [5], y: [6] },
  "Z": { x: [], y: [] }
};

export const movePath = (pathString: string, dx: number, dy: number): string => {
  const pathCommands = extractPathCommands(pathString);
  const newPathString = Object.entries(pathCommands).map(([type, coords]) => {
    if (type.toUpperCase() === 'Z') return type;
    const indexes = pathCommandIndexes[type.toUpperCase()];
    const newCoords = coords.map((coord, i) => {
      if (indexes.x.includes(i)) {
        return coord + dx;
      } else if (indexes.y.includes(i)) {
        return coord + dy;
      } else {
        return coord;
      }
    });
    return type + newCoords.join(' ');
  }).join(' ');

  return newPathString;
}

export const getLowestXValue = (pathString: string): number => {
  const pathCommands = extractPathCommands(pathString);
  const xCoords = Object.entries(pathCommands).map(([type, coords]) => {
    if (type.toUpperCase() === 'Z') return 0;
    const indexes = pathCommandIndexes[type.toUpperCase()];
    return coords.filter((_, i) => indexes.x.includes(i));
  }).flat();
  return Math.min(...xCoords);
}

export const getLowestYValue = (pathString: string): number => {
  const pathCommands = extractPathCommands(pathString);
  const yCoords = Object.entries(pathCommands).map(([type, coords]) => {
    if (type.toUpperCase() === 'Z') return 0;
    const indexes = pathCommandIndexes[type.toUpperCase()];
    return coords.filter((_, i) => indexes.y.includes(i));
  }).flat();
  return Math.min(...yCoords);
}

export const getHighestXValue = (pathString: string): number => {
  const pathCommands = extractPathCommands(pathString);
  const xCoords = Object.entries(pathCommands).map(([type, coords]) => {
    if (type.toUpperCase() === 'Z') return 0;
    const indexes = pathCommandIndexes[type.toUpperCase()];
    return coords.filter((_, i) => indexes.x.includes(i));
  }).flat();
  return Math.max(...xCoords);
}

export const getHighestYValue = (pathString: string): number => {
  const pathCommands = extractPathCommands(pathString);
  const yCoords = Object.entries(pathCommands).map(([type, coords]) => {
    if (type.toUpperCase() === 'Z') return 0;
    const indexes = pathCommandIndexes[type.toUpperCase()];
    return coords.filter((_, i) => indexes.y.includes(i));
  }).flat();
  return Math.max(...yCoords);
}
