let Piece = require("./piece.js");

class Knight extends Piece {
	static get characters() { return ["♘", "♞"] };

	static canAdd(board, color) {
		console.log("filtered:", board.pickPieces(["color", color], ["type", Knight]));
	};

	moves() {
		const out = [], add = (position, piece=null) => position !== null && out.push([...position, piece, this]);
		let other;
		[[-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1]].forEach(([x, y]) => {
			if ((other = this.offset(x, y)) && other.color != this.color) {
				add(other.position, other);
			} else if (!other) {
				add(this.offsetPosition(x, y));
			};
		});

		return out;
	};
};

module.exports = Knight;
