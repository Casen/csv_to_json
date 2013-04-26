#!/usr/bin/env node

var fs = require('fs');
var csv = require('csv');
var _ = require('underscore');
var args = process.argv.splice(2);
var headerRow;

csv()
.from.stream(fs.createReadStream(args[0] + '.csv'))
.to(function(content){

  //write the content into a file as an array of json objects
  var out = "[" + content.slice(0,-1) + "]";
  var fileName = args[0] + '.json';

  fs.writeFileSync(fileName, out);
})
.transform(function(row, index){

  //clean up line breaks and empty rows
  row.unshift(row.pop());
  row.shift();

  //trim excess whitespace
  row = _.map(row, function(val){
    return val.trim();
  });

  //if a row has content, let's transform it!
  if (row.length > 0){
    if(index == 0){
      headerRow = row;
    } else {
      // Convert numbers to float values, leave strings alone
      row = _.map(row, function(val){
        if(isNaN(parseFloat(val)) || val.split(' ').length > 1)
          return val;
        else {
          return parseFloat(val);
        }
      });
      //convert rows into json objects with headers as keys
      obj = _.object(headerRow, row);
      return JSON.stringify(obj) + ',';
    }
  }

});
