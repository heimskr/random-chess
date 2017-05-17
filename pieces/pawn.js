let Piece = require("./piece.js");

class Pawn extends Piece {
	static get characters() { return ["♙", "♟"] };

	/**
	 * Returns an array of valid moves for this piece. A move is a 3-array: the first two elements
	 * are the x and y coordinate of the possible move, and the third is a reference to any capturable
	 * piece that may be in that spot (always of a different color!), or null if the spot is empty.
	 * @return {{0: number, 1: number, 2: ?Piece}[]} The array of valid moves.
	 */
	moves() {
		if (this.atTop) return [];
		let out = [];
		if (this.offset(0, 1, true) === null) {
			out.push([...this.offsetPosition(0, 1, true), null, this]);
		};

		let other;
		if ((other = this.offset(-1, 1, true)) && other.color != this.color) {
			out.push([...other.position, other, this]);
		};

		if ((other = this.offset(1, 1, true)) && other.color != this.color) {
			out.push([...other.position, other, this]);
		};

		return out;
	};
};

module.exports = Pawn;
