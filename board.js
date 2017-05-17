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
		(this.pieces = pieces).forEach((piece) => piece.board = this);
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

		for (let c of _.range(1, 9)) {
			this.addPiece(Pawn, Board.White, [c, 2]);
			this.addPiece(Pawn, Board.Black, [c, 7]);
		};

		symmetric(Rook, 1, 1);
		symmetric(Knight, 2, 1);
		symmetric(Bishop, 3, 1);
		this.addPiece(King, Board.White, [4, 1]);
		this.addPiece(King, Board.Black, [4, 8]);
		this.addPiece(Queen, Board.White, [5, 1]);
		this.addPiece(Queen, Board.Black, [5, 8]);
	};

	/**
	 * Removes all pieces from the board.
	 */
	clear() {
		this.pieces.forEach((piece) => piece.remove());
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

			pieceType.board = this;
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
	 * @param {object} filters - An object whose keys are filter names and values are filters.
	 * @return {Piece[]} An array of pieces matching the given filters.
	 * @throws Will throw an exception if given an unrecognized filter.
	 */
	filter({ color, piece, position }) {
		let found = _.clone(this.pieces);
		if (color) {
			color = Board.getColor(color);
		};

		if (typeof color != "undefined") {
			found = _.filter(found, (p) => p.color == color);
		};

		if (typeof piece != "undefined") {
			found = _.filter(found, (p) => p instanceof piece);
		};

		if (typeof position != "undefined") {
			if (position instanceof Piece) {
				position = position.position;
			};

			found = _.filter(found, (p) => Board.formatPosition(p) == Board.formatPosition(position));
		};

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
		if (position == null) {
			return null;
		};

		position = Board.parsePosition(position);
		return this.pieces.filter((piece) => piece.position[0] == position[0] && piece.position[1] == position[1])[0] || null;
	};

	/**
	 * Returns an ANSI rendering of the board.
	 * @param {number} [dim=4] - The dimming factor for the square colors (0–23).
	 * @param {boolean} [showPositions=false] - Whether to positions on each square.
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
		}, ["      " + _.range(1, 9).map((c) => Board.formatPosition([c, 1])[0]).join("     "), ""]).join("\n");
	};

	/**
	 * Performs an after-turn check. This will turn any pawn at the end of the board into a queen.
	 */
	maintain() {
		this.pieces.forEach((piece) => piece instanceof Pawn && piece.atTop && piece.morph(Queen));
	};

	/**
	 * Returns an array containing all possible moves.
	 * @return {Move[]} An array of moves in the format [destination col, destination row, taken piece, source piece].
	 */
	allMoves() {
		return this.pieces.reduce((a, piece) => a.concat(piece.moves()), []);
	};

	/**
	 * Returns an array containing all possible moves for a given color.
	 * @param {Color} color - The color whose possible moves will be returned.
	 * @param {boolean} [excludeUnsafe=true] - Whether to exclude any moves that take the given color out of check (if it's in check).
	 * @return {?Move[]} An array of moves for the given color. If null, this side is in checkmate.
	 */
	coloredMoves(color, excludeUnsafe=true) {
		const all = this.allMoves();
		const inCheck = this.findCheck()[0] == color;
		let moves = all.filter((move) => move[3].color == color);
		if (excludeUnsafe) {
			moves = moves.filter(([x, y, target, source]) => {
				if (!(source instanceof King)) {
					return !inCheck;
				};
			
				let hypothetical = this.clone();
				hypothetical.makeMove([x, y, target? hypothetical.filter({ position: target })[0] : null, hypothetical.filter({ position: source })[0]]);
				return hypothetical.findCheck()[0] != color;
			});

			if (!moves.length) {
				return null;
			};
		};

		return moves;
	};

	/**
	 * Returns an array containing all safe moves. When one side is in check, any
	 * moves that don't bring it out of check are unsafe. All other moves are safe.
	 * @return {?Move[]} An array of safe moves, or null if either side is checkmated.
	 */
	safeMoves() {
		const black = this.coloredMoves(Board.Black);
		if (black == null) {
			return null;
		};

		const white = this.coloredMoves(Board.White);
		return white == null? null : black.concat(white);
	};

	/**
	 * Executes a given move.
	 * @param {Array} move - The move to make.
	 */
	makeMove([x, y, take, src]) {
		if (take) {
			take.remove();
		};

		src.moveTo([x, y], 1);
	};

	/**
	 * Finds whether either side is in check.
	 * @return {Array} Returns an array containing the color of the side in check and the first move that targets the king.
	 */
	findCheck() {
		let move = this.allMoves().filter(([x, y, target, src]) => target instanceof King)[0];
		return move? [move[2].color, move] : [false, null, false];
	};

	/**
	 * Returns a clone of this board.
	 * @return {Board} A new Board with the same information.
	 */
	clone() {
		const board = new Board();
		this.pieces.forEach((piece) => board.addPiece(piece.clone(board)));
		return board;
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
			return position.position.slice(0);
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
	 */
	static validPosition(position) {
		try {
			return _.every(Board.parsePosition(position), (n) => _.inRange(n, 1, 9));
		} catch(e) {
			return false;
		};
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
	 * @param {(Color|Symbol|number|string|Piece)} color - A value parseable by getColor().
	 * @param {boolean} [firstUpper=true] - Whether the first character should be uppercase.
	 * @return {string} Either "black" or "white".
	 * @throws Will throw an exception if the given color is invalid.
	 */
	static formatColor(color, firstUpper=true) {
		return Board.getColor(color) == Board.Black? (firstUpper? "Black" : "black") : (firstUpper? "White" : "white");
	};

	/**
	 * Returns the opposite of a given color.
	 * @param {(Color|Symbol|number|string|Piece)} color - A value parseable by getColor().
	 * @return {?Color} The opposite color if the given color is valid, or null otherwise.
	 */
	static anticolor(color) {
		color = Board.getColor(color);
		
		if (color == Board.Black) {
			return Board.White;
		};

		return color == Board.White? Board.Black : null;
	};
};

Piece.initAll(module.exports = Board);
