import React, { useState, ReactElement, MouseEvent } from 'react';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { attemptMove, selectLocationGrid, LocationState } from './locationGridSlice';
import './LocationGrid.css';

export function LocationGrid() {
  const locationGrid = useAppSelector(selectLocationGrid);
  const [mouseLastHeldDownAt, setMouseLastHeldDownAt] = useState<[number, number] | null>(null)

  const dispatch = useAppDispatch();

  function createMouseEventHandler(type: 'up'|'down', x: number, y: number) {
    if( type === 'down' ) {
      return function handleMouseDownEvent(e: MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        setMouseLastHeldDownAt([x, y]);
      }
    }
    else if ( type === 'up' ) {
      return function handleMouseUpEvent(e: MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        if (!mouseLastHeldDownAt) return;

        const taxicabDistance = Math.abs(x - mouseLastHeldDownAt[0]) + Math.abs(y - mouseLastHeldDownAt[1]);
        if (taxicabDistance === 1) {
          const orientation = x - mouseLastHeldDownAt[0] === 0 ? 'vertical' : 'horizontal';
          const [topLeftX, topLeftY] = [Math.min(x, mouseLastHeldDownAt[0]), Math.min(y, mouseLastHeldDownAt[1])];
          dispatch(attemptMove({orientation, topLeftX, topLeftY, player: "player1"}));
          setMouseLastHeldDownAt(null);
        } 
      }
    }
  }

  return (
    <div className="dotsGrid" data-testid="DotsGrid">
      {[...Array(locationGrid.size)].map( (_, y) => 
        <div className="dotsGridRow" key={y}>
          {[...Array(locationGrid.size)].map( (_, x) => returnLocationStateHTML(locationGrid.gridLocations[y][x], x, y, locationGrid.size, createMouseEventHandler))}
        </div>
      )}
    </div>
  )
}

type mouseEventHandlerCreatorType = (type: 'up'|'down', x: number, y: number) => ((event: MouseEvent<HTMLDivElement>) => void) | undefined;
function returnLocationStateHTML(locationState: LocationState, x: number, y: number, boardSize: number, mouseEventHandlerCreator: mouseEventHandlerCreatorType): ReactElement {

  function createSelectionArea(x: number, y: number, key: number = 5, additionalClasses: string[] = []): ReactElement {
    return <div className={ ["dotSelectionArea"].concat(additionalClasses).join(' ') }
      onDragStart={ e => e.preventDefault() } 
      onMouseDown={ mouseEventHandlerCreator('down', x, y) }
      onMouseUp={ mouseEventHandlerCreator('up', x, y) }
      key={ key }
      data-testid={`clickArea[${[x,y]}]`}/> 
  }

  let children: ReactElement[] = [<span className="dot" key={0} onDragStart={ e => e.preventDefault() } data-testid={`dot[${[x,y]}]`}/>];

  /* NOTE: Last row and column of dotsGridLocation's are sized differently by CSS for the sake of layout calcs
   * However, this also affects the sizes of the dotSelectionArea's.  Hence, the second-to-last row & columns,
   * which are normally sized, will also contain the dotSelectionAreas for the last row/column, translated over
   * so that they are properly placed, through the use of the classes nextOneRight and nextOneDown.
   */

  if (x < (boardSize - 1) && y < (boardSize - 1)) {
    children.push(createSelectionArea(x, y));
    if (x === (boardSize - 2) && y === (boardSize - 2)) children.push(createSelectionArea(x+1, y+1, 6, ['nextOneRight', 'nextOneDown']));
    if (x === (boardSize - 2)) children.push(createSelectionArea(x+1, y  , 7, ['nextOneRight']));
    if (y === (boardSize - 2)) children.push(createSelectionArea(x  , y+1, 8, ['nextOneDown']));
  }
  
  if ( locationState.horizontalLine === 'player1') {
    children.push(<div className="horizontalMove player1" key={1}></div>);
  } else if ( locationState.horizontalLine === 'player2') {
    children.push(<div className="horizontalMove player2" key={2}></div>);
  }

  if ( locationState.verticalLine === 'player1') {
    children.push(<div className="verticalMove player1" key={3}></div>);
  } else if ( locationState.verticalLine === 'player2' ) {
    children.push(<div className="verticalMove player2" key={4}></div>)
  }

  return React.createElement(
    'div', 
    {'className' : "dotsGridLocation player1", 'key': x, 'data-testid': `location[${x},${y}]`}, 
    [...children]
  );
}