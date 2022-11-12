import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
export type OwnershipState = "nobody" | "player1" | "player2";

export interface Move {
  orientation: "horizontal" | "vertical";
  topLeftX: number;
  topLeftY: number;
  player: "player1" | "player2";
}

export interface LocationState {
  horizontalLine: OwnershipState, // Which player ( if any ) has moved horizontally here with left endpoint at this location
  verticalLine: OwnershipState,   // Which player ( if any ) has moved vertically here with top endpoint at this location 
  wholeBox: OwnershipState        // Which player ( if any ) owns square with top left-most corner at this location
}

export interface LocationGridState {
  size: number;
  gridLocations: LocationState[][];
}

const initialState: LocationGridState = initializeEmptyLocationGrid(5);

export const locationGridSlice = createSlice({
  name: "locationGrid",
  initialState,
  reducers: {
    attemptMove: (state, action: PayloadAction<Move>) => {
      const move = action.payload;
      if (!isValidMove(state.size, move)) return state;

      // Note, that Immer is implicitly used in createSlice; a Proxy for the state is being modified here, not the actual state
      const location = state.gridLocations[move.topLeftY][move.topLeftX];
      if (move.orientation === "horizontal") {
        if (location.horizontalLine === "nobody") {
          location.horizontalLine = move.player;
        }
      } else {
        if (location.verticalLine === "nobody") {
          location.verticalLine = move.player;
        }
      }
    },
  },
});

export const { attemptMove } = locationGridSlice.actions;
export const selectLocationGrid = (state: RootState) => state.locationGrid;

function isValidMove(size: number, move: Move ): boolean {
  if (move.topLeftX < 0 || move.topLeftY < 0 || !Number.isInteger(move.topLeftX) || !Number.isInteger(move.topLeftY))
    return false;

  if (move.orientation === "horizontal") {
    return move.topLeftX <= size-2 && move.topLeftY <= size-1;
  } else { 
    return move.topLeftX <= size-1 && move.topLeftY <= size-2;
  }
}

export function initializeEmptyLocationGrid(sizeInDots: number): LocationGridState {
  return {
    size: sizeInDots,
    gridLocations: Array<Array<LocationState>>(sizeInDots).fill(
                    Array<LocationState>(sizeInDots).fill({ 
                      horizontalLine: 'nobody', verticalLine: 'nobody', wholeBox: 'nobody'}))
  }
}

export default locationGridSlice.reducer;