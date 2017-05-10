let Piece = require("./piece.js");

class Queen extends Piece {
	static get characters() { return ["♕", "♛"] };
};

module.exports = Queen;
