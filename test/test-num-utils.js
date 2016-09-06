'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';


import {assertArrayOfNotAscendingPositiveValues}   from '../src/num-utils.js';

describe('assertArrayOfNotAscendingPositiveValues', function() {
    it('should work', function() {
        assert.throws( ()=> {
            assertArrayOfNotAscendingPositiveValues(3);
        });
        assert.throws( ()=> {
            assertArrayOfNotAscendingPositiveValues([1,3,4,'d']);
        });
        assert.throws( ()=> {
            assertArrayOfNotAscendingPositiveValues([1,3,4,5,5,4]);
        });
        assert.throws( ()=> {
            assertArrayOfNotAscendingPositiveValues([5,4,3,2,1,-2]);
        });
        assertArrayOfNotAscendingPositiveValues([5,4,3,2,1]);
        assertArrayOfNotAscendingPositiveValues([5,4,3,2,0]);        
    });
});
