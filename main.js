var csv = require('csv');
var _ = require('underscore');
var fs = require('fs');

module.exports = {
  defaultTransform: function(row, index){

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
        this.headerRow = row;
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
        obj = _.object(this.headerRow, row);
        return JSON.stringify(obj) + ',';
      }
    }
  },
  defaultOut: function(content){

    //write the content into a file as an array of json objects
    var out = "[" + content.slice(0,-1) + "]";
    var fileName = this.filename + '.json';

    fs.writeFileSync(fileName, out);
  },
  convert: function(filename, outputFunc, transformFunc){
    this.filename = filename;
    outputFunc = (typeof outputFunc == "function") ? outputFunc : this.defaultOut;
    transformFunc = (typeof transformFunc == "function") ? transformFunc : this.defaultTransform;
    csv()
    .from.stream(fs.createReadStream(this.filename + '.csv'))
    .to(outputFunc.bind(this))
    .transform(transformFunc.bind(this));
  }
}
