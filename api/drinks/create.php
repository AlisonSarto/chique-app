<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send([
      'status' => 405,
      'message' => 'Método não permitido.'
    ]);
  }
  
  $name = $_POST['name'] ?? null;
  $store = $_POST['store'] ?? null;
  $price = $_POST['price'] ?? null;
  $cost = $_POST['cost'] ?? null;
  $image = $_POST['image'] ?? null;

  if (!$name || !$store || !$price || !$cost || !$image) {
    send([
      'status' => 400,
      'message' => 'Todos os campos são obrigatórios.'
    ]);
  }

  $sql = "INSERT INTO drinks (name, store, price, cost, image) VALUES ('$name', '$store', '$price', '$cost', '$image')";
  $res = $conn->query($sql);

  if (!$res) {
    send([
      'status' => 500,
      'message' => 'Erro ao criar bebida: ' . mysqli_error($conn)
    ]);
  }

  send([
    'status' => 200,
    'message' => 'Bebida criada com sucesso.'
  ]);
  
?>