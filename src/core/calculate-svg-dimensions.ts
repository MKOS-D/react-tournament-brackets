export function calculateSVGDimensions(
  numOfRows,
  numOfColumns,
  rowHeight: any,
  columnWidth: any,
  canvasPadding: any,
  roundHeader: any,
  currentRound: string = ''
) {
  const bracketHeight = numOfRows * rowHeight;
  const bracketWidth = numOfColumns * columnWidth;

  const gameHeight =
    bracketHeight +
    canvasPadding * 2 +
    (roundHeader.isShown ? roundHeader.height + roundHeader.marginBottom : 0);
  const gameWidth = bracketWidth + canvasPadding * 2;
  const startPosition = [
    currentRound
      ? -(parseInt(currentRound, 10) * columnWidth - canvasPadding * 2)
      : 0,
    0,
  ];
  return { gameWidth, gameHeight, startPosition };
}

export function sumRank(columns: any[]) {
  const arrLength = columns.map(row => row.length);
  arrLength.forEach((e, index) => {
    if (index !== 0) {
      arrLength[index] = e + arrLength[index - 1];
    }
  });
  return arrLength;
}
