<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send([
      'status' => 405,
      'message' => 'Método não permitido.'
    ]);
  }
  
  $name = $_POST['name'] ?? null;
  $phone = $_POST['phone'] ?? null;

  if (!$name || !$phone) {
    send([
      'status' => 400,
      'message' => 'Todos os campos são obrigatórios.',
    ]);
  }

  $sql = "INSERT INTO customers (name, phone) VALUES ('$name', '$phone')";
  $res = $conn->query($sql);

  if (!$res) {
    send([
      'status' => 500,
      'message' => 'Erro ao criar cliente: ' . mysqli_error($conn)
    ]);
  }

  send([
    'status' => 200,
    'message' => 'Cliente criada com sucesso.'
  ]);
  
?>