<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send([
      'status' => 405,
      'message' => 'Método não permitido.',
    ]);
  }

  $loja = $_SESSION['loja'] ?? null;

  if ($loja == null) {
    send([
      'status' => 404,
      'message' => 'Faça login para continuar.',
    ]);
  }

  $phone = $_POST['phone'] ?? null;
  $name = $_POST['name'] ?? null;
  $pedido = $_POST['pedido'] ?? null;
  $valor_total = $_POST['valor_total'] ?? null;
  $forma_pagamento = $_POST['forma_pagamento'] ?? null;
  $now = date('Y-m-d H:i:s');

  if (!$phone || !$name || !$pedido || !$valor_total || !$forma_pagamento) {
    send([
      'status' => 400,
      'message' => 'Todos os campos são obrigatórios.',
    ]);
  }
  
  //? Cria o pedido
  $sql = "INSERT INTO pedidos (loja, cliente_phone, cliente_nome, status, valor_total, created_at) VALUES ('$loja', '$phone', '$name', 'Pendente', '$valor_total', '$now')";
  $res = $conn->query($sql);

  if (!$res) {
    send([
      'status' => 500,
      'message' => 'Erro ao criar o pedido: ' . $conn->error,
    ]);
  }

  //? Pega o ID do pedido criado
  $pedido_id = $conn->insert_id;
  if (!$pedido_id) {
    send([
      'status' => 500,
      'message' => 'Erro ao obter o ID do pedido.',
    ]);
  }

  //? Cria os itens do pedido
  $sql = "";
  foreach ($pedido as $item) {
    $produto_id = $item['id'] ?? null;
    $quantidade = $item['quantidade'] ?? null;
    if (!$produto_id || !$quantidade) {
      send([
        'status' => 400,
        'message' => 'Todos os itens do pedido devem ter produto_id e quantidade.',
      ]);
    }

    $sql .= "INSERT INTO itens_pedidos (pedido_id, produto_id, quantidade, status) VALUES ('$pedido_id', '$produto_id', '$quantidade', 'Pendente');";
  }

  $res = $conn->multi_query($sql);

  if (!$res) {
    send([
      'status' => 500,
      'message' => 'Erro ao criar os itens do pedido: ' . $conn->error,
    ]);
  }

  // Libera todos os resultados da multi_query antes de continuar
  do {
    if ($result = $conn->store_result()) {
      $result->free();
    }
  } while ($conn->more_results() && $conn->next_result());

  $fidelidade = [];
  $ganhou_brinde = false;
  if ($phone != "anonimo") {

    //? Atualiza o status da fidelidade
    $sql = "UPDATE customers SET `$loja` = 'true' WHERE phone = '$phone'";
    $res = $conn->query($sql);

    //? Puxa o status da fidelidade
    $sql = "SELECT * FROM customers WHERE phone = '$phone'";
    $res = $conn->query($sql);

    $customer = $res->fetch_assoc();

    $tipos = ['Drinks Clássicos', 'Drinks Temáticos', 'Drinks Shakes'];
    foreach ($tipos as $tipo) {
      if (!empty($customer[$tipo]) && $customer[$tipo] === 'true') {
        $fidelidade[] = $tipo;
      }
    }

    //? Se completou as 3 lojas e ainda não ganhou o brinde, marca como recebido
    if (count($fidelidade) === 3 && ($customer['fidelidade_brinde'] ?? 'false') === 'false') {
      $sql = "UPDATE customers SET fidelidade_brinde = 'true' WHERE phone = '$phone'";
      $conn->query($sql);
      $ganhou_brinde = true;
    }
  }
  
  send([
    'status' => 200,
    'message' => 'Pedido criado com sucesso.',
    'pedido_id' => $pedido_id,
    'fidelidade' => $fidelidade,
    'ganhou_brinde' => $ganhou_brinde,
  ]);

?>