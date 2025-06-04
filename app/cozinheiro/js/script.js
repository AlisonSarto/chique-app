var orders = [];

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

// Atualiza apenas o necessário na lista de pedidos
function updateOrders(newOrders) {
  const $ordersContainer = $('#orders-container');
  const currentOrderIds = orders.map(o => o.id);
  const newOrderIds = newOrders.map(o => o.id);

  // Remover pedidos que não existem mais
  currentOrderIds.forEach(id => {
    if (!newOrderIds.includes(id)) {
      $(`#order-${id}`).remove();
    }
  });

  // Adicionar novos pedidos
  newOrders.forEach(order => {
    if (!currentOrderIds.includes(order.id)) {
      const totalDrinks = order.drinks.length;
      const completedDrinks = order.drinks.filter(drink => drink.completed).length;
      const progress = totalDrinks > 0 ? (completedDrinks / totalDrinks) * 100 : 0;

      const $orderCard = $(`
        <div id="order-${order.id}" class="order-card bg-white rounded-xl shadow-md overflow-hidden">
          <div class="p-5">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-xl font-semibold text-gray-800">${order.customer}</h2>
              <span class="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">#${order.id}</span>
            </div>
            <div class="flex justify-between items-center mb-4">
              <span class="text-gray-500 order-time">
                <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                ${order.time}
              </span>
              <span class="text-sm font-medium">${completedDrinks}/${totalDrinks} concluídos</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div class="progress-bar bg-purple-600 h-2 rounded-full" style="width: ${progress}%"></div>
            </div>
            <ul class="space-y-2">
              ${order.drinks.map(drink => `
                <li 
                  id="drink-${drink.id}" 
                  class="drink-item ${drink.completed ? 'completed' : ''} bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                  data-drink-id="${drink.id}"
                  data-order-id="${order.id}"
                >
                  <span>${drink.nome}</span>
                  <div class="check-button">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `);
      $ordersContainer.append($orderCard);
    }
  });

  // Atualizar order.time, progresso e drinks concluídos
  newOrders.forEach(order => {
    $(`#order-${order.id} .order-time`).html(`
      <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      ${order.time}
    `);
    const totalDrinks = order.drinks.length;
    const completedDrinks = order.drinks.filter(drink => drink.completed).length;
    const progress = totalDrinks > 0 ? (completedDrinks / totalDrinks) * 100 : 0;
    $(`#order-${order.id} .progress-bar`).css('width', `${progress}%`);
    $(`#order-${order.id} .text-sm.font-medium`).text(`${completedDrinks}/${totalDrinks} concluídos`);

    // Atualizar drinks concluídos
    order.drinks.forEach(drink => {
      const $drink = $(`#drink-${drink.id}`);
      if (drink.completed) {
        $drink.addClass('completed').removeClass('swiped').css('transform', '');
      } else {
        $drink.removeClass('completed');
      }
    });
  });

  // Exibir mensagem se não houver pedidos
  if (newOrders.length === 0) {
    if ($('#no-orders-message').length === 0) {
      $ordersContainer.append(`
        <div id="no-orders-message" class="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-lg">Nenhum pedido no momento</span>
        </div>
      `);
    }
  } else {
    $('#no-orders-message').remove();
  }

  // Atualizar lista local
  orders = JSON.parse(JSON.stringify(newOrders));

  // Adicionar eventos de swipe apenas para novos itens
  setupSwipeEvents();
}

// Fetch e atualização incremental
function fetchOrders() {
  $.ajax({
    url: '/api/pedidos/view-cozinha',
    method: 'GET',
    success: function(data) {
      updateOrders(data.pedidos);
    }
  });
}

fetchOrders();
setInterval(fetchOrders, 2000);

// Atualiza o horário atual
function updateCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  $('#current-time').text(`${hours}:${minutes}`);
}

updateCurrentTime();
setInterval(updateCurrentTime, 30000);

// Evento de deslizar (swipe) para concluir drinks
function setupSwipeEvents() {
  const $drinkItems = $('.drink-item');

  $drinkItems.each(function() {
    const $item = $(this);
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    let swiped = false;

    // Touch
    $item.off('touchstart touchmove touchend'); // Evita múltiplos binds
    $item.on('touchstart', function(e) {
      if ($item.hasClass('completed')) return;
      startX = e.originalEvent.touches[0].clientX;
      isSwiping = true;
      swiped = $item.hasClass('swiped');
    });

    $item.on('touchmove', function(e) {
      if (!isSwiping) return;
      if ($item.hasClass('completed')) return; // Não faz swipe em concluído
      currentX = e.originalEvent.touches[0].clientX;
      let diff = startX - currentX;

      if (!swiped && diff > 10) {
        if (e.cancelable) e.preventDefault();
        if (diff > 60) diff = 60;
        $item.css('transform', `translateX(-${diff}px)`);
        $item.find('.check-button').css('opacity', diff / 60);
      } else if (swiped && diff < -10) {
        if (e.cancelable) e.preventDefault();
        if (diff < -60) diff = -60;
        $item.css('transform', `translateX(${-diff}px)`);
        $item.find('.check-button').css('opacity', 1 + diff / 60);
      }
    });

    $item.on('touchend', function() {
      if (!isSwiping) return;
      isSwiping = false;
      if ($item.hasClass('completed')) {
        $item.find('.check-button').css('opacity', 0);
        $item.removeClass('swiped').css('transform', '');
        return;
      }
      const diff = startX - currentX;

      if (!swiped && diff > 30) {
        $item.addClass('swiped');
      } else if (swiped && diff < -30) {
        $item.removeClass('swiped').css('transform', '');
        $item.find('.check-button').css('opacity', 0);
      } else {
        if (swiped) {
          $item.addClass('swiped').css('transform', '');
          $item.find('.check-button').css('opacity', 1);
        } else {
          $item.removeClass('swiped').css('transform', '');
          $item.find('.check-button').css('opacity', 0);
        }
      }
    });

    // Mouse (desktop)
    $item.off('mousedown');
    $item.on('mousedown', function(e) {
      if ($item.hasClass('completed')) return;
      startX = e.clientX;
      isSwiping = true;
      swiped = $item.hasClass('swiped');
    });

    $(document).off('mousemove.drink mouseup.drink');
    $(document).on('mousemove.drink', function(e) {
      if (!isSwiping) return;
      if ($item.hasClass('completed')) return; // Não faz swipe em concluído
      currentX = e.clientX;
      let diff = startX - currentX;

      if (!swiped && diff > 10) {
        if (diff > 60) diff = 60;
        $item.css('transform', `translateX(-${diff}px)`);
        $item.find('.check-button').css('opacity', diff / 60);
      } else if (swiped && diff < -10) {
        if (diff < -60) diff = -60;
        $item.css('transform', `translateX(${-diff}px)`);
        $item.find('.check-button').css('opacity', 1 + diff / 60);
      }
    });

    $(document).on('mouseup.drink', function() {
      if (!isSwiping) return;
      isSwiping = false;
      if ($item.hasClass('completed')) {
        $item.find('.check-button').css('opacity', 0);
        $item.removeClass('swiped').css('transform', '');
        return;
      }
      const diff = startX - currentX;

      if (!swiped && diff > 30) {
        $item.addClass('swiped');
      } else if (swiped && diff < -30) {
        $item.removeClass('swiped').css('transform', '');
        $item.find('.check-button').css('opacity', 0);
      } else {
        if (swiped) {
          $item.addClass('swiped').css('transform', '');
          $item.find('.check-button').css('opacity', 1);
        } else {
          $item.removeClass('swiped').css('transform', '');
          $item.find('.check-button').css('opacity', 0);
        }
      }
    });

    // Clique no botão de check
    $item.find('.check-button').off('click').on('click', function() {
      completeDrink($item.data('order-id'), $item.data('drink-id'));
    });

    // Garante que botão está oculto se concluído
    if ($item.hasClass('completed')) {
      $item.find('.check-button').css('opacity', 0);
    }
  });
}

// Função para marcar um drink como concluído
function completeDrink(orderId, drinkId) {
  orderId = parseInt(orderId);
  drinkId = parseInt(drinkId);

  // Envia requisição AJAX para marcar o drink como concluído no backend
  $.ajax({
    url: '/api/pedidos/complete-drink',
    method: 'POST',
    data: {
      order_id: orderId,
      drink_id: drinkId
    },
    success: function() {
      // Encontrar o pedido e o drink localmente
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) return;

      const drinkIndex = orders[orderIndex].drinks.findIndex(drink => drink.id === drinkId);
      if (drinkIndex === -1) return;

      // ATUALIZE O ESTADO LOCAL ANTES DE ATUALIZAR A INTERFACE
      orders[orderIndex].drinks[drinkIndex].completed = true;

      // Atualizar a interface
      const $drinkElement = $(`#drink-${drinkId}`);
      $drinkElement.addClass('completed').removeClass('swiped').css('transform', '');
      $drinkElement.find('.check-button').css('opacity', 0); // Esconde o botão imediatamente

      // Verificar se todos os drinks do pedido foram concluídos
      const allCompleted = orders[orderIndex].drinks.every(drink => drink.completed);
      
      // Atualizar o progresso
      const completedDrinks = orders[orderIndex].drinks.filter(drink => drink.completed).length;
      const totalDrinks = orders[orderIndex].drinks.length;
      const progress = totalDrinks > 0 ? (completedDrinks / totalDrinks) * 100 : 0;
      $(`#order-${orderId} .progress-bar`).css('width', `${progress}%`);
      $(`#order-${orderId} .text-sm.font-medium`).text(`${completedDrinks}/${totalDrinks} concluídos`);

      if (allCompleted) {
        // Animar a remoção do card
        const $orderCard = $(`#order-${orderId}`);
        $orderCard.addClass('removing');

        // Remover o pedido após a animação
        setTimeout(() => {
          orders.splice(orderIndex, 1);
          $orderCard.remove();

          // Se não houver mais pedidos, exibe a mensagem
          if (orders.length === 0 && $('#no-orders-message').length === 0) {
            $('#orders-container').append(`
              <div id="no-orders-message" class="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-7 4h10a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-lg">Nenhum pedido no momento</span>
              </div>
            `);
          }
        }, 500);
      }
    },
    error: function() {
      alert('Erro ao marcar o drink como concluído. Atualize a pagina.');
    }
  });
}