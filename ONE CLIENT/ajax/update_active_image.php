<?php

session_start();
$_path = $_POST["path"];

$user_id = $_POST["user_id"];
require_once "../app/db.php";

try {
    $query = $db->prepare("UPDATE users SET active_image_path = ? where id =? ");

    $query->execute([$_path, $user_id]);

    $user = $db->prepare("select * from users where id = ?");
    $user->execute([$user_id]);
    $result = $user->fetch();
    $_SESSION["user"]["active_image_path"] = $result["active_image_path"];
    echo true;
} catch (Exception $ex) {
    die($ex->getMessage());
}
