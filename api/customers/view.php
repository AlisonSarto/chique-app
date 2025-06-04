<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  $id = $_GET['id'] ?? null; //TODO: Implement ID-based filtering

  $sql = "SELECT * FROM customers";
  $res = $conn->query($sql);

  if ($res->num_rows == 0) {
    send([
      'status' => 200,
      'message' => 'Nenhum cliente encontrada.',
      'customers' => []
    ]);
  }

  $customers = [];
  while ($row = $res->fetch_assoc()) {
    $fidelidade = [];
    $tipos = ['Drinks Clássicos', 'Drinks Temáticos', 'Drinks Shakes'];
    foreach ($tipos as $tipo) {
      if (!empty($row[$tipo]) && $row[$tipo] === 'true') {
        $fidelidade[] = $tipo;
      }
    }
    $customers[$row['phone']] = [
      'name' => $row['name'],
      'fidelidade' => $fidelidade,
    ];
  }

  send([
    'status' => 200,
    'message' => 'Clientes encontradas.',
    'customers' => $customers
  ]);

  
?>