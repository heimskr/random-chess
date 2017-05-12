let Piece = require("./piece.js");

class King extends Piece {
	static get characters() { return ["♔", "♚"] };

	moves() {
		const out = [], add = (position, piece=null) => position !== null && out.push([...position, piece]);
		let other;

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

		return out;
	};
};

module.exports = King;
