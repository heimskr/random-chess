let Piece = require("./piece.js");

class Pawn extends Piece {
	static get characters() { return ["♙", "♟"] };
};

module.exports = Pawn;
