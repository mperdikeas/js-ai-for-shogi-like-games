'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';

import {PieceOnSide}                         from '../src/piece.js';
import {Chick, Hen, Elephant, Giraffe, Lion} from '../src/piece-set.js';


describe('PieceOnSide', function() {
    it('fromString works', function() {
        const p = PieceOnSide.fromString([Chick, Elephant], 'c');
        assert(p instanceof PieceOnSide);
        assert.equal(p.piece, Chick);
        assert.equal(p.isSideA, false);
    });
});
