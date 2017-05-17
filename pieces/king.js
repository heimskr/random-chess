let Piece = require("./piece.js"),
	Board;

class King extends Piece {
	static get characters() { return ["♔", "♚"] };

	moves() {
		let add = (position, piece=null) => position !== null && out.push([...position, piece, this]);
		let out = [], other;

		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				if (x == 0 && y == 0) {
					continue;
				};

				if ((other = this.offset(x, y)) && other.color != this.color) {
					add(other.position, other);
				} else if (!other) {
					add(this.offsetPosition(x, y));
				};
			};
		};

		out = out.filter(([x, y, target, source]) => {
			/*
				We can't use findCheck because it would result in an infinite loop. We can check whether any non-king
				pieces could capture the king in the hypothetical scenario, but we have to handle the enemy king
				separately (i.e., check whether the two kings are adjacent).
			*/
			let hypothetical = this.board.clone();
			let king = hypothetical.filter({ position: source })[0];
			hypothetical.makeMove([x, y, target? hypothetical.filter({ position: target })[0] : null, king]);

			const first = !hypothetical.filter({ piece: King, color: Board.anticolor(king) })[0].adjacentTo(king);
			const second = hypothetical.pieces
									  .filter((piece) => !(piece instanceof King))
									  .reduce((a, piece) => a.concat(piece.moves()), [])
									  .filter((move) => move.target == king)
									  .length == 0;

			return first && second;
		});

		return out;
	};
};

module.exports = King;
module.exports.init = (board) => Board = board;
