#! /usr/bin/env node

var watch = require( 'watch' ),
	colors = require( 'colors' ),
	spawn = require( 'child_process' ).spawn,
  path = require( 'path' );

var args = process.argv.slice(2);
var ignoreDotFiles = args.indexOf("--ignore-dot-files") >= 0;
var ignores = args.reduce(function(state, arg) {
  return {
    ignores: state.include ? state.ignores.concat(arg) : state.ignores,
    include: arg === "--ignore"
  };
}, { ignores: [], include: false }).ignores.map(function(relative) {
  return path.resolve(relative);
});

console.log( 'watching root:' , process.cwd() );
if (ignores.length) console.log( 'ignoring: ' , ignores.join( ',' ) )

function change_handler(f){
  console.log( 'file changed running make:', f );
	var ps = spawn( 'make' );

	ps.stderr.on( 'data' , function( data ){

		console.log( 'stderr:'.red , data.toString() );
	} );

	ps.stdout.on( 'data' , function( data ){

		console.log( 'output:', data.toString() );
	} );

	ps.on( 'exit' , function( code ){

		console.log( 'make exited with code:' , code );
	} );
}

watch.createMonitor( process.cwd(), {
  ignoreDotFiles: ignoreDotFiles,
  filter: function(path) {
    //console.log(path)
    return ignores.indexOf(path) >= 0
  },
}, function( monitor ){


	monitor.on("created", function (f, stat) {
      // Handle new files
      change_handler(f);
    });
    monitor.on("changed", function (f, curr, prev) {
      // Handle file changes
      change_handler(f);

    });
    monitor.on("removed", function (f, stat) {
      // Handle removed files
       change_handler(f);

    });
});
