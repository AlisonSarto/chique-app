<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  $loja = $_SESSION['loja'] ?? null;
  $funcao = $_SESSION['funcao'] ?? null;

  if ($loja == null || $funcao == null) {
    send([
      'status' => 403,
      'message' => 'Acesso negado. Você não está logado.'
    ]);
  } else {
    send([
      'status' => 200,
      'message' => 'Usuário verificado.',
      'loja' => $loja,
      'funcao' => $funcao
    ]);
  }

?>