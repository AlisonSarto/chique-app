<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  $id = $_GET['id'] ?? null; //TODO: Implement ID-based filtering

  $admin = $_GET['admin'] ?? false;
  
  $loja = $_SESSION['loja'] ?? null;

  if ($admin) {
    $sql = "SELECT * FROM drinks";
  } elseif ($loja != null) {
    $sql = "SELECT * FROM drinks WHERE store = '$loja'";
  } else {
    $sql = "SELECT * FROM drinks";
  }

  $res = $conn->query($sql);
  $drinks = $res->fetch_all(MYSQLI_ASSOC);

  if ($res->num_rows == 0) {
    send([
      'status' => 200,
      'message' => 'Nemhuma bebida encontrada.',
      'drinks' => []
    ]);
  }

  send([
    'status' => 200,
    'message' => 'Bebidas encontradas.',
    'drinks' => $drinks
  ]);

  
?>