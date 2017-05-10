#!/usr/bin/env node
let _ = require("lodash"),
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
console.log(b.toString());
