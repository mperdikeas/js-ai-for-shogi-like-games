'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';


import {transpose} from '../src/transpose.js';

describe('transpose', function() {
    it('should work with normal values', function() {
        const ar1 = [[1,2],[3,4],[5,6]];
        const exp = [[1,3,5], [2,4,6]];
        const ar2 = transpose(ar1);
        assert.deepEqual(ar2, exp);
        assert.deepEqual(transpose(ar2), ar1);
        assert.deepEqual(transpose(transpose(ar1)), ar1);
    });
    it('should work with nulls and undefineds', function() {
        const ar1 = [[1,2],[3,null],[undefined,null]];
        const exp = [[1,3,undefined], [2,null,null]];
        const ar2 = transpose(ar1);
        assert.deepEqual(ar2, exp);
        assert.deepEqual(transpose(ar2), ar1);
        assert.deepEqual(transpose(transpose(ar1)), ar1);
    });    
});
