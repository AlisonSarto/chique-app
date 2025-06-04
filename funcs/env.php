<?php

  function env($envName) {

    //* Define as variáveis de ambiente por ordem de prioridade
    $root = $_SERVER['DOCUMENT_ROOT'];

    //? Verifica se tem public_html no caminho (apenas em produção)
    if (strpos($root, '/public_html') !== false) {
      $root = substr($root, 0, strpos($root, '/public_html'));
    }

    $root .= '/.env.prod';

    $env = [
      "Produção" => $root,
      "Localhost" => $_SERVER['DOCUMENT_ROOT'].'/.env.local',
    ];
    
    //? Verifica se o arquivo existe
    $envFile = null;
    foreach ($env as $type => $file) {
      if (file_exists($file)) {
        $envFile = $file;
        $envType = $type;
        break;
      }
    }

    if (!$envFile) {
      echo "Arquivo .env não encontrado";
      exit;
    }

    $envContent = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    $envData = [];

    foreach ($envContent as $line) {
      if (strpos($line, '#') !== false) {
        continue;
      }
      [$key, $value] = explode('=', $line, 2);
      $envData[$key] = $value;
    }

    if (array_key_exists($envName, $envData)) {
      return $envData[$envName];
    } else {
      echo "Variável de ambiente $envName não encontrada no env $envType";
      exit;
    }
    
  }

?>