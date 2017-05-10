let Board;

class Piece {
	constructor(board, color, position) {
		this.board = board;
		this.color = color;
		this.position = position;
	};

	validMove(newPosition) {
		throw `validMove not implemented for ${this.constructor.name}`;
	};
	
	toString() {
		return this.atRight? "\u2714" : "\u2718";
		return this.constructor.characters[1];
	};

	get atBottom() {
		return (this.position[1] == 1 && this.color == Board.White) || (this.position[1] == 8 && this.color == Board.Black);
	};

	get atTop() {
		return (this.position[1] == 1 && this.color == Board.Black) || (this.position[1] == 8 && this.color == Board.White);
	};

	get atLeft() {
		return (this.position[0] == 1 && this.color == Board.White) || (this.position[0] == 8 && this.color == Board.Black);
	};

	get atRight() {
		return (this.position[0] == 1 && this.color == Board.Black) || (this.position[0] == 8 && this.color == Board.White);
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
module.exports.init = (board) => Board = board;