<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send([
      'status' => 405,
      'message' => 'Método não permitido.'
    ]);
  }
  
  $id = $_POST['id'] ?? null;
  $name = $_POST['name'] ?? null;
  $store = $_POST['store'] ?? null;
  $price = $_POST['price'] ?? null;
  $cost = $_POST['cost'] ?? null;
  $image = $_POST['image'] ?? null;

  if (!$id || !$name || !$store || !$price || !$cost || !$image) {
    send([
      'status' => 400,
      'message' => 'Todos os campos são obrigatórios.'
    ]);
  }

  $sql = "UPDATE drinks SET 
            name = '" . mysqli_real_escape_string($conn, $name) . "',
            store = '" . mysqli_real_escape_string($conn, $store) . "',
            price = '" . mysqli_real_escape_string($conn, $price) . "',
            cost = '" . mysqli_real_escape_string($conn, $cost) . "',
            image = '" . mysqli_real_escape_string($conn, $image) . "'
          WHERE id = " . intval($id);
  $res = $conn->query($sql);

  if (!$res) {
    send([
      'status' => 500,
      'message' => 'Erro ao editar a bebida: ' . mysqli_error($conn)
    ]);
  }

  send([
    'status' => 200,
    'message' => 'Bebida editada com sucesso.'
  ]);
  
?>