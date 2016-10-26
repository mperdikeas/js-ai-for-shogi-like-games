'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');

import {Chick, Hen, Elephant, Giraffe, Lion} from '../src/piece-set.js';
import {createPieceSet}                      from '../src/piece-set-factory.js';

function piecesSet1AsArray() {
    return [Chick, Hen, Elephant, Giraffe, Lion];
}

function piecesSet1AsSet() {
    return createPieceSet(piecesSet1AsArray());
}


exports.piecesSet1AsArray = piecesSet1AsArray;
exports.piecesSet1AsSet   = piecesSet1AsSet;
