let Board;

class Piece {
	constructor(board, color, position) {
		this.board = board;
		this.color = color;
		this.position = position;
	};

	get position() { return this._position };
	set position(to) { this._position = Board.parsePosition(to) };

	validMove(newPosition) {
		throw `validMove not implemented for ${this.constructor.name}`;
	};
	
	toString() {
		return this.constructor.characters[1];
	};

	/**
	 * Returns the piece at a given offset from this piece.
	 * @param {number} h - The number of spaces to the right.
	 * @param {number} v - The number of spaces up.
	 * @param {boolean} relative - If true, the offsets will be relative to the piece's point of view
	 * (up for white pieces, down for black pieces) — i.e., offsets will be negated for black pieces.
	 * @return {?Piece} The piece at that position if there is one, or null if none exists.
	 */
	offset(h, v, relative=true) {
		return this.board.pieceAt(this.offsetPosition(h, v, relative));
	};

	/**
	 * Returns this piece's position offset by a certain amount.
	 * @param {number} h - The horizontal offset.
	 * @param {number} v - The vertical offset.
	 * @param {boolean} relative - If true, the offsets will be relative to the piece's point of view
	 * (up for white pieces, down for black pieces) — i.e., offsets will be negated for black pieces.
	 * @return {number[]} The piece's position with the given offset added.
	 */
	offsetPosition(h, v, relative=true) {
		return this.position.map((n, i) => n + (relative && this.color == Board.Black? -1 : 1) * [h, v][i]);
	};

	/**
	 * Moves to a given position.
	 * @param {(string|number[]|Piece)} pos - A position parseable by Board.parsePosition.
	 * @param {number} conviction - How strongly you want to move the piece.
	 * 0: do nothing if there is any piece already at the position.
	 * 1: if there is a piece of the opposite color at the position, remove and replace it.
	 * 2: if there is a piece of any color at the position, remove and replace it.
	 * @return {boolean} true if the move succeeded; false otherwise.
	 */
	moveTo(pos, conviction=0) {
		let other;
		if ((other = this.board.pieceAt(pos)) && ((other.color != this.color && 0 < conviction) || conviction === 2)) {
			this.board.removePiece(other);
		} else if (other) {
			console.log(`Not moving ${this.constructor.name} at ${Board.formatPosition(this.position)} to`, Board.formatPosition(pos), conviction, this.position);
			return false;
		};

		console.log(`Moved ${this.constructor.name} at ${Board.formatPosition(this.position)} to`, Board.formatPosition(this.position = pos));
		return true;
	};

	get atBottom() { return (this.position[1] == 1 && this.color == Board.White) || (this.position[1] == 8 && this.color == Board.Black) };
	get atTop()    { return (this.position[1] == 1 && this.color == Board.Black) || (this.position[1] == 8 && this.color == Board.White) };
	get atLeft()   { return (this.position[0] == 1 && this.color == Board.White) || (this.position[0] == 8 && this.color == Board.Black) };
	get atRight()  { return (this.position[0] == 1 && this.color == Board.Black) || (this.position[0] == 8 && this.color == Board.White) };
};

module.exports = Piece;

let Knight = require("./knight.js"),
	Pawn = require("./pawn.js"),
	Rook = require("./rook.js"),
	Bishop = require("./bishop.js"),
	Queen = require("./queen.js"),
	King = require("./king.js");

module.exports.Piece = Piece;
module.exports.Knight = Knight;
module.exports.Pawn = Pawn;
module.exports.Rook = Rook;
module.exports.Bishop = Bishop;
module.exports.Queen = Queen;
module.exports.King = King;
module.exports.initAll = (board) => [Knight, Pawn, Rook, Bishop, Queen, King].forEach((p) => p.init && p.init(Board = board));
