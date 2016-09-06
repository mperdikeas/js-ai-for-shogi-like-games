import {Point} from 'geometry-2d';
declare class Number {
    between(a: number, b: number): boolean;
    static POSITIVE_INFINITY: number;
    static NEGATIVE_INFINITY: number;
}

interface IConcretePiece {
    code: string;
    isKing: boolean;
    toString(): string;
    takeSides(isSideA: boolean): IConcretePieceOnSide;
    demote(): IConcretePiece;
    promote(): IConcretePiece;
    isPromotable(): boolean;
    moves(): Array<Point>;
}


interface IConcretePieceOnSide {
    piece: IConcretePiece;
    isSideA: boolean;
    switchSides(): IConcretePieceOnSide;
    switchSidesAndDemote(): IConcretePieceOnSide;
    sameSide(o: IConcretePieceOnSide): boolean;
    toString(): string;
    promote(): IConcretePieceOnSide;
    equals(o: IConcretePieceOnSide): boolean;
}




// See https://github.com/facebook/flow/issues/810
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
declare class Symbol {
    static (value?:any): symbol;
    static for(key:string): symbol;
    static keyFor(symbol:symbol): string;
    toString(): string;
    valueOf(): symbol;
    // Well-known symbols
    static iterator: symbol;
    static match: symbol;
    static replace: symbol;
    static search: symbol;
    static split: symbol;
    static hasInstance: symbol;
    static isConcatSpreadable: symbol;
    static unscopables: symbol;
    static species: symbol;
    static toPrimitive: symbol;
    static toStringTag: symbol;
}

type symbol = Symbol;


