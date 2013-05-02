#!/usr/bin/env node
var args = process.argv.splice(2);
var _ = require('underscore');
var csvToJSON = require('./main.js');

csvToJSON.convert(args[0]);

