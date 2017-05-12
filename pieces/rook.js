let Piece = require("./piece.js");

class Rook extends Piece {
	static get characters() { return ["♖", "♜"] };

	moves() {
		return this.straightMoves();
	};
};

module.exports = Rook;
