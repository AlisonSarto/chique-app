<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  $loja = $_SESSION['loja'] ?? null;

  if ($loja === null) {
    send(['status' => 401, 'message' => 'Loja não informada']);
  }

  //? Puxa os drinks
  $sql = "SELECT * FROM drinks WHERE store = '$loja'";
  $res = $conn->query($sql);

  if (!$res) {
    send(['status' => 500, 'message' => 'Erro ao consultar drinks']);
  }

  $drinks = [];
  while ($row = $res->fetch_assoc()) {
    $drinks_nome[$row['id']] = $row['name'];
  }

  //? Puxa os pedidos prontos para separar
  $sql = "SELECT * FROM pedidos WHERE loja = '$loja' AND status = 'Pronto' ORDER BY created_at";
  $res = $conn->query($sql);
  
  if (!$res) {
    send(['status' => 500, 'message' => 'Erro ao consultar pedidos']);
  }

  $pedidos = [];
  while ($row = $res->fetch_assoc()) {
    $pedido_id = $row['id'];
    
    $sql_itens = "SELECT * FROM itens_pedidos WHERE pedido_id = '$pedido_id'";
    $res_itens = $conn->query($sql_itens);

    $drinks_pedidos = [];
    while ($item = $res_itens->fetch_assoc()) {
      $qtd = $item['quantidade'];
      $nome_drink = $qtd . 'x ' . $drinks_nome[$item['produto_id']];

      $completed = $item['status'] == 'Pendente' ? false : true;

      $drinks_pedidos[] = [
        'nome' => $nome_drink,
      ];
    }


    $pedidos[] = [
      'id' => $pedido_id,
      'cliente' => $row['cliente_nome'],
      'itens' => $drinks_pedidos,
    ];
  }

  send([
    'status' => 200,
    'message' => 'Pedidos prontos para separar',
    'pedidos' => $pedidos
  ]);

?>