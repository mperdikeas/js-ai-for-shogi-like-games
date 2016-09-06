// @flow
'use strict';


class Side {
    constructor(){
        Object.freeze(this);
    }

    static A: Side = new Side();
    static B: Side = new Side();
    static fromWhetherIsSideA(isSideA: boolean): Side {
        if (isSideA)
            return Side.A;
        else
            return Side.B;
    }

    theOther(): Side {
        if (this===Side.A)
            return Side.B;
        if (this===Side.B)
            return Side.A;
        throw new Error();
    }
}


Object.freeze(Side);

exports.Side = Side;
