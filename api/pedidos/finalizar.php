<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send(['status' => 405, 'message' => 'Método não permitido']);
  }

  $pedido_id = $_POST['pedido_id'] ?? null;

  if ($pedido_id === null) {
    send(['status' => 400, 'message' => 'ID do pedido não informado']);
  }

  //? Atualiza o status do pedido para "Entregue"
  $sql = "UPDATE pedidos SET status = 'Entregue' WHERE id = '$pedido_id'";
  $res = $conn->query($sql);

  if (!$res) {
    send(['status' => 500, 'message' => 'Erro ao atualizar status do pedido']);
  }

  send(['status' => 200, 'message' => 'Pedido finalizado com sucesso']);

?>