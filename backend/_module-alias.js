const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  '@game': __dirname + '/dist/game',
  '@network': __dirname + '/dist/network',
  '@entities': __dirname + '/dist/entities',
  '@': __dirname + '/dist'
});
