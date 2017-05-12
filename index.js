#!/usr/bin/env node
let _ = require("lodash"),
	chalk = require("chalk"),
	Board = require("./board.js"),
	{ Piece, Knight, Pawn, Rook, Bishop, Queen, King } = require("./pieces/piece.js");

let _enableWarn = true;
exports.Chess = class Chess {
	static get enableWarn() { return _enableWarn };
	static set enableWarn(to) { _enableWarn = to };
	static warn(...args) {
		if (Chess.enableWarn) {
			console.warn(...args);
		};
	};
};

let b = new Board();
b.setBoard();
let piece = b.addPiece(King, "black", "D4");
console.log(b.toString(8, true));
console.log(`Moves for ${Board.formatColor(piece)} ${piece.constructor.name} at ${piece.formatPosition()}: ${piece.moves().map((p) => chalk.bold(Board.formatPosition(p))).join(", ")}`);
