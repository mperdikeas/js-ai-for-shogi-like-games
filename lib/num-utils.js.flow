// @flow
'use strict';

import assert from 'assert';



function assertArrayOfNotAscendingPositiveValues(o: Array<number>): void {
    assert(Array.isArray(o));
    let prevValue: number = Number.POSITIVE_INFINITY;
    for (let i = 0 ; i < o.length ; i++) {
        assert(typeof (o[i]) === typeof 0, `The element on the ${i}-th index is *not* a number`);
        if (o[i]<0)
            throw new Error(`When examining array: [${o.join(',')}] I observed that the value on index ${i} (${o[i]}) is less than zero`);
        if (o[i]>prevValue)
            throw new Error(`When examining array: [${o.join(',')}] I observed that the value on index ${i} (${o[i]}) is greater than the value of the previous index (${prevValue}). This will cause kittens to die`);
        prevValue = o[i];
    }
}

exports.assertArrayOfNotAscendingPositiveValues = assertArrayOfNotAscendingPositiveValues;
