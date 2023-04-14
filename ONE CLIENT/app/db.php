<?php
/*
 * Database settings
 */
define("DB_SERVER", "localhost");
define("DB_NAME", "game");
define("DB_USERNAME", "root");
define("DB_PASSWORD", "");

$db = null;

try {
    $db = new PDO("mysql:host=".DB_SERVER.";dbname=".DB_NAME, DB_USERNAME, DB_PASSWORD);
}
catch (PDOException $e) {
    echo "Error!: " . $e->getMessage() . "<br/>";
    die("err");
    exit();
}
