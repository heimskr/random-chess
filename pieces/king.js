let Piece = require("./piece.js");

class King extends Piece {
	static get characters() { return ["♔", "♚"] };
};

module.exports = King;
