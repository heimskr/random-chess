class Piece {
	constructor(board, color, position) {
		this.board = board;
		this.color = color;
		this.position = position;
	};

	isColor(color) {
		return this.color == color;
	};

	validMove(newPosition) {
		throw `validMove not implemented for ${this.constructor.name}`;
	};

	static canAdd(board, color) {

	};
	
	toString() {
		return this.constructor.characters[1];
	};
};

module.exports = Piece;
module.exports.Piece = Piece;
module.exports.Knight = require("./knight.js");
module.exports.Pawn = require("./pawn.js");
module.exports.Rook = require("./rook.js");
module.exports.Bishop = require("./bishop.js");
module.exports.Queen = require("./queen.js");
module.exports.King = require("./king.js");
