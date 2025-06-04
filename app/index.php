<?php

  session_start();

  $loja = $_SESSION['loja'] ?? null;
  $funcao = $_SESSION['funcao'] ?? null;

  if (!$loja || !$funcao) {
    header('Location: /');
    exit;
  }

  $funcao = strtolower($funcao);

  header('Location: /app/' . $funcao);

?>