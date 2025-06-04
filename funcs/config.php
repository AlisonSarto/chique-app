<?php

  session_start();

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/env.php';
  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/send.php';

  $dbHost = env('DB_HOST');
  $dbUsername = env('DB_USER');
  $dbPassword = env('DB_PASS');
  $dbName = env('DB_NAME');

  $conn = new mysqli($dbHost,$dbUsername,$dbPassword,$dbName);

?>