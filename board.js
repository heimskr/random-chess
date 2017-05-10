let _ = require("lodash"),
	chalk = require("chalk"),
	{ Piece, Knight, Pawn, Rook, Bishop, Queen, King } = require("./pieces/piece.js");

/*
A–H = 1–8.
Positions are represented as [column, row].
*/

class Board {
	static get White() { return Symbol.for("white") };
	static get Black() { return Symbol.for("black") };
	static get Colors() { return [Board.White, Board.Black] };

	constructor(pieces=[]) {
		this.pieces = pieces;
	};

	/**
	 * Removes all pieces from the board and adds the standard starting pieces.
	 */
	setBoard() {
		this.pieces = [];
		const symmetric = (piece, c, r) => {
			this.addPiece(piece, Board.White, [c, r]);
			this.addPiece(piece, Board.White, [9 - c, r]);
			this.addPiece(piece, Board.Black, [c, 9 - r]);
			this.addPiece(piece, Board.Black, [9 - c, 9 - r]);
		};

		_.range(1, 9).forEach((c) => [this.addPiece(Pawn, Board.White, [c, 2]), this.addPiece(Pawn, Board.Black, [c, 7])]);
		symmetric(Rook, 1, 1);
		symmetric(Knight, 2, 1);
		symmetric(Bishop, 3, 1);
		this.addPiece(King, Board.White, [4, 1]);
		this.addPiece(King, Board.Black, [4, 8]);
		this.addPiece(Queen, Board.White, [5, 1]);
		this.addPiece(Queen, Board.Black, [5, 8]);
	};

	/**
	 * Adds a piece to the board.
	 * @param {(Piece|class)} pieceType - A type of piece (a reference to a class extending Piece)
	 * @param {Color} color - The color of the piece.
	 * @param {number[]} pos - An array of two integers (see parsePosition) representing a position on the board.
	 * @throws Will throw an exception if the given position is invalid or already contains a piece, or if the color is invalid.
	 */
	addPiece(pieceType, color, pos) {
		if (pieceType instanceof Piece) {
			if (this.pieceAt(...pieceType.position)) {
				throw new Error(`A piece already exists at ${Board.formatPosition(pos)}.`);
			};

			this.pieces.push(pieceType);	
			return;
		};

		pos = Board.parsePosition(pos);
		if (!Board.validPosition(pos)) {
			throw new Error(`Invalid position: ${JSON.stringify(pos)}`);
		};

		if (this.pieceAt(...pos)) {
			throw new Error(`A piece already exists at ${Board.formatPosition(pos)}.`);
		};

		this.pieces.push(new pieceType(this, Board.getColor(color), pos));
	};

	/**
	 * Selects and returns a list of pieces on the board matching all of a given list of filters.
	 * @param {...string} filters - An array of filters like [type, filter], where type is either "color" or "piece",
	 *                              and filter is a color or a piece type.
	 * @return {Piece[]} An array of pieces matching the given filters.
	 */
	pickPieces(...filters) {
		let found = _.clone(this.pieces);
		_.forEach(filters, ([type, filter]) => {
			if (type == "color") {
				found = _.filter(found, (piece) => piece.isColor(filter));
			} else if (type == "piece") {
				found = _.filter(found, (piece) => piece instanceof filter);
			} else {
				throw `Unknown piece filter type: "${type}"`;
			};
		});

		return found;
	};

	/**
	 * Checks the board for duplicate pieces.
	 * @return {boolean} A boolean equal to false if the board contains any duplicate pieces or true otherwise.
	 */
	validate() {
		return _.uniqWith(this.pieces, (one, two) => _.isEqual(one.position, two.position)).length == this.pieces.length;
	};

	/**
	 * Checks whether there is a piece at the given location.
	 * @param {number} column - The column of the position to check.
	 * @param {number} row - The row of the position to check.
	 * @return {?Piece} The piece at the given location if one exists; null otherwise.
	 */
	pieceAt(column, row) {
		return this.pieces.filter(({ position }) => {
			return _.isEqual([column, row], position)
		})[0] || null;
	};

	/**
	 * Returns an ANSI rendering of the board.
	 * @return {string} A graphical representation of the board containing ANSI escapes and non-ASCII characters.
	 */
	toString() {
		return _.range(8, 0, -1).reduce((lines, r) => {
			const bg = (c) => `\u001b[48;5;${(r + c) % 2? 238 : 249 }m`;
			lines.push(`    ${_.range(1, 9).map((c) => `${bg(c)}      \u001b[0m`).join("")}`);
			lines.push(` ${r}  ${_.range(1, 9).map((c) => `${bg(c)}\u001b[38;2;${(this.pieceAt(c, r) || { }).color == Board.Black? "0;0;0" : "255;255;255"}m  ${(this.pieceAt(c, r) || " ").toString()}   \u001b[0m`).join("")}`);
			lines.push(`    ${_.range(1, 9).map((c) => `${bg(c)}      \u001b[0m`).join("")}`);
			return lines;
		}, ["", "      " + _.range(1, 9).map((c) => Board.formatPosition([c, 1])[0]).join("     "), ""]).join("\n");
	};

	/**
	 * Converts a variety of representations into a Symbol representing a color.
	 * @param {(Symbol|number|string)} color - The color to convert to a symbol.
	 * @return {Symbol} The symbol representing the color.
	 */
	static getColor(color) {
		if (_.includes(Board.Colors, color)) {
			return color;
		};

		if (typeof color == "number") {
			return Board.Colors[color];
		};

		if (typeof color == "string") {
			if (color.match(/^w(hite)?$/i)) {
				return Board.White;
			};

			if (color.match(/^b(lack)?$/i)) {
				return Board.Black;
			};
		};

		throw `Unable to parse "${color}" as a color.`;
	};

	/**
	 * Parses a position.
	 * @param {(string[]|string)} pos - A value like "A4", "14", ["A", "4"] or ["1", "4"].
	 * @return {number[]} An array containing the column and row of the position as numbers from 1 to 8.
	 */
	static parsePosition(pos) {
		if (typeof pos == "string") {
			if (pos.match(/^[a-h][1-8]$/i)) {
				return ["abcdefgh".split("").indexOf(pos[0].toLowerCase()) + 1, parseInt(pos[1])];
			};

			if (pos.match(/^[1-8]{2}$/)) {
				return pos.split("").map(n => parseInt(n));
			};
		} else if (pos instanceof Array) {
			return Board.parsePosition(pos.join(""));
		};

		throw "Unable to parse the given position.";
	};

	/**
	 * Checks whether a given position is inside the board and not in the extratabular void.
	 * @param ({string[]|string}) pos - A position parseable by parsePosition().
	 */
	static validPosition(pos) {
		return _.every(Board.parsePosition(pos), (n) => _.inRange(n, 1, 9));
	};

	/**
	 * Turns a position into a string in the standard letter-number form.
	 * @param {number[]} pos - The position to format.
	 * @return {string} A nicely formatted string.
	 */
	static formatPosition(pos) {
		return String.fromCharCode("A".charCodeAt(0) + pos[0] - 1) + pos[1];
	};
};

module.exports = Board;
