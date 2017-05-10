let Piece = require("./piece.js");

class Knight extends Piece {
	static get characters() { return ["♘", "♞"] };

	static canAdd(board, color) {
		console.log("filtered:", board.pickPieces(["color", color], ["type", Knight]));
	};
};

module.exports = Knight;
