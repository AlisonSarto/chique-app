<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send(['status' => 405, 'message' => 'Método inválido']);
  }

  // Lê o JSON do corpo da requisição
  $input = file_get_contents('php://input');
  $data = json_decode($input, true);

  if (!$data) {
    send(['status' => 400, 'message' => 'JSON inválido']);
  }

  $cliente_phone = $data['cliente_phone'] ?? null;
  $cliente_nome = $data['cliente_nome'] ?? null;
  $qtd = $data['qtd'] ?? null;

  //? Calcula o valor total
  $sql = "SELECT * FROM drinks WHERE id = 9999";
  $res = $conn->query($sql);

  if (!$res) {
    send(['status' => 500, 'message' => 'Erro ao buscar bebida especial: ' . mysqli_error($conn)]);
  }

  $drink = $res->fetch_assoc();
  $vlr_total = $drink['price'] * $qtd;
  $created_at = date('Y-m-d H:i:s');

  //? Insere o pedido no banco de dados
  $sql = "INSERT INTO pedidos (loja, cliente_phone, cliente_nome, status, valor_total, created_at) VALUES ('Drinks Clássicos', '$cliente_phone', '$cliente_nome', 'Pendente', '$vlr_total', '$created_at')";
  $res = $conn->query($sql);

  if (!$res) {
    send([
      'status' => 500,
      'message' => 'Erro ao criar o pedido: ' . $conn->error,
    ]);
  }

  //? Pega o ID do pedido criado
  $pedido_id = (int) $conn->insert_id;
  if (!$pedido_id) {
    send([
      'status' => 500,
      'message' => 'Erro ao obter o ID do pedido.',
    ]);
  }

  //? Cria os itens do pedido
  $sql = "INSERT INTO itens_pedidos (pedido_id, produto_id, quantidade, status) VALUES ($pedido_id, 9999, $qtd, 'Pendente')";
  $res = $conn->query($sql);

  if (!$res) {
    send(['status' => 500, 'message' => 'Erro ao criar os itens do pedido: ' . mysqli_error($conn)]);
  }

  send([
    'status' => 200,
    'message' => 'Pedido criado com sucesso.'
  ]);

?>