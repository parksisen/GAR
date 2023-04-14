// Imports
var Commands = require('./modules/CommandList');
var GameServer = require('./GameServer');

// Init variables
var showConsole = true;

// Start msg
console.log("          ___");
console.log("         / __| ___ _ ___ _____ _ _");
console.log("         \\__ \\/ -_) '_\\ V / -_) '_|");
console.log("         |___/\\___|_|  \\_/\\___|_| \033[0;31mv2.0.1\033[0;31m");

console.log("         \033[0;31mONE SETTINGS BY SH7NE\033[0;31m");
console.log("         \033[1;33mDEV SERVER BY CTUNG HUSTLE\033[1;33m");
console.log("");

// Handle arguments
process.argv.forEach(function(val) {
    if (val == "--noconsole") {
        showConsole = false;
    } else if (val == "--help") {
        console.log("Proper Usage: jx index.js");
        console.log("    --noconsole         Disables the console");
        console.log("    --help              Help menu.");
        console.log("");
    }
});

// Run Ogar
var gameServer = new GameServer();
gameServer.start();

// Add command handler
gameServer.commands = Commands.list;
// Initialize the server console
if (showConsole) {
    // var readline = require('readline');
    // var in_ = readline.createInterface({ input: process.stdin, output: process.stdout });
    // setTimeout(prompt, 100);
    var sys = require("sys");
    var stdin = process.openStdin();
}

stdin.addListener("data", function(d) {
    if ( d.toString().trim() === '' ) return;
		process.stdout.write('\033[1A\033[2K');
    console.log("\u001B[36m[CMD] " + d.toString().trim() + "\u001B[0m" );
    parseCommands( d.toString().trim() );
});

function parseCommands(str) {
    // Don't process ENTER
    if (str === '' || str === '\n')
        return;

    // Splits the string
    var split = str.split(" ");

    // Process the first string value
    var first = split[0].toLowerCase();

    // Get command function
    var execute = gameServer.commands[first];
    if (typeof execute != 'undefined') {
        execute(gameServer,split);
    } else {
        console.log("Invalid Command!");
    }
};
