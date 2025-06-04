<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send(['status' => 405, 'message' => 'Método não permitido']);
  }

  $order_id = $_POST['order_id'] ?? null;
  $drink_id = $_POST['drink_id'] ?? null;

  if ($order_id === null || $drink_id === null) {
    send(['status' => 400, 'message' => 'ID do pedido ou do item não informado']);
  }

  //? Atualiza o status do item do pedido
  $sql = "UPDATE itens_pedidos SET status = 'Completo' WHERE id = '$drink_id'";
  $res = $conn->query($sql);

  if (!$res) {
    send(['status' => 500, 'message' => 'Erro ao atualizar status do item']);
  }

  //? Verifica se todos os itens do pedido estão completos
  $sql = "SELECT * FROM itens_pedidos WHERE pedido_id = '$order_id' AND status = 'Pendente'";
  $res = $conn->query($sql);

  if (!$res) {
    send(['status' => 500, 'message' => 'Erro ao verificar itens do pedido']);
  }

  if ($res->num_rows === 0) {
    //? Se todos os itens estão completos, atualiza o status do pedido
    $sql = "UPDATE pedidos SET status = 'Pronto' WHERE id = '$order_id'";
    $res = $conn->query($sql);

    if (!$res) {
      send(['status' => 500, 'message' => 'Erro ao atualizar status do pedido']);
    }
  }

  send(['status' => 200, 'message' => 'Item atualizado com sucesso']);

?>