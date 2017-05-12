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
	 * @param {number[]} position - An array of two integers (see parsePosition) representing a position on the board.
	 * @return {Piece} The piece added to the board.
	 * @throws Will throw an exception if the given position is invalid or already contains a piece, or if the color is invalid.
	 */
	addPiece(pieceType, color, position) {
		if (pieceType instanceof Piece) {
			if (this.pieceAt(pieceType.position)) {
				throw new Error(`A piece already exists at ${Board.formatPosition(position)}.`);
			};

			this.pieces.push(pieceType);	
			return pieceType;
		};

		position = Board.parsePosition(position);
		if (!Board.validPosition(position)) {
			throw new Error(`Invalid position: ${JSON.stringify(position)}`);
		};

		if (this.pieceAt(position)) {
			throw new Error(`A piece already exists at ${Board.formatPosition(position)}.`);
		};

		const piece = new pieceType(this, Board.getColor(color), position);
		this.pieces.push(piece);
		return piece;
	};

	/**
	 * Selects and returns a list of pieces on the board matching all of a given list of filters.
	 * @param {...string} filters - An array of filters like [type, filter], where type is either "color" or "piece",
	 *                              and filter is a color or a piece type.
	 * @return {Piece[]} An array of pieces matching the given filters.
	 * @throws Will throw an exception if given an unrecognized filter.
	 */
	pickPieces(...filters) {
		let found = _.clone(this.pieces);
		_.forEach(filters, ([type, filter]) => {
			if (type == "color") {
				found = _.filter(found, (piece) => piece.isColor(filter));
			} else if (type == "piece") {
				found = _.filter(found, (piece) => piece instanceof filter);
			} else {
				throw new Error(`Unknown piece filter type: "${type}"`);
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
	 * @param {(string|number[])} pos - A position parseable by Board.parsePosition.
	 * @return {?Piece} The piece at the given location if one exists; null otherwise.
	 */
	pieceAt(position) {
		position = Board.parsePosition(position);
		return this.pieces.filter((piece) => _.isEqual(piece.position, position))[0] || null;
	};

	/**
	 * Removes a given piece.
	 * @param {Piece} piece - The piece to remove.
	 */
	removePiece(piece) {
		piece.board = piece.position = piece.color = null;
		this.pieces = this.pieces.filter((p) => p != piece);
	};

	/**
	 * Returns an ANSI rendering of the board.
	 * @param {number} dim - The dimming factor for the square colors (0–23).
	 * @param {boolean} showPositions - Whether to positions on each square.
	 * @return {string} A graphical representation of the board containing ANSI escapes and non-ASCII characters.
	 */
	toString(dim=4, showPositions=false) {
		return _.range(8, 0, -1).reduce((lines, r) => {
			const bg = (c) => `\u001b[48;5;${(r + c) % 2? 232 + dim : 255 - dim}m`;
			const fg = (c, o=4) => `\u001b[38;5;${(r + c) % 2? 232 + (dim + o) : 255 - (dim + o)}m`;
			lines.push(`    ${_.range(1, 9).map((c) => `${bg(c)+fg(c)}${showPositions? Board.formatPosition([c, r]): "  "}    \u001b[0m`).join("")}`);
			lines.push(` ${r}  ${_.range(1, 9).map((c) => `${bg(c)}\u001b[38;2;${(this.pieceAt([c, r]) || { }).color == Board.Black? "0;0;0" : "255;255;255"}m  ${(this.pieceAt([c, r]) || " ").toString()}   \u001b[0m`).join("")}`);
			lines.push(`    ${_.range(1, 9).map((c) => `${bg(c)}      \u001b[0m`).join("")}`);
			return lines;
		}, ["", "      " + _.range(1, 9).map((c) => Board.formatPosition([c, 1])[0]).join("     "), ""]).join("\n");
	};

	/**
	 * Converts a variety of representations into a Symbol representing a color.
	 * @param {(Symbol|number|string|Piece)} color - The color to convert to a symbol.
	 * @return {Symbol} The symbol representing the color.
	 * @throws Will throw an exception if the given color is invalid.
	 */
	static getColor(color) {
		if (color instanceof Piece) {
			return color.color;
		};

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

		throw new Error(`Unable to parse "${color}" as a color.`);
	};

	/**
	 * Parses a position.
	 * @param {(string[]|string|Piece)} position - A value like "A4", "14", ["A", "4"] or ["1", "4"], or a piece.
	 * @return {number[]} An array containing the column and row of the position as numbers from 1 to 8.
	 * @throws Will throw an exception if the given position is invalid.
	 */
	static parsePosition(position) {
		if (position instanceof Piece) {
			return position.position;
		};

		if (typeof position == "string") {
			if (position.match(/^[a-h][1-8]$/i)) {
				return ["abcdefgh".split("").indexOf(position[0].toLowerCase()) + 1, parseInt(position[1])];
			};

			if (position.match(/^[1-8]{2}$/)) {
				return position.split("").map(n => parseInt(n));
			};
		} else if (position instanceof Array) {
			return Board.parsePosition(position.join(""));
		};

		throw new Error(`Unable to parse the given position (${JSON.stringify(position)}).`);
	};

	/**
	 * Checks whether a given position is inside the board and not in the extratabular void.
	 * @param ({string[]|string}) position - A position parseable by parsePosition().
	 * @throws Will throw an exception if the given position is unparseable.
	 */
	static validPosition(position) {
		return _.every(Board.parsePosition(position), (n) => _.inRange(n, 1, 9));
	};

	/**
	 * Turns a position into a string in the standard letter-number form.
	 * @param {(string|number[]|Piece)} pos - A position parseable by Board.parsePosition.
	 * @return {string} A nicely formatted string.
	 * @throws Will throw an exception if the given position is unparseable.
	 */
	static formatPosition(position) {
		position = Board.parsePosition(position);
		return String.fromCharCode("A".charCodeAt(0) + position[0] - 1) + position[1];
	};

	/**
	 * Turns a color into a string representing that color.
	 * @param {(Symbol|number|string|Piece)} color - A value parseable by getColor().
	 * @return {string} Either "black" or "white".
	 * @throws Will throw an exception if the given color is invalid.
	 */
	static formatColor(color) {
		return Board.getColor(color) == Board.Black? "black" : "white";
	};
};

Piece.initAll(module.exports = Board);
