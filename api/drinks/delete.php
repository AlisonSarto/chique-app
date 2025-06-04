<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send([
      'status' => 405,
      'message' => 'Método não permitido.'
    ]);
  }

  $id = $_POST['id'] ?? null;

  if (!$id) {
    send([
      'status' => 400,
      'message' => 'Todos os campos são obrigatórios.'
    ]);
  }

  $sql = "DELETE FROM drinks WHERE id = '$id'";
  $res = $conn->query($sql);

  if (!$res) {
    send([
      'status' => 500,
      'message' => 'Erro ao deletar a bebida: ' . mysqli_error($conn)
    ]);
  }

  send([
    'status' => 200,
    'message' => 'Bebida Deletada com sucesso.'
  ]);
  
?>