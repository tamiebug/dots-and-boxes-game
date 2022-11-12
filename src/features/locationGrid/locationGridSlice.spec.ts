import locationGridReducer, {
  LocationGridState,
  attemptMove,
  initializeEmptyLocationGrid,
  Move

} from './locationGridSlice';

describe('locationGrid reducer', () => {
  const initialMove: Move = {
    orientation: "horizontal",
    topLeftX: 4,
    topLeftY: 3,
    player: "player1"
  };
  const initialState: LocationGridState = locationGridReducer(initializeEmptyLocationGrid(6), attemptMove(initialMove)); 
  
  it('should properly register move location', () => {
    expect(initialState.gridLocations[3][4].horizontalLine).toEqual("player1");
    expect(initialState.gridLocations[3][4].verticalLine).toEqual("nobody");
  });

  it('should not override moves', () => {
    const newState = locationGridReducer(initialState, attemptMove({...initialMove, player: "player2"}));
    expect(newState).toEqual(initialState);
  });

  it('should not accept horizontal move at right end of grid', () => {
    const move: Move = {
      orientation: "horizontal",
      topLeftX: 5,
      topLeftY: 3,
      player: "player1"
    };
    const newState = locationGridReducer(initialState, attemptMove(move));
    expect(newState).toEqual(initialState);
  });

  it('should not accept vertical move at bottom of grid', () => {
    const move: Move = {
      orientation: "vertical",
      topLeftX: 3,
      topLeftY: 5,
      player: "player1"
    };
    const newState = locationGridReducer(initialState, attemptMove(move));
    expect(newState).toEqual(initialState);
  });

  it('should not accept any moves in bottom-right corner of grid', () => {
    const emptyState = initializeEmptyLocationGrid(6);
    const move: Move = {
      orientation: "horizontal",
      topLeftX: 5,
      topLeftY: 5,
      player: "player1"
    };
    const newState = locationGridReducer(emptyState, attemptMove(move));
    expect(newState).toEqual(emptyState);

    const newestState = locationGridReducer(emptyState, attemptMove({... move, orientation: "vertical"}));
    expect(newestState).toEqual(emptyState);
  });

  it('should accept move in same location but diffrent orientation', () => {
    const move: Move = {...initialMove, orientation: "vertical"};
    const newState = locationGridReducer(initialState, attemptMove(move));
    expect(newState.gridLocations[move.topLeftY][move.topLeftX].verticalLine).toEqual("player1");
    expect(newState.gridLocations[move.topLeftY][move.topLeftX].horizontalLine).toEqual("player1");
  });
});