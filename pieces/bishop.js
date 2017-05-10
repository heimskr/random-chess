let Piece = require("./piece.js");

class Bishop extends Piece {
	static get characters() { return ["♗", "♝"] };
};

module.exports = Bishop;
