<?php

  include $_SERVER['DOCUMENT_ROOT'] . '/funcs/config.php';

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send([
      'status' => 405,
      'message' => 'Método não permitido.'
    ]);
  }

  $loja = $_POST['loja'] ?? null;
  $funcao = $_POST['funcao'] ?? null;

  if (!$loja || !$funcao) {
    send([
      'status' => 400,
      'message' => 'Parâmetros inválidos',
    ]);
  }

  session_unset();
  session_destroy();
  session_start(); 

  $_SESSION['loja'] = $loja;
  $_SESSION['funcao'] = $funcao;

  send([
    'status' => 200,
    'message' => 'Login realizado com sucesso',
  ]);

?>