<?php
    $api = $_POST['api'];
    $tokenx = $_POST['token'];
    if($api != "admin5ka"){
        echo('BAD API');
    }else{
        $mysql = new mysqli('localhost','u1109153_default','g!wUd8NI','u1109153_default');
        $rowMax = $mysql->query("SELECT MAX(`id`) FROM `tokens`");
        $result = $rowMax->fetch_assoc();
        $last_id = $result['MAX(`id`)'] + 1;
        $md5tokenx = md5($tokenx);
        $row = $mysql->query("INSERT INTO `tokens` (`id`, `link`, `tokenx`, `totp`, `balance`, `stickers`) VALUES ('$last_id', '$md5tokenx', '$tokenx', '', '', '')");
        echo(1);
    }
?>