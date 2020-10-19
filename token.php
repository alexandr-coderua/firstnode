<?php
if(isset($_GET['m'])){
    $method = $_GET['m'];
}
$mysql = new mysqli('localhost','root','','5ka');
if($method == "getData"){
    if(isset($_GET['t'])){
        $token = $_GET['t'];
        $row = $mysql->query("SELECT * FROM `tokens` WHERE `link` LIKE '$token'");
        $result = $row->fetch_assoc();
        $tokenx = $result['tokenx'];
        if($result != ""){
            $curl = curl_init();
            curl_setopt_array($curl, array(
            CURLOPT_URL => "https://my.5ka.ru/api/v1/startup/handshake",
            CURLOPT_RETURNTRANSFER => true,
            //CURLOPT_PROXY => 'http://zproxy.lum-superproxy.io:22225@lum-customer-hl_7000f344-zone-static-country-ru:0ift2lobao4f',
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
                "X-Authorization: ".$tokenx,
                "Content-Type: application/json;charset=UTF-8",
                "Cookie: "
            ),
        ));
        $response = curl_exec($curl);
        print_r($response);
        curl_close($curl);
                }
            }
        }
        if($response == ""){
            $tokenx = $result['tokenx'];
            $totp = $result['totp'];
            $card = $result['card'];
            $balance = $result['balance'];
            $stickers = $result['stickers'];
        }
        echo('{ balance: '.$balance.', stickers: '.$stickers.'}');
$rowMax = $mysql->query("SELECT MAX(`id`) FROM `tokens`");
$result = $rowMax->fetch_assoc();
$last_id = $result['MAX(`id`)'] + 1;
if($method == "updateData"){
}
?>