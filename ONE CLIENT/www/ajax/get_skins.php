<?php

$user_id = $_POST["user_id"];

require_once "../app/db.php";

$query = $db->prepare("SELECT path from images where user_id = ? AND expire_at >= NOW()");
$query->execute([$user_id]);
echo json_encode($query->fetchAll());
die();
