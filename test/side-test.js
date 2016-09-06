'use strict'; 

import 'babel-polyfill';
const assert     = require('assert');
import _ from 'lodash';

import {Side}       from '../src/side.js';
import {sideHolder} from '../src/side-holder.js';


describe('Side.A and Side.B', function() {
    it('are ok', function() {
        assert.notEqual(Side.A, Side.B);
        assert.equal(Side.A, Side.A);
        assert.equal(Side.B, Side.B);
    });
    it('are OK when through another module', function() {
        assert.notEqual(sideHolder.a, sideHolder.b);
        assert.equal(Side.A, sideHolder.a);
        assert(Side.A===sideHolder.a);
        assert(Side.B===sideHolder.b);
        assert(Side.A===sideHolder.b.theOther());        
        assert(Side.B===sideHolder.a.theOther());
    });
    it('is re-entrant', function() {
        const Side2 = require('../src/side.js');
        assert(Side.A === Side2.Side.A);
        assert.equal(Side.A, Side2.Side.A);
    });
    it('is re-entrant through another module', function() {
        const Side2 = require('../src/side.js');
        const foo   = require('../src/side-holder.js');
        assert(Side.A === Side2.Side.A);
        assert.equal(Side.A, Side2.Side.A);
        assert(foo.sideHolder.a === Side2.Side.A);
        assert(foo.sideHolder.b === Side2.Side.B);
        assert(foo.sideHolder.b.theOther() === Side.A);
        assert(foo.sideHolder.a.theOther() === Side.B);
        assert(foo.sideHolder.a!=undefined);
        assert(foo.sideHolder.b!=undefined);
        assert(foo.sideHolder.a!=null);
        assert(foo.sideHolder.b!=null);
    });    
});
