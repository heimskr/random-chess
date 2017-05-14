let Board;

class Piece {
	constructor(board, color, position) {
		this.board = board;
		this.color = color;
		this.position = position;
	};

	get position() { return this._position };
	set position(to) { this._position = Board.parsePosition(to) };

	/**
	 * Returns an array of valid moves for this piece. A move is a 3-array: the first two elements
	 * are the x and y coordinate of the possible move, and the third is a reference to any capturable
	 * piece that may be in that spot (always of a different color!), or null if the spot is empty.
	 * @return {{0: number, 1: number, 2: ?Piece}[]} The array of valid moves.
	 */
	moves() {
		throw new Error(`moves() not implemented for ${this.name}.`);
	};

	/**
	 * Returns the piece at a given offset from this piece.
	 * @param {number} h - The number of spaces to the right.
	 * @param {number} v - The number of spaces up.
	 * @param {boolean} [relative=false] - If true, the offsets will be relative to the piece's point of view
	 * (up for white pieces, down for black pieces) — i.e., offsets will be negated for black pieces.
	 * @return {?Piece} The piece at that position if there is one, or null if none exists.
	 */
	offset(h, v, relative=false) {
		return this.board.pieceAt(this.offsetPosition(h, v, relative));
	};

	/**
	 * Returns this piece's position offset by a certain amount.
	 * @param {number} h - The horizontal offset.
	 * @param {number} v - The vertical offset.
	 * @param {boolean} [relative=false] - If true, the offsets will be relative to the piece's point of view
	 * (up for white pieces, down for black pieces) — i.e., offsets will be negated for black pieces.
	 * @return {?number[]} The piece's position with the given offset added, or null if the position is outside the board.
	 */
	offsetPosition(h, v, relative=false) {
		const position = this.position.map((n, i) => n + (relative && this.color == Board.Black? -1 : 1) * [h, v][i]);
		return Board.validPosition(position)? position : null;
	};

	/**
	 * Moves to a given position.
	 * @param {(string|number[]|Piece)} pos - A position parseable by Board.parsePosition.
	 * @param {number} [conviction=0] - How strongly you want to move the piece.
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
			console.log(`Not moving ${this.name} at ${Board.formatPosition(this.position)} to ${Board.formatPosition(pos)}.`);
			return false;
		};

		console.log(`Moved ${this.name} at ${Board.formatPosition(this.position)} to ${Board.formatPosition(this.position = pos)}.`);
		return true;
	};

	/**
	 * Returns all the moves a rook could make.
	 * @return {{0: number, 1: number, 2: ?Piece}[]} The array of valid moves.
	 */
	straightMoves() {
		const out = [], add = (position, piece=null) => position !== null && out.push([...position, piece, this]);
		let other;

		const line = (index, condition, direction) => {
			let position;
			for (let c = this.position[index] + direction; condition(c); c += direction) {
				position = index? [this.x, c] : [c, this.y];
				if ((other = this.board.pieceAt(position)) && other.color != this.color) {
					add(other.position, other);
				} else if (!other) {
					add(position);
					continue;
				};

				break;
			};
		};

		line(0, (x) => x <= 8,  1); // right
		line(1, (y) => y <= 8,  1); // up
		line(0, (x) => 1 <= x, -1); // left
		line(1, (y) => 1 <= y, -1); // down

		return out;
	};

	/**
	 * Returns all the moves a bishop could make.
	 * @return {{0: number, 1: number, 2: ?Piece}[]} The array of valid moves.
	 */
	diagonalMoves() {
		let x, y, other, out = [];

		const check = (x, y) => {
			if (other = this.board.pieceAt([x, y])) {
				if (other.color != this.color) {
					out.push([x, y, other, this]);
				};

				return true;
			};

			out.push([x, y, null, this]);
			return false;
		};


		// Up and to the left.
		for ([x, y] = [this.x - 1, this.y + 1]; 1 <= x && y <= 8; x--, y++) {
			if (check(x, y)) {
				break;
			};
		};

		// Up and to the right.
		for ([x, y] = [this.x + 1, this.y + 1]; x <= 8 && y <= 8; x++, y++) {
			if (check(x, y)) {
				break;
			};
		};

		// Down and to the left.
		for ([x, y] = [this.x - 1, this.y - 1]; 1 <= x && 1 <= y; x--, y--) {
			if (check(x, y)) {
				break;
			};
		};

		// Down and to the right.
		for ([x, y] = [this.x + 1, this.y - 1]; x <= 8 && 1 <= y; x++, y--) {
			if (check(x, y)) {
				break;
			};
		};

		return out;
	};

	/**
	 * Removes this piece from its parent board.
	 */
	remove() {
		this.board.pieces = this.board.pieces.filter((p) => p != this);
		this.board = this._position = this.color = null;
	};

	/**
	 * Turns this piece into a different type.
	 * This is done by removing the piece and adding a new one of the given type.
	 * @param {(Piece|class)} newType - The type of piece for the replacement.
	 * @return {Piece} The new piece.
	 */
	morph(newType) {
		if (newType instanceof Piece) {
			newType = newType.constructor;
		};

		const newPiece = new newType(this.board, this.color, this.position);
		this.remove();
		newPiece.board.addPiece(newPiece);
		return newPiece;
	};
	
	/**
	 * Returns a Unicode character symbolizing this piece.
	 */
	toString() {
		return this.constructor.characters[1];
	};

	/**
	 * Nicely formats this piece's position.
	 * @return {string} A string like "B4" representing this piece's position on the board.
	 */
	formatPosition() {
		return Board.formatPosition(this.position);
	};

	/**
	 * Returns a clone of this piece.
	 * @param {Board} [newBoard] - A parent board for the cloned piece.
	 * @return {Piece} A new Piece with the same information.
	 */
	clone(newBoard) {
		const board = newBoard || this.board;
		return new this.constructor(board, this.color, [...this.position]);
	};

	get colorName() { return Board.formatColor(this.color) };
	get ColorName() { return Board.formatColor(this.color).replace(/^(\w)/, ($0, $1) => $1.toUpperCase()) };
	get Name() { return this.constructor.name };
	get name() { return this.constructor.name.toLowerCase() };

	get x() { return this.position[0] };
	get y() { return this.position[1] };
	set x(to) { this.position[0] = to };
	set y(to) { this.position[1] = to };

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
