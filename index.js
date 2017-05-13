#!/usr/bin/env node
let _ = require("lodash"),
	chalk = require("chalk"),
	Board = require("./board.js"),
	{ Piece, Knight, Pawn, Rook, Bishop, Queen, King } = require("./pieces/piece.js");

let _enableWarn = true;
class Chess {
	constructor() {
		this.board = new Board();
	};

	/**
	 * Returns an array containing all possible moves.
	 * @return {Array.} An array of moves in the format [destination col, destination row, taken piece, source piece].
	 */
	allMoves() {
		return this.board.pieces.reduce((a, piece) => a.concat(piece.moves()), []);
	};

	printMoves() {
		let moves = this.allMoves();
		for (let [x, y, take, src] of moves) {
			console.log(`${src.ColorName} ${src.name} at ${src.formatPosition()} to ${Board.formatPosition([x, y])}${take? ` (will capture a ${take.ColorName} ${take.name})` : ""}.`);
		};
	};

	makeMove([x, y, take, src]) {
		if (take) {
			take.remove();
		};

		src.position = [x, y];
	};

	get randomMove() { return _.sample(this.allMoves()) };

	static get enableWarn() { return _enableWarn };
	static set enableWarn(to) { _enableWarn = to };

	static warn(...args) {
		if (Chess.enableWarn) {
			console.warn(...args);
		};
	};
};

exports.Chess = Chess;

let c = new Chess();
let b = c.board;
b.setBoard();

// b.pickPieces({ color: "white", piece: Pawn }).forEach((piece) => piece.remove());

setInterval(() => {
	process.stdout.write(`\u001b[2J`);
	console.log(b.toString(8, true));
	c.makeMove(c.randomMove);
	process.stdout.write(`\u001b[1;1H`);
}, 1000);

// console.log(b.toString(8, true));
// c.printMoves();

