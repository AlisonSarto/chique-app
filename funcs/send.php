<?php

  function send($message) {
    header('Content-Type: application/json;');
    http_response_code($message['status'] ?? 200);
    echo json_encode($message, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
  }

?>