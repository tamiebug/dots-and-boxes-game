import React, { useState, ReactElement, MouseEvent } from 'react';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { attemptMove, selectLocationGrid, LocationState } from './locationGridSlice';
import './LocationGrid.css';

interface LocationGridConfigs {
  dotRadiusInPx: number;
  dotsLocationSizeInPx: number;
  dotClickThresholdRatio: number;
};

export function LocationGrid(props: LocationGridConfigs) {
  const locationGrid = useAppSelector(selectLocationGrid);
  const [mouseLastHeldDownAt, setMouseLastHeldDownAt] = useState<[number, number] | null>(null)

  const dispatch = useAppDispatch();

  function handleMouseUpEvent(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!mouseLastHeldDownAt) return;

    const coords = targetCoordinatesFromEvent(e);
    const newLocation = mapCoordToGridLocation(props, locationGrid.size, coords);
    if (!newLocation) {
      setMouseLastHeldDownAt(null);
      return;
    }

    const taxicabDistance = Math.abs(newLocation[0]-mouseLastHeldDownAt[0]) + Math.abs(newLocation[1]-mouseLastHeldDownAt[1]);
    if (taxicabDistance === 1.0) {
      const orientation = newLocation[0]-mouseLastHeldDownAt[0] === 0 ? 'vertical' : 'horizontal';
      const [topLeftX, topLeftY] = [Math.min(newLocation[0], mouseLastHeldDownAt[0]), Math.min(newLocation[1], mouseLastHeldDownAt[1])];
      dispatch(attemptMove({orientation , topLeftX, topLeftY, player: "player1"}));
    }
    setMouseLastHeldDownAt(null);
  } 

  function handleMouseDownEvent(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    if (mouseLastHeldDownAt) return;
   
    const coords = targetCoordinatesFromEvent(e);
    setMouseLastHeldDownAt( mapCoordToGridLocation(props, locationGrid.size, coords) );
  }
  
  return (
    <div className="dotsGrid" style={returnDotsGridStyle(props, locationGrid.size)} onMouseDown={handleMouseDownEvent} onMouseUp={handleMouseUpEvent} data-testid="DotsGrid">
      {[...Array(locationGrid.size)].map( (_, y) => 
        <div className="dotsGridRow" key={y}>
          {[...Array(locationGrid.size)].map( (_, x) => returnLocationStateHTML(locationGrid.gridLocations[y][x], x, y))}
        </div>
      )}
    </div>
  )
}

function returnDotsGridStyle(props: LocationGridConfigs, numberDots: number) {
  return {
    "--dot-radius": `${props.dotRadiusInPx}px`,
    "--move-dot-size-ratio": '0.5',
    "--number-dots": `${numberDots}`,
    "--dots-grid-size": `${props.dotsLocationSizeInPx}px`,
    "--dots-grid-separation": `${getDotsSeparationInPx(props, numberDots)}px`
  } as React.CSSProperties;
}

function returnLocationStateHTML(locationState: LocationState, x: number, y: number): ReactElement {
  let children: ReactElement[] = [<span className="dot" key={0} data-testid={`dot[${[x,y]}]`}></span>];
  
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

  return React.createElement('div', 
                             {'className' : "dotsGridLocation player1", 'key': x, 'data-testid': `location[${x},${y}]`}, 
                             [...children]);
}

function targetCoordinatesFromEvent(e: MouseEvent<HTMLDivElement>): [number, number]{
  const boundingRect = e.currentTarget.getBoundingClientRect();
  return [e.clientX - boundingRect.left, e.clientY - boundingRect.top];
}

function mapCoordToGridLocation(props: LocationGridConfigs, dotsGridSizeInDots: number, coords: [number, number] | null ): [number, number] | null {
  if (!coords) return null;

  const dotsSeparation = getDotsSeparationInPx(props, dotsGridSizeInDots);
  let nearestDotCol = Math.round(( coords[0]-props.dotRadiusInPx ) / dotsSeparation);
  let nearestDotRow = Math.round(( coords[1]-props.dotRadiusInPx ) / dotsSeparation);

  // Clamp so coordinate given is within bounds ( should be the case automatically, but in case it isn't )
  nearestDotCol = Math.max( 0, Math.min( nearestDotCol, dotsGridSizeInDots ));
  nearestDotRow = Math.max( 0, Math.min( nearestDotRow, dotsGridSizeInDots ));

  const distance = Math.sqrt( (nearestDotCol*dotsSeparation - coords[0])**2 + (nearestDotRow*dotsSeparation - coords[1])**2 );
  if ( distance < props.dotClickThresholdRatio*dotsSeparation ) return [nearestDotCol, nearestDotRow];
  else return null;
}

function getDotsSeparationInPx(props: LocationGridConfigs, dotsGridSizeInDots: number): number {
  return (props.dotsLocationSizeInPx - 2*props.dotRadiusInPx) / dotsGridSizeInDots;
}