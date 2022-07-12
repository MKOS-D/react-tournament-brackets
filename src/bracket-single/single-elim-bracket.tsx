import React, { Fragment } from 'react';
import { ThemeProvider } from 'styled-components';
import { sortAlphanumerically } from 'Utils/string';
import {
  calculateSVGDimensions,
  sumRank as sunRanks,
} from 'Core/calculate-svg-dimensions';
import { MatchContextProvider } from 'Core/match-context';
import MatchWrapper from 'Core/match-wrapper';
import RoundHeader from 'Components/round-header';
import { getPreviousMatches } from 'Core/match-functions';
import { SingleElimLeaderboardProps } from '../types';
import { defaultStyle, getCalculatedStyles } from '../settings';
import { calculatePositionOfMatch } from './calculate-match-position';

import Connectors from './connectors';
import defaultTheme from '../themes/themes';

const SingleEliminationBracket = ({
  matches,
  matchComponent,
  currentRound,
  onMatchClick,
  onPartyClick,
  svgWrapper: SvgWrapper = ({ children }) => <div>{children}</div>,
  theme = defaultTheme,
  options: { style: inputStyle } = {
    style: defaultStyle,
  },
}: SingleElimLeaderboardProps) => {
  const style = {
    ...defaultStyle,
    ...inputStyle,
    roundHeader: {
      ...defaultStyle.roundHeader,
      ...inputStyle.roundHeader,
    },
    lineInfo: {
      ...defaultStyle.lineInfo,
      ...inputStyle.lineInfo,
    },
  };

  const { roundHeader, columnWidth, canvasPadding, rowHeight, width } =
    getCalculatedStyles(style);

  const lastGame = matches.find(
    match => !match.nextMatchId && !match.is3rdGame
  );

  const is3rdGame = matches.find(match => match.is3rdGame);

  const generateColumn = matchesColumn => {
    const previousMatchesColumn = matchesColumn.reduce((result, match) => {
      return [
        ...result,
        ...matches
          .filter(m => m.nextMatchId === match.id)
          .sort((a, b) => sortAlphanumerically(a.name, b.name)),
      ];
    }, []);

    if (previousMatchesColumn.length > 0) {
      return [...generateColumn(previousMatchesColumn), previousMatchesColumn];
    }
    return [previousMatchesColumn];
  };
  const generate2DBracketArray = final => {
    if (!final) return [];

    const finalRound = [final];

    if (is3rdGame) {
      finalRound.push(is3rdGame);
    }

    return [...generateColumn([final]), finalRound].filter(
      arr => arr.length > 0
    );
  };
  const columns = generate2DBracketArray(lastGame);
  // [
  //   [ First column ]
  //   [ 2nd column ]
  //   [ 3rd column ]
  //   [ lastGame ]
  // ]
  const maxHeight = Math.max(
    ...columns.map((row, index) => 2 ** index * row.length)
  );

  const maxWidth = columns.length;

  const sumRank = sunRanks(columns);

  const { gameWidth, gameHeight, startPosition } = calculateSVGDimensions(
    maxHeight,
    maxWidth,
    rowHeight,
    columnWidth,
    canvasPadding,
    roundHeader,
    currentRound
  );

  return (
    <ThemeProvider theme={theme}>
      <SvgWrapper
        bracketWidth={gameWidth}
        bracketHeight={gameHeight}
        startAt={startPosition}
      >
        <svg
          height={gameHeight}
          width={gameWidth}
          viewBox={`0 0 ${gameWidth} ${gameHeight}`}
        >
          <MatchContextProvider>
            <g>
              {columns.map((matchesColumn, columnIndex) =>
                matchesColumn.map((match, rowIndex) => {
                  const rowIndexCal = match.is3rdGame ? rowIndex - 1 : rowIndex;
                  const { x, y } = calculatePositionOfMatch(
                    rowIndexCal,
                    columnIndex,
                    {
                      canvasPadding,
                      columnWidth,
                      rowHeight,
                    }
                  );
                  const previousBottomPosition = (rowIndex + 1) * 2 - 1;

                  const { previousTopMatch, previousBottomMatch } =
                    getPreviousMatches(
                      columnIndex,
                      columns,
                      previousBottomPosition
                    );

                  const Y =
                    y +
                    (roundHeader.isShown
                      ? roundHeader.height + roundHeader.marginBottom
                      : 0);

                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Fragment key={`${match.id}-${columnIndex}-${rowIndex}`}>
                      {roundHeader.isShown && (
                        <RoundHeader
                          x={x}
                          roundHeader={roundHeader}
                          canvasPadding={canvasPadding}
                          width={width}
                          numOfRounds={columns.length}
                          tournamentRoundText={match.tournamentRoundText}
                          columnIndex={columnIndex}
                        />
                      )}
                      {columnIndex !== 0 && (
                        <Connectors
                          {...{
                            bracketSnippet: {
                              currentMatch: match,
                              previousTopMatch,
                              previousBottomMatch,
                            },
                            rowIndex,
                            columnIndex,
                            gameHeight,
                            gameWidth,
                            style,
                          }}
                        />
                      )}
                      <g>
                        <MatchWrapper
                          x={!match.is3rdGame ? x : x + 30}
                          y={
                            !match.is3rdGame
                              ? Y
                              : Y + style.boxHeight + style.spaceBetweenRows
                          }
                          rowIndex={rowIndex}
                          columnIndex={columnIndex}
                          match={match}
                          previousBottomMatch={previousBottomMatch}
                          topText={match.startTime}
                          bottomText={match.name}
                          teams={match.participants}
                          onMatchClick={onMatchClick}
                          onPartyClick={onPartyClick}
                          style={style}
                          matchComponent={matchComponent}
                          matchesColumn={matchesColumn.length}
                          sumRank={sumRank}
                        />
                      </g>
                    </Fragment>
                  );
                })
              )}
            </g>
          </MatchContextProvider>
        </svg>
      </SvgWrapper>
    </ThemeProvider>
  );
};

export default SingleEliminationBracket;
