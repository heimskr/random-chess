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
		this.reset();
	};

	reset(set=false) {
		if (set) {
			this.board.setBoard();
		} else {
			this.board.clear();
		};

		this.history = [];
		this.index = -1;
	};

	init() {
		this.history = [this.board.clone()];
		this.index = 0;
	};

	makeMove(move) {
		if (this.index != this.history.length) {
			this.history = this.history.slice(0, this.index + 1);
		};

		if (typeof move == "function") {
			move(this.board, this.history, this.index);
		} else {
			this.board.makeMove(move);
		};

		this.board.maintain();
		this.history.push(this.board.clone());
		this.index++;
	};

	next() {
		return this.index < this.history.length - 1? (this.board = this.history[++this.index].clone()) : null;
	};

	previous() {
		return 0 < this.index? this.board = this.history[--this.index].clone() : null;
	};

	pop() {
		if (1 < this.history.length) {
			this.history.pop();
			return this.board = this.history[--this.index].clone();
		};

		return null;
	};

	_printMoves(color=null) {
		let moves = color == null? this.board.allMoves() : this.board.coloredMoves(color);
		if (!moves) {
			return console.log("No moves (checkmate?).");
		};

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
	let delay = 10, active = false, typing = null, dead = false, started = false, delayRow = 6;
	
	// This is test code and not the actual library itself so I'm not going to care about readability l m a o
	const c = new Chess();
	const print = (data) => process.stdout.write(data);
	const status = (text="") => print(`\x1b[1;1H\x1b[2K${text}`);
	const dimStatus = (text="") => status(chalk.dim(text));
	const redraw = () => {
		print(`\x1b[2;1H${c.board.toString(8, false)}`);
		const types = { black: { }, white: { } };
		const black = c.board.filter({ color: Board.Black })
		const white = c.board.filter({ color: Board.White })
		black.forEach(({ name }) => types.black[name] = (types.black[name] || 0) + 1);
		white.forEach(({ name }) => types.white[name] = (types.white[name] || 0) + 1);
		let row = 4;
		const cursor = () => `\x1b[${row++};54H\x1b[0K`;
		print(`${cursor()}${c.index % 2? "Black" : "White"}'s turn.`);
		print(`${cursor()}${c.index + 1}/${c.history.length} ${chalk.dim(`(${c.index})`)}`);
		print(`${cursor(delayRow = row)}Delay: ${formatDelay()}`);
		print(`${cursor()}`);
		print(`${cursor()}Black (${chalk.bold(_.values(types.black).reduce((a, b) => a + b, 0))}):`);
		_(types.black).pickBy((val, key) => val).mapValues((val, key) => `${chalk.bold(val)} ⨉ ${chalk.bold(key)}`).values().each((item) => print(`${cursor()} ${item}`));
		print(`${cursor()}`);
		print(`${cursor()}White (${chalk.bold(_.values(types.white).reduce((a, b) => a + b, 0))}):`);
		_(types.white).pickBy((val, key) => val).mapValues((val, key) => `${chalk.bold(val)} ⨉ ${chalk.bold(key)}`).values().each((item) => print(`${cursor()} ${item}`));
		while (row < 28) {
			print(`${cursor()}`);
		};
	};
	const below = (text) => print(`\x1b[29;1H\x1b[0J${text}`);
	const resetScreen = () => print("\x1b[2J\x1b[1;1H");
	const showCursor = () => print("\x1b[?25h");
	const hideCursor = () => print("\x1b[?25l");
	const turns = () => c.index;
	const formatDelay = () => `${Math.round(delay) / 1000}s`
	const changeDelay = (newDelay) => print(`\x1b[${delayRow};54H\x1b[0KDelay: ${formatDelay(delay = newDelay)}`);
	const checkCheck = (color, reset=true) => {
		let [check] = c.board.findCheck();
		if (!check) {
			if (reset) {
				status("");
			};

			return false;
		};

		const moves = c.board.coloredMoves(check);
		let dead = moves == null || (moves && !moves.length);
		if (color) {
			dead = dead || !c.board.filter({ color, piece: King }).length;
		};

		if (dead) {
			active = false;
			dimStatus(`Checkmate! ${check == Board.White? "Black" : "White"} wins in ${turns() + 1} turns. (${moves == null? "null" : typeof moves}) (${moves? "" : "un"}truthy)${moves? ` (${typeof moves.length == "undefined"? "?" : moves.length})` : ``}`);
			dead = true;
			return true;
		} else if (check) {
			dimStatus(`${Board.formatColor(check)} is in check!`);
		};
	};

	const checkStatus = () => {
		status((checkCheck() || [])[0] == null? `Checkmate.` : `(Turn ${turns() + 1})`);
	};

	const move = () => {
		if (dead) {
			return;
		};

		const moves = c.board.coloredMoves(lastColor = (c.index % 2? Board.Black : Board.White));
		if (checkCheck(lastColor)) {
			return false;
		};

		let nextMove = _.sample(moves);
		if (nextMove) {
			c.makeMove(nextMove);
		} else {
			status(`${Board.formatColor(lastColor)} has no moves left!`);
			active = false;
			return;
		};

		redraw();
		checkCheck();
	};

	const tick = () => {
		active && move();
		setTimeout(tick, delay);
	};

	let lastColor = Board.Black;
	c.board.setBoard();
	c.init();
	hideCursor();

	const start = () => {
		if (started) {
			return;
		};

		started = active = true;
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
		};

		if (typing != null) {
			if (key == "\x7f") {
				typing = typing.substr(0, typing.length - 1);
			} else if (key == "\r") {
				hideCursor();
				const str = typing.trim().toUpperCase();
				let matches;
				if (matches = str.match(/^!([1-8A-H][1-8])$/i)) {
					c.board.filter({ position: matches[1] }).forEach((piece) => piece.remove());
				} else if (matches = str.match(/^@([1-8A-H][1-8])$/i)) {
					const moves = c.board.allMoves().filter(([x, y, target, src]) => Board.formatPosition(src) == from);
					below(moves.map(([x, y, target, src]) => Board.formatPosition([x, y])).join(", "));
					dimStatus(moves.length);
				} else if (matches = str.match(/^([1-8A-H][1-8])(\s*(to)?\s*)?([1-8A-H][1-8])$/i)) {
					const [, from, , to] = matches;
					const piece = c.board.filter({ position: from })[0];
					if (piece) {
						c.makeMove(() => piece.moveTo(to, 2));
						redraw();
						checkCheck();
					} else {
						dimStatus("No piece found.");
					};
				};

				return typing = null;
			} else {
				typing += key;
			};

			status(`${chalk.dim("Input move:")} ${typing}`);
			return;
		};

		if (key == " " && !dead) {
			if (!started) {
				start();
			} else {
				status((active = !active)? `` : `${chalk.dim("Paused.")}`);
			};
		} else if (key == "," && !dead) {
			changeDelay(delay * 1.1);
		} else if (key == "." && !dead) {
			changeDelay(delay / 1.1);
		} else if (key == "n" && !active && !dead) {
			move();
			redraw();
			checkCheck();
		} else if (key == "m") {
			active = false;
			typing = "";
			showCursor();
			status(`${chalk.dim("Input move:")} `);
		} else if (key == "c") {
			active = false;
			const b = c.board;
			b.clear();
			b.addPiece(King, "white", "D4");
			for (let x = 2; x <= 6; x++) {
				b.addPiece(Queen, "black", [x, 6]);
				b.addPiece(Queen, "black", [x, 2]);
			};

			for (let y = 3; y <= 5; y++) {
				b.addPiece(Queen, "black", [2, y]);
				b.addPiece(Queen, "black", [6, y]);
			};

			redraw();
			checkCheck();
		} else if (key == "s") {
			status();
			c.reset(true);
			redraw();
		} else if (key == "p") {
			status();
			c.pop();
			redraw();
			checkCheck();
		} else if (key == "]") {
			status();
			c.next();
			redraw();
			checkCheck();
		} else if (key == "[") {
			status();
			dead = false;
			c.previous();
			redraw();
			checkCheck();
		} else if (key == "a") {
			c.reset();
			let chosenOne, neighbors = [];
			for (let x of _.range(1, 9)) {
				for (let y of _.range(1, 9)) {
					if (x == 4 && y == 4) {
						chosenOne = c.board.addPiece(Queen, "white", [x, y]);
					} else {
						c.board.addPiece(Queen, "black", [x, y]);
					};
				};
			};
			
			c.init();

			for (let x of _.range(1, 9)) {
				for (let y of _.range(1, 9)) {
					let piece = c.board.filter({ position: [x, y] })[0];
					if (chosenOne.adjacentTo(piece)) {
						neighbors.push(chalk.bold(piece.formatPosition()));
					};
				};
			};

			redraw();
			status(`Neighbors: [${neighbors.join(", ")}]`);
		};
	});

	require("death")(() => [showCursor(), process.exit(0)]);
	resetScreen();
	redraw();
};
