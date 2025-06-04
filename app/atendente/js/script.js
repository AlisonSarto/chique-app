var drinks = [];
var customers = {}

$(document).ready(function () {

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

  //? Drinks
  $.ajax({
    url: '/api/drinks/view',
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      var dataDrinks = data.drinks;

      drinks = dataDrinks.map(drink => ({
        id: Number(drink.id),
        name: drink.name,
        price: Number(drink.price).toFixed(2),
        image: drink.image
      }));
    }
  });

  //? Clientes
  $.ajax({
    url: '/api/customers/view',
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      customers = data.customers;
    }
  });

});

let currentCustomer = null;
let currentOrder = [];
let selectedPaymentMethod = null;

function showPage(pageNumber) {
  $('.page').removeClass('active').eq(pageNumber - 1).addClass('active');
}

// Atualizar data/hora
function updateDateTime() {
  const now = new Date();
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  $('#current-time').text(now.toLocaleTimeString('pt-BR', timeOptions));
}
updateDateTime();
setInterval(updateDateTime, 60000);

// Buscar cliente
$('#search-customer').on('click', function () {
  const customerNumber = String($('#customer-number').val().trim());
  if (customers[customerNumber]) {
    currentCustomer = { phone: customerNumber, ...customers[customerNumber] };
    $('#customer-found').removeClass('hidden');
    $('#customer-not-found').addClass('hidden');
    $('#customer-name-display').text(currentCustomer.name);
    $('#customer-visits-display').text(`Visitas: ${currentCustomer.visits}`);
  } else {
    currentCustomer = null;
    $('#customer-found').addClass('hidden');
    $('#customer-not-found').removeClass('hidden');
  }
});

// Pedido sem cadastro
$('#continue-without-registration').on('click', function () {
  currentCustomer = { phone: 'anonimo', name: 'Cliente não cadastrado', visits: 0 };
  $('#customer-name-header').text(currentCustomer.name);
  $('#customer-found').addClass('hidden');
  $('#customer-not-found').addClass('hidden');
  loadDrinks();
  showPage(2);
});

// Continuar para bebidas
$('#continue-to-drinks').on('click', function () {
  if (!currentCustomer && $('#customer-not-found').hasClass('hidden')) {
    alert('Por favor, busque um cliente ou cadastre um novo.');
    return;
  }
  if (!currentCustomer) {
    // Cadastro de novo cliente
    const newName = $('#new-customer-name').val().trim();
    if (!newName) {
      alert('Por favor, digite o nome do cliente.');
      return;
    }
    const newPhone = String($('#customer-number').val().trim());

    $.ajax({
      url: '/api/customers/create',
      method: 'POST',
      data: {
        'phone': newPhone,
        'name': newName,
      },
      success: function (data) {
        currentCustomer = { phone: newPhone, name: newName, visits: 0 };
        customers[newPhone] = { name: newName, visits: 0 };
        $('#customer-name-header').text(currentCustomer.name);
        loadDrinks();
        showPage(2);
      },
      error: function (err) {
        console.error('Erro ao cadastrar cliente:', err);
        alert('Erro ao cadastrar cliente. Tente novamente.');
        return;
      }
    });
  } else {
    // Cliente já cadastrado
    $('#customer-name-header').text(currentCustomer.name);
    loadDrinks();
    showPage(2);
  }

});

// Carregar bebidas com fotos
function loadDrinks() {
  const $container = $('#page-2 .grid');
  $container.empty();
  drinks.forEach(drink => {
    const $card = $(`
          <div class="drink-card relative bg-white rounded-lg shadow-md overflow-hidden border border-gray-200" data-id="${drink.id}">
            <div class="p-4">
              <div class="h-40 flex items-center justify-center mb-4">
                <img src="${drink.image}" alt="${drink.name}" class="object-cover h-36 w-36 rounded-lg shadow" />
              </div>
              <h3 class="text-lg font-medium text-gray-800">${drink.name}</h3>
              <p class="text-indigo-600 font-bold">R$ ${drink.price}</p>
              <div class="quantity-controls mt-3 flex items-center justify-between">
                <button class="decrease-btn bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center">
                  <span>-</span>
                </button>
                <span class="quantity-display text-gray-800 font-medium">0</span>
                <button class="increase-btn bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                  <span>+</span>
                </button>
              </div>
            </div>
          </div>
        `);
    $container.append($card);
  });

  // Eventos de quantidade
  $container.find('.decrease-btn').on('click', function () {
    const $card = $(this).closest('.drink-card');
    const id = parseInt($card.data('id'));
    const drink = drinks.find(d => d.id === id);
    const $qty = $card.find('.quantity-display');
    let qty = parseInt($qty.text());
    if (qty > 0) {
      qty--;
      $qty.text(qty);
      updateOrder(drink, qty);
    }
  });
  $container.find('.increase-btn').on('click', function () {
    const $card = $(this).closest('.drink-card');
    const id = parseInt($card.data('id'));
    const drink = drinks.find(d => d.id === id);
    const $qty = $card.find('.quantity-display');
    let qty = parseInt($qty.text());
    qty++;
    $qty.text(qty);
    updateOrder(drink, qty);
  });
}

