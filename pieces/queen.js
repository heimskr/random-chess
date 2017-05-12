let Piece = require("./piece.js");

class Queen extends Piece {
	static get characters() { return ["♕", "♛"] };

	moves() {
		return [...this.straightMoves(), ...this.diagonalMoves()];
	};
};

module.exports = Queen;
