class Board {
  radius = -600;
  dimensions = {
    min: {
      x: -100,
      y: 50,
    },
    max: {
      x: 0, // -20
      y: 190,
    },
  };
}

Board.shared = new Board();

export default Board;
