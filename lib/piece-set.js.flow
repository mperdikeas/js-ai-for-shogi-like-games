// @flow
'use strict';

(function() {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
})();

import not_used from './number-prototype.js';
import {Piece, PieceOnSide} from './piece.js';
import {Point} from 'geometry-2d';

const Chick: IConcretePiece = new (class extends Piece {
    code: string;
    isKing: boolean;
    constructor(code: string) {
        super(code, false);
        (this: IConcretePiece);
    }
    moves(): Array<Point> {
        return [new Point(0, -1)];
    };
    takeSides(isSideA: boolean): IConcretePieceOnSide {
            return new PieceOnSide(this, isSideA);
    }    
    demote(): IConcretePiece {
        return this;
    }
    promote(): IConcretePiece {
        return Hen;
    };
    isPromotable(): boolean {
        return this !== this.promote();
    }
})('c');


const Elephant: IConcretePiece = new (class extends Piece {
    code: string;
    isKing: boolean;
    constructor(code: string) {
        super(code, false);
        (this: IConcretePiece);
    }
    moves(): Array<Point> {
        return [new Point(1, -1),
                new Point(1, 1),
                new Point(-1, -1),
                new Point(-1, 1)
               ];
    };
    takeSides(isSideA: boolean): IConcretePieceOnSide {
            return new PieceOnSide(this, isSideA);
    }    
    demote(): IConcretePiece {
        return this;
    }
    promote(): IConcretePiece {
        return this;
    };
    isPromotable(): boolean {
        return this !== this.promote();
    }
})('e');


const Giraffe: IConcretePiece = new (class extends Piece {
    code: string;
    isKing: boolean;
    constructor(code: string) {
        super(code, false);
        (this: IConcretePiece);
    }
    moves(): Array<Point> {
        return [new Point(0, -1),
                new Point(1, 0),
                new Point(0, 1),
                new Point(-1, 0)
               ];
    };
    takeSides(isSideA: boolean): IConcretePieceOnSide {
            return new PieceOnSide(this, isSideA);
    }    
    demote(): IConcretePiece {
        return this;
    }
    promote(): IConcretePiece {
        return this;
    };
    isPromotable(): boolean {
        return this !== this.promote();
    }
})('g');

const Hen: IConcretePiece = new (class extends Piece{
    code: string;
    isKing: boolean;    
    constructor(code: string) {
        super(code, false);
        (this: IConcretePiece);
    }    
    moves(): Array<Point> {
        return [new Point(0, -1), new Point(1, -1), new Point(1, 0), new Point(0, 1), new Point(-1, 0), new Point(-1, -1)];
    };
    takeSides(isSideA: boolean): IConcretePieceOnSide {
            return new PieceOnSide(this, isSideA);
    }    
    demote(): IConcretePiece {
        return Chick;
    }
    promote(): IConcretePiece {
        return this;
    };
    isPromotable(): boolean {
        return this !== this.promote();
    }
})('h');

const Lion: IConcretePiece = new (class extends Piece{
    code: string;
    isKing: boolean;    
    constructor(code: string) {
        super(code, true);
        (this: IConcretePiece);
    }    
    moves(): Array<Point> {
        return [new Point(0, -1), new Point(1, -1), new Point(1, 0), new Point(1, 1), new Point(0, 1), new Point(-1, 1), new Point(-1, 0), new Point(-1, -1)];
    };
    takeSides(isSideA: boolean): IConcretePieceOnSide {
            return new PieceOnSide(this, isSideA);
    }    
    demote(): IConcretePiece {
        return this;
    }
    promote(): IConcretePiece {
        return this;
    };
    isPromotable(): boolean {
        return this !== this.promote();
    }
})('l');


exports.Chick         = Chick;
exports.Hen           = Hen;
exports.Elephant      = Elephant;
exports.Giraffe       = Giraffe;
exports.Lion          = Lion;




