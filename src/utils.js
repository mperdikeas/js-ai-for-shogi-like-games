// @flow
'use strict';

import _ from 'lodash';
import assert from 'assert';

function allValuesEqual(arr: Array<any>): boolean { 
    return _.uniq(arr).length<=1;
}

function theOne(arr: Array<any>): any {
    assert(allValuesEqual(arr));
    assert(arr.length>0);
    return arr[0];
}

exports.allValuesEqual = allValuesEqual;
exports.theOne = theOne;
