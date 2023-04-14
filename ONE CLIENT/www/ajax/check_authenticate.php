<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] == "POST"){
//    check has user session ?
    if (isset($_SESSION["user"])){
        echo json_encode(array("is_login"=>true,"user"=>$_SESSION["user"]));
    }else{
        echo json_encode(array("is_login"=>false,"user"=>null));
    }
    die();
}