function updateOrder(drink, quantity) {
  const idx = currentOrder.findIndex(item => item.id === drink.id);
  if (idx !== -1) {
    if (quantity === 0) currentOrder.splice(idx, 1);
    else currentOrder[idx].quantity = quantity;
  } else if (quantity > 0) {
    currentOrder.push({ id: drink.id, name: drink.name, price: drink.price, quantity });
  }
  updateOrderSummary();
}

function updateOrderSummary() {
  if (currentOrder.length === 0) {
    $('#order-summary').html('<p class="italic text-gray-500">Nenhum item selecionado</p>');
    $('#total-price').text('R$ 0,00');
    return;
  }
  let total = 0;
  let html = '<ul class="space-y-2">';
  currentOrder.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `<li class="flex justify-between"><span>${item.quantity}x ${item.name}</span><span>R$ ${itemTotal.toFixed(2)}</span></li>`;
  });
  html += '</ul>';
  $('#order-summary').html(html);
  $('#total-price').text(`R$ ${total.toFixed(2)}`);
}

$('#back-to-customer').on('click', function () { showPage(1); });

$('#continue-to-payment').on('click', function () {
  if (currentOrder.length === 0) {
    alert('Por favor, selecione pelo menos uma bebida.');
    return;
  }
  let total = 0;
  let html = '<ul class="space-y-2">';
  currentOrder.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `<li class="flex justify-between"><span>${item.quantity}x ${item.name}</span><span>R$ ${itemTotal.toFixed(2)}</span></li>`;
  });
  html += '</ul>';
  $('#final-order-summary').html(html);
  $('#final-total-price').text(`R$ ${total.toFixed(2)}`);
  $('.payment-option').removeClass('border-indigo-600 bg-indigo-50');
  selectedPaymentMethod = null;
  showPage(3);
});

$('.payment-option').on('click', function () {
  $('.payment-option').removeClass('border-indigo-600 bg-indigo-50');
  $(this).addClass('border-indigo-600 bg-indigo-50');
  selectedPaymentMethod = $(this).data('payment');
});

$('#back-to-drinks').on('click', function () { showPage(2); });

$('#confirm-order').on('click', function () {
  if (!selectedPaymentMethod) {
    alert('Por favor, selecione uma forma de pagamento.');
    return;
  }

  // Preparar dados do pedido
  const data = {
    phone: currentCustomer.phone,
    name: currentCustomer.name,
    pedido: currentOrder.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantidade: item.quantity
    })),
    valor_total: currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
    forma_pagamento: selectedPaymentMethod,
  }
  console.log('Dados do pedido:', data);

  // Enviar pedido para o servidor
  $fidelidade = [];
  $.ajax({
    url: '/api/pedidos/create',
    method: 'POST',
    async: false,
    data: data,
    success: function (response) {
      console.log('Pedido enviado com sucesso:', response);
      currentCustomer.lojasVisitadas = response.fidelidade;
    },
    error: function (err) {
      console.error('Erro ao enviar pedido:', err);
    }
  });

  if (currentCustomer && currentCustomer.phone !== 'anonimo') {
    // Lojas do programa de fidelidade
    const lojasFidelidade = [
      { nome: 'Drinks Clássicos', cor: 'bg-indigo-600' },
      { nome: 'Drinks Temáticos', cor: 'bg-pink-500' },
      { nome: 'Drinks Shakes', cor: 'bg-yellow-400' }
    ];

    // Verifica se já completou as 3 lojas
    const completouFidelidade = lojasFidelidade.every(loja => currentCustomer.lojasVisitadas.includes(loja.nome));

    $('#loyalty-info').removeClass('hidden');
    if (completouFidelidade) {
      $('#loyalty-message').text('Parabéns! Você ganhou uma bebida grátis por visitar todas as lojas!');
    } else {
      const faltam = lojasFidelidade.filter(loja => !currentCustomer.lojasVisitadas.includes(loja.nome));
      $('#loyalty-message').text(`Faltam ${faltam.length} loja(s) para ganhar uma bebida grátis!`);
    }
    $('#loyalty-stamps').empty();
    lojasFidelidade.forEach(loja => {
      const visitou = currentCustomer.lojasVisitadas.includes(loja.nome);
      $('#loyalty-stamps').append(`
          <div class="flex flex-col items-center mx-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold ${loja.cor}">
              ${visitou ? '✔️' : ''}
            </div>
            <span class="text-xs mt-1 text-gray-700 text-center" style="width:70px">${loja.nome}</span>
          </div>
        `);
    });
  } else {
    // Cliente não cadastrado, não exibir informações de fidelidade
    $('#loyalty-info').addClass('hidden');
  }
  $('#success-message').removeClass('hidden');
  $('#error-message').addClass('hidden');
  showPage(4);
});

$('#new-order').on('click', function () {
  currentCustomer = null;
  currentOrder = [];
  selectedPaymentMethod = null;
  $('#order-summary').html('<p class="italic text-gray-500">Nenhum item selecionado</p>');
  $('#total-price').text('R$ 0,00');
  $('#customer-number').val('');
  $('#customer-found').addClass('hidden');
  $('#customer-not-found').addClass('hidden');
  $('#new-customer-name').val('');
  showPage(1);
});

$('#try-again').on('click', function () { showPage(3); });

