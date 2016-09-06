'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';


import {allValuesEqual}   from '../src/utils.js';

describe('allValuesEqual', function() {
    it('should work on truthy values', function() {
        const truthyValues = [ [1,1,1], [null, null, null], ['a', 'a', 'a'], [1.31, 1.31, 1.31], [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY], ['d'], [Symbol()] , [NaN, NaN], [undefined, undefined]];
        truthyValues.forEach( (truthyValue) => {
            assert(allValuesEqual(truthyValue));
        });
    });

    it('should work on falsy values', function() {
        const truthyValues = [ [1,2,1], [null, undefined, null], ['a', 'b', 'a'], [1.31, 1.31, 1.32], [Number.POSITIVE_INFINITY, 3, Number.POSITIVE_INFINITY], ['d', 'e'], [Symbol(), Symbol()], [undefined, null] ];
        truthyValues.forEach( (truthyValue) => {
            assert(!allValuesEqual(truthyValue));
        });
    });    

});
