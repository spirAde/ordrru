var path = require('path');

var createPattern = function(path) {
  return {pattern: path, included: true, served: true, watched: false};
};

var framework = function(files) {
  files.unshift(createPattern(__dirname + '/adapter.js'));
  files.unshift(createPattern(path.dirname(require.resolve('chai-immutable')) + '/chai-immutable.js'));
  files.unshift(createPattern(path.dirname(require.resolve('chai')) + '/chai.js'));
  files.unshift(createPattern(path.dirname(require.resolve('immutable')) + '/../dist/immutable.js'));
};

framework.$inject = ['config.files'];
module.exports = {'framework:chai-immutable': ['factory', framework]};