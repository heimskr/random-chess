let Piece = require("./piece.js"),
	Board;

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
		if (this.offset(0, 1) === null) {
			out.push([...this.offsetPosition(0, 1), null]);
		};

		let other;
		if ((other = this.offset(-1, 1)) && other.color != this.color) {
			out.push([...other.position, other]);
			console.log("Opposing piece seen leftways @", Board.formatPosition(other));
		};

		if ((other = this.offset(1, 1)) && other.color != this.color) {
			out.push([...other.position, other]);
			console.log("Opposing piece seen rightways @", Board.formatPosition(other));
		};

		console.log(`Moves for Pawn at ${Board.formatPosition(this.position)}: ${out.map(([x, y, p]) => `(${Board.formatPosition([x, y])}${p? `, ${p.constructor.name}` : ""})`).join(" ")}`);
		return out;
	};
};

module.exports = Pawn;
module.exports.init = (board) => Board = board;
