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
b.pieces.filter((p) => p instanceof Rook && p.color == Board.Black)[0].moveTo("B3");
let pawn = b.pieceAt("C2");

console.log(b.toString(8));
pawn.moves();

