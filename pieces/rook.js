let Piece = require("./piece.js");

class Rook extends Piece {
	static get characters() { return ["♖", "♜"] };
};

module.exports = Rook;
