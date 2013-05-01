#! /usr/bin/env node

var watch = require( 'watch' ),
	colors = require( 'colors' ),
	spawn = require( 'child_process' ).spawn;


console.log( 'watching root:' , process.cwd() );

function change_handler(){

	console.log( 'running make' );
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

watch.createMonitor( process.cwd(), function( monitor ){


	monitor.on("created", function (f, stat) {
      // Handle new files
      change_handler();
    });
    monitor.on("changed", function (f, curr, prev) {
      // Handle file changes
            change_handler();

    });
    monitor.on("removed", function (f, stat) {
      // Handle removed files
       change_handler();

    });
});