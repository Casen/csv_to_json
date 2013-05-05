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
    var fileName = this.filename.replace(/\.[a-zA-Z]+$/, '.json'); //replace .csv with .json
    console.log('writing file: ', fileName);

    fs.writeFileSync(fileName, out);
    this.callback(fileName);
  },
  convert: function(filename, callback, options){
    this.filename = filename;
    this.callback = (typeof callback == "function") ? callback : function(){};
    options = (typeof options == "object") ? options : {};

    outputFunc = (typeof options.outputFunc == "function") ? options.outputFunc : this.defaultOut;
    transformFunc = (typeof options.transformFunc == "function") ? options.transformFunc : this.defaultTransform;

    csv()
    .from.stream(fs.createReadStream(this.filename))
    .to(outputFunc.bind(this))
    .transform(transformFunc.bind(this));

  }
}
