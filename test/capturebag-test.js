'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import           _ from 'lodash';

import {PieceOnSide} from '../src/piece.js';
import {Chick, Hen, Lion} from '../src/piece-set.js';
import {CaptureBag} from '../src/captureBag.js';

describe('CaptureBag', function() {
    describe('construction', function() {
        it('should work', function() {
            const captureBag = new CaptureBag();
            assert.equal(captureBag.toString(), '');
            const captureBagClone = captureBag.clone();
            assert(captureBag!==captureBagClone);
            assert.equal(captureBagClone.toString(), '');
        });
    });
    describe('capturing', function() {
        it('should work', function() {
            const cb = new CaptureBag();
            cb.capture(new PieceOnSide(Chick, true));
            assert.equal(cb.toString(), 'c');
            cb.capture(new PieceOnSide(Chick, false));
            assert.equal(cb.toString(), 'Cc');
            cb.capture(new PieceOnSide(Hen, false));
            assert.equal(cb.toString(), 'CCc');
            cb.capture(new PieceOnSide(Hen, true));
            assert.equal(cb.toString(), 'CCcc');
            cb.capture(new PieceOnSide(Lion, true));
            assert.equal(cb.toString(), 'CCccl');
        });
    });
    describe('reflection', function() {
        it('should work', function() {
            const cb = sampleBoard();
            assert.equal(cb.toString(), 'CCccl');
            const cb2 = cb.reflection();
            assert.equal(cb.toString(), 'CCccl');
            assert.equal(cb2.toString(), 'CCLcc');
        });
    });
    describe(`hasBeenDroppedBackInTheBoard`, function() {
        it(`should work`, function() {
            const cb = sampleBoard();
            cb.hasBeenDroppedBackInTheBoard(new PieceOnSide(Chick, true));
            assert.equal(cb.toString(), 'Cccl');
            cb.hasBeenDroppedBackInTheBoard(new PieceOnSide(Chick, true));
            assert.equal(cb.toString(), 'ccl');            
        });
        it(`it should baulk as expected`, function() {
            const cb = sampleBoard();
            assert.throws (()=>{
                cb.hasBeenDroppedBackInTheBoard(new PieceOnSide(Hen, true));
            });
            cb.hasBeenDroppedBackInTheBoard(new PieceOnSide(Chick, true));
            cb.hasBeenDroppedBackInTheBoard(new PieceOnSide(Chick, true));
            assert.equal(cb.toString(), 'ccl');
            assert.throws (()=>{
                cb.hasBeenDroppedBackInTheBoard(new PieceOnSide(Chick, true));
            });
            assert.throws (()=>{
                cb.hasBeenDroppedBackInTheBoard(new PieceOnSide(Hen, true));
            });                        
        });
    });
});

function sampleBoard() {
    const cb = new CaptureBag();
    cb.capture(new PieceOnSide(Chick, true));
    cb.capture(new PieceOnSide(Chick, false));
    cb.capture(new PieceOnSide(Hen, false));
    cb.capture(new PieceOnSide(Hen, true));
    cb.capture(new PieceOnSide(Lion, true));
    return cb;
}
