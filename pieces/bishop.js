let Piece = require("./piece.js");

class Bishop extends Piece {
	static get characters() { return ["♗", "♝"] };

	moves() {
		return this.diagonalMoves();
	};
};

module.exports = Bishop;
