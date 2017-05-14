#!/usr/bin/env node

/*
todo:
- check/checkmate
- redraw only squares that change
*/

let _ = require("lodash"),
	chalk = require("chalk"),
	Board = require("./board.js"),
	{ Piece, Knight, Pawn, Rook, Bishop, Queen, King } = require("./pieces/piece.js");

let _enableWarn = true;
class Chess {
	constructor() {
		this.board = new Board();
	};

	_printMoves() {
		let moves = this.board.allMoves();
		for (let [x, y, take, src] of moves) {
			console.log(`${src.ColorName} ${src.name} at ${src.formatPosition()} to ${Board.formatPosition([x, y])}${take? ` (will capture a ${take.ColorName} ${take.name})` : ""}.`);
		};
	};

	get randomMove() { return _.sample(this.board.allMoves()) };

	static get enableWarn() { return _enableWarn };
	static set enableWarn(to) { _enableWarn = to };

	static warn(...args) {
		if (Chess.enableWarn) {
			console.warn(...args);
		};
	};
};

exports.Chess = Chess;

if (require.main === module) {
	let delay = 500, active = false;
	const print = (data) => process.stdout.write(data);
	const resetScreen = () => print("\u001b[2J\u001b[1;1H");
	const showCursor = () => print("\u001b[?25h");
	const hideCursor = () => print("\u001b[?25l");
	const changeDelay = (newDelay) => { delay = newDelay; print(`\u001b[1;1H\u001b[2K${chalk.dim(Math.round(delay) / 1000 + "s")}`) };
	const move = () => {
		resetScreen();
		print(chalk.dim(`${Math.round(delay) / 1000}s`));
		console.log(c.board.toString(8, true));
		const moves = c.board.coloredMoves(lastColor = (lastColor == Board.Black? Board.White : Board.Black));
		if (moves === null) {
			console.log(`\nCheckmate! ${lastColor == Board.Black? "White" : "Black"} wins.`);
		};

		let nextMove = _.sample(moves);
		if (nextMove) {
			c.board.makeMove(nextMove);
			c.board.maintain();
		} else {
			console.log(`${Board.formatColor(lastColor)} has no moves left!`);
			active = false;
		};
	};

	const tick = () => {
		active && move();
		setTimeout(tick, delay);
	};

	let lastColor = Board.Black;
	let c = new Chess();
	c.board.setBoard();
	hideCursor();

	const start = () => {
		active = true;
		setTimeout(tick, delay);
	};

	const stdin = process.stdin;
	stdin.setRawMode(true);
	stdin.resume();
	stdin.setEncoding("utf8");
	stdin.on("data", (key) => {
		if (key == "\u0003") {
			showCursor();
			process.exit();
		} else if (key == " ") {
			if (active) {
				print(`\u001b[1;1H${chalk.dim("Paused.")}`);
				active = false;
			} else {
				print(`\u001b[1;1H\u001b[2K`);
				active = true;
			};
		} else if (key == ".") {
			changeDelay(delay * 1.1);
		} else if (key == ",") {
			changeDelay(delay / 1.1);
		} else if (key == "n") {
			active || move();
		};
	});

	require("death")(() => [showCursor(), process.exit(0)]);
	start();
};
