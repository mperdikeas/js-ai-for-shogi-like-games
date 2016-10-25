'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _                  from 'lodash';
import equals             from 'array-equal';
import {PieceOnSide}      from '../src/piece.js';
import {Chick, Hen, Lion} from '../src/piece-set.js';
import {Elephant, Giraffe}from '../src/piece-set.js';
import {CaptureBag}       from '../src/captureBag.js';
import {createPieceSet}   from '../src/piece-set-factory.js';

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
    describe('piecesOfThisSide', function() {
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
            const sideAPieces = cb.piecesOfThisSide(true);
            assert(equals(['c', 'c'], _.map(sideAPieces, (x)=>x.code)));
            const sideBPieces = cb.piecesOfThisSide(false);
            assert(equals(['c', 'c', 'l'], _.map(sideBPieces, (x)=>x.code)));
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
            const cb = sampleCaptureBag();
            assert.equal(cb.toString(), 'CCccl');
            const cb2 = cb.reflection();
            assert.equal(cb.toString(), 'CCccl');
            assert.equal(cb2.toString(), 'CCLcc');
        });
    });
    describe(`hasBeenDroppedBackInTheBoard`, function() {
        it(`should work`, function() {
            const cb = sampleCaptureBag();
            cb.hasBeenDroppedBackInTheBoard(new PieceOnSide(Chick, true));
            assert.equal(cb.toString(), 'Cccl');
            cb.hasBeenDroppedBackInTheBoard(new PieceOnSide(Chick, true));
            assert.equal(cb.toString(), 'ccl');            
        });
        it(`it should baulk as expected`, function() {
            const cb = sampleCaptureBag();
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
    describe('fromString', function() {
        it('should work', function() {
            const bags = ['CCccl', 'cclCC', 'ClcCc', 'lccCC'];
            bags.forEach( (bag) => {
                const cb = sampleCaptureBag();
                const cbFromString = CaptureBag.fromString(bag, pieceSet());
                assert(cb.equals(cbFromString));
            });
        });
        it('should fail as expected', function() {
            const bags = ['CCccle', 'cclCCE', 'ClcCC', 'LccCC'];
            bags.forEach( (bag) => {
                const cb = sampleCaptureBag();
                const cbFromString = CaptureBag.fromString(bag, pieceSet());
                assert(!cb.equals(cbFromString));
            });
        });        
    });
});

function pieceSet() {
    const pieces = [Chick, Hen, Elephant, Giraffe, Lion];
    return createPieceSet(pieces);
}

function sampleCaptureBag() {
    const cb = new CaptureBag();
    cb.capture(new PieceOnSide(Chick, true));
    cb.capture(new PieceOnSide(Chick, false));
    cb.capture(new PieceOnSide(Hen, false));
    cb.capture(new PieceOnSide(Hen, true));
    cb.capture(new PieceOnSide(Lion, true));
    return cb;
}
