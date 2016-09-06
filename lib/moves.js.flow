// @flow
'use strict';

import assert from 'assert';

import {Side}          from './side.js';
import {Point, Vector} from 'geometry-2d';
import {Piece, PieceOnSide} from './piece.js';

class Move {
    constructor() {}
    static fromString(pieceSet: Array<IConcretePiece>, s: string): Move {
        if (s.startsWith('('))
            return BoardMove.bmFromString(s);
        else
            return DropMove.dmFromString(pieceSet, s);
    }
    static fromStringNoPieceSetInfo(s: string): Move {
        if (s.startsWith('('))
            return BoardMove.bmFromString(s);
        else
            return DropMoveNoPieceInformation.dmFromStringNoPieceSet(s);
    }    
}

class BoardMove extends Move {
    vector: Vector;
    constructor(vector: Vector) {
        super();
        this.vector = vector;
    }
    static bmFromString(s: string): BoardMove {
        return new BoardMove(Vector.fromString(s));
    }
    toString(): string {
        return this.vector.toString();
    }
    equals(o: any): boolean {
        if ( !(o instanceof BoardMove))
            return false;
        else
            return this.vector.equals(o.vector);
    }
}

class DropMoveNoPieceInformation extends Move {
    side: Side;
    to: Point;
    constructor(side: Side, to: Point) {
        super();
        this.side  = side;
        this.to    = to;
    }
    static dmFromStringNoPieceSet(s: string): DropMoveNoPieceInformation {
        const parts: Array<string> = s.split('=>');
        assert(parts.length===2, JSON.stringify(parts));
        let side: Side = (parts[0]===parts[0].toUpperCase())?Side.A:Side.B;
        const point: Point = Point.fromString(parts[1]);
        return new DropMoveNoPieceInformation(side, point);
    }
    toString(): string {
        return `$?{this.side}=>${this.to}`;
    }
    equals(o: any): boolean {
        if (!(o instanceof DropMoveNoPieceInformation)) {
            return false;
        } else {
            const b1 = o.side === this.side;
            const b2 = o.to.equals(this.to);
            return b1&&b2;
        }
    }
}

class DropMove extends DropMoveNoPieceInformation {
    pieceOnSide: IConcretePieceOnSide;
    constructor(pieceOnSide: IConcretePieceOnSide, to: Point) {
        super(pieceOnSide.isSideA?Side.A:Side.B, to);
        this.pieceOnSide = pieceOnSide;
    }
    static dmFromString(pieceSet: Array<IConcretePiece>, s: string): DropMove {
        const parts: Array<string> = s.split('=>');
        assert(parts.length===2, JSON.stringify(parts));
        const pieceOnSide: IConcretePieceOnSide = PieceOnSide.fromString(pieceSet, parts[0]);
        const point: Point = Point.fromString(parts[1]);
        return new DropMove(pieceOnSide, point);
    }
    toString(): string {
        return `${this.pieceOnSide}=>${this.to}`;
    }
    equals(o: any) {
        if (!(o instanceof DropMove)) {
            return false;
        } else {
            const b1 = o.pieceOnSide.equals(this.pieceOnSide);
            const b2 = o.to.equals(this.to);
            return b1&&b2;
        }
    }
}


exports.Move      = Move;
exports.BoardMove = BoardMove;
exports.DropMoveNoPieceInformation = DropMoveNoPieceInformation;
exports.DropMove  = DropMove;

