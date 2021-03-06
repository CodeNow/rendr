// We have to make sure some client-side dependencies
// actually exist in node_modules.

var npm = require("npm");
var fs = require("fs");
var path = require("path");


var root = __dirname + '/..',
  pkg = require('../package.json');

var dependencies = [
  'underscore',
  'backbone',
  'async',
  'handlebars'
];

dependencies = dependencies.filter(function (dep) {
  var p = path.join(__dirname, '..', 'node_modules', dep);
  var exists = fs.existsSync(p);
  console.log(p, exists);
  return !exists;
});

var packages = dependencies.map(function(dep) {
  var pkgDep = pkg.dependencies[dep];

  if (~pkgDep.indexOf('://')) {
    // If it has a protocol, assume it's a link to a repo.
    return pkgDep;
  } else {
    return dep + '@' + pkgDep;
  }
});

npm.load({
  'cwd': root
}, function(err) {
  if (err) return handleError(err);
  npm.commands.install(packages, function(err, message) {
    if (err) return handleError(err);
    console.log("NPM POSTINALL: %s", message);
  });
  npm.on("log", function(message) {
    console.log("NPM POSTINALL: %s", message);
  });
});

function handleError(err) {
  console.error(err.stack || err.message);
}
