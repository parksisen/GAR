<?php
session_start();
error_reporting(1);
$skin_upload = $_FILES["skin"]["tmp_name"];
$filename = $_FILES["skin"]["name"];
$dir_path = realpath(dirname(getcwd())) . "/skins/" . $filename;


$user_id = (int)$_POST["user_id"];

//create if not exit,
//notice : just use in window local test
//if (!file_exists($dir_path)){
//    mkdir($dir_path,0777,true);
//}

//require_once "app/db.php";


require_once "../app/db.php";

if (move_uploaded_file($skin_upload, $dir_path)) {
    $user_coins = $db->prepare("select * from users where id = :user_id");

    $coins = array();

    $create_image = $db->prepare("INSERT INTO images(path,user_id,expire_at) value(:path,:user_id,DATE_ADD(NOW(),INTERVAL 1 MONTH))");

    try {
        $create_image->execute(array(
            ":path" =>"./skins/" . $filename,
            ":user_id" => $user_id,
        ));
    } catch (Exception $ex) {
//        err here!
        echo $ex->getMessage();
        die();
    }

    try {
        $user_coins->execute(array(
            ":user_id" => $user_id
        ));

        $db_coins = (int)$user_coins->fetch()["coins"];

        $coins = max($db_coins - 1, 0);

        $update_coins = $db->prepare("UPDATE users set coins = ? where id = ?");

        $update_coins->execute([$coins,$user_id]);

        $_SESSION["user"]["coins"] = $coins;

        echo json_encode(array("upload" => true));
    }catch (Exception $exception){
        die($ex->getMessage());
    }
} else {
    echo json_encode(array("upload" => false));
}
die();