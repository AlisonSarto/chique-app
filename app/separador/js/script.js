// Dados de exemplo para os pedidos
var pedidos = [];

// Função para adicionar um pedido individual com animação de entrada
function adicionarPedido(pedido) {
  let itensHTML = '';
  $.each(pedido.itens, function (_, item) {
    itensHTML += `
      <div class="flex items-center mb-2">
        <div class="h-2 w-2 bg-indigo-500 rounded-full mr-2"></div>
        <span class="text-gray-700">${item.nome}</span>
      </div>
    `;
  });

  const cardHTML = `
    <div class="order-card bg-white rounded-xl shadow-sm overflow-hidden mb-4" id="pedido-${pedido.id}">
      <div class="p-5">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">${pedido.cliente}</h2>
            <p class="text-sm text-indigo-600 font-medium">Pedido #${pedido.id}</p>
          </div>
          <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">Pendente</span>
        </div>
        <div class="border-t border-gray-100 my-3"></div>
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Itens do pedido:</h3>
          <div class="ml-1">${itensHTML}</div>
        </div>
        <button class="entregar-btn w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors" data-pedido-id="${pedido.id}">
          Entregue
        </button>
      </div>
    </div>
  `;
  $('#orders-container').append(cardHTML);
  // Animação de entrada
  const $card = $(`#pedido-${pedido.id}`);
  $card.css({ opacity: 0, transform: 'translateY(30px) scale(0.95) rotate(-3deg)' })
    .animate({ opacity: 1 }, {
      duration: 350,
      step: function(now, fx) {
        if (fx.prop === "opacity") {
          $(this).css({
            transform: `translateY(${30 - 30 * now}px) scale(${0.95 + 0.05 * now}) rotate(${-3 + 3 * now}deg)`
          });
        }
      }
    });
}

// Função para atualizar pedidos incrementalmente
function atualizarPedidosIncremental(novosPedidos) {
  const novosIds = novosPedidos.map(p => p.id);
  const antigosIds = pedidos.map(p => p.id);

  // Adicionar novos pedidos
  novosPedidos.forEach(pedido => {
    if (!antigosIds.includes(pedido.id)) {
      adicionarPedido(pedido);
    }
  });

  // Remover pedidos que não existem mais
  pedidos.forEach(pedido => {
    if (!novosIds.includes(pedido.id)) {
      const $card = $(`#pedido-${pedido.id}`);
      // Animação de saída: gira, desliza e fade
      $card
        .css({ transform: 'scale(1) rotate(0deg)', opacity: 1 })
        .animate({ opacity: 0 }, {
          duration: 400,
          step: function(now, fx) {
            if (fx.prop === "opacity") {
              $(this).css({
                transform: `translateX(${100 * (1 - now)}px) scale(${1 - 0.1 * (1 - now)}) rotate(${10 * (1 - now)}deg)`
              });
            }
          },
          complete: function() {
            $card.slideUp(200, function() { $card.remove(); });
          }
        });
    }
  });

  // Atualiza contagem e empty state
  $('#order-count').text(`${novosPedidos.length} pedidos`);
  if (novosPedidos.length === 0) {
    $('#empty-state').show();
  } else {
    $('#empty-state').hide();
  }

  // Atualiza array local
  pedidos = [...novosPedidos];
}

// Função para buscar pedidos periodicamente
function buscarPedidos() {
  $.ajax({
    url: '/api/pedidos/view-separar',
    method: 'GET',
    success: function (data) {
      if (!data.pedidos) data.pedidos = [];
      // Só atualiza incrementalmente se houver diferença de IDs
      const novosIds = (data.pedidos || []).map(p => p.id).sort();
      const antigosIds = pedidos.map(p => p.id).sort();
      if (JSON.stringify(novosIds) !== JSON.stringify(antigosIds)) {
        atualizarPedidosIncremental(data.pedidos);
      }
    },
    error: function () {
      console.error('Erro ao carregar os pedidos.');
    }
  });
}

// Confirmar entrega de um pedido usando jQuery
function confirmarEntrega(event) {
  const $btn = $(event.target);
  const pedidoId = parseInt($btn.data('pedido-id'));
  const $card = $(`#pedido-${pedidoId}`);

  $btn.text("Processando...")
    .prop('disabled', true)
    .removeClass("bg-green-600 hover:bg-green-700")
    .addClass("bg-gray-400");

  setTimeout(() => {
    $.ajax({
      url: '/api/pedidos/finalizar',
      method: 'POST',
      data: { pedido_id: pedidoId },
      success: function () {
        // Animação de saída inovadora: gira, desliza e fade
        $card
          .css({ transform: 'scale(1) rotate(0deg)', opacity: 1 })
          .animate({ opacity: 0 }, {
            duration: 500,
            step: function(now, fx) {
              if (fx.prop === "opacity") {
                $(this).css({
                  transform: `translateX(${120 * (1 - now)}px) scale(${1 - 0.15 * (1 - now)}) rotate(${15 * (1 - now)}deg)`
                });
              }
            },
            complete: function() {
              $card.slideUp(200, function () {
                $card.remove();
                const index = pedidos.findIndex(p => p.id === pedidoId);
                if (index !== -1) {
                  pedidos.splice(index, 1);
                  $('#order-count').text(`${pedidos.length} pedidos`);
                  if (pedidos.length === 0) $('#empty-state').show();
                }
              });
            }
          });
      },
      error: function () {
        $btn.text("Erro! Tente novamente")
          .prop('disabled', false)
          .removeClass("bg-gray-400")
          .addClass("bg-green-600 hover:bg-green-700");
      }
    });
  }, 500);
}

// Inicializar a aplicação com jQuery
$(function () {
  //? Nome da loja
  $.ajax({
    url: '/api/login/verify',
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      var loja = data.loja;
      $('#nome-loja').html(loja);
    },
    error: function () {
      window.location.href = '/';
    }
  });
  buscarPedidos(); // Carrega inicialmente

  // Atualiza a cada 2 segundos
  setInterval(buscarPedidos, 2000);

  // Delegação de evento para botões dinâmicos
  $('#orders-container').on('click', '.entregar-btn', confirmarEntrega);
});