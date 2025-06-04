let drinks = [];

const storeNames = {
  "Drinks Clássicos": "Drinks Clássicos",
  "Drinks Temáticos": "Drinks Temáticos",
  "Drinks Shakes": "Drinks Shakes"
};

let drinkToDelete = null;

$(document).ready(function () {

  $.ajax({
    url: '/api/drinks/view',
    method: 'GET',
    dataType: 'json',
    data: {
      admin: true
    },
    success: function (data) {
      drinks = data.drinks.map(drink => ({
        id: drink.id,
        name: drink.name,
        store: drink.store,
        price: parseFloat(drink.price),
        cost: parseFloat(drink.cost),
        image: drink.image || "https://placehold.co/1080"
      }));

      renderDrinks();
    },
    error: function (xhr, status, error) {
      console.error('Error fetching drinks:', error);
      $('#noResults').removeClass('hidden');
    }
  });

  $('#storeFilter').on('change', renderDrinks);

  $('#addDrinkBtn').on('click', function () {
    $('#modalTitle').text('Adicionar Bebida');
    $('#drinkForm')[0].reset();
    $('#drinkId').val('');
    $('#imagePreview').addClass('hidden');
    showModal($('#drinkModal'));
  });

  $('#closeModal, #cancelBtn').on('click', function () {
    hideModal($('#drinkModal'));
  });

  $('#cancelDelete').on('click', function () {
    hideModal($('#deleteModal'));
  });

  $('#imageUpload').on('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $('#previewImg').attr('src', e.target.result);
        $('#drinkImage').val(e.target.result);
        $('#imagePreview').removeClass('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  $('#drinkImage').on('input', function () {
    if ($(this).val()) {
      $('#previewImg').attr('src', $(this).val());
      $('#imagePreview').removeClass('hidden');
    } else {
      $('#imagePreview').addClass('hidden');
    }
  });

  $('#drinkForm').on('submit', function (e) {
    e.preventDefault();
    $('.text-red-500').addClass('hidden');
    let isValid = true;

    if (!$('#drinkName').val().trim()) {
      $('#nameError').removeClass('hidden');
      isValid = false;
    }
    if (!$('#drinkStore').val()) {
      $('#storeError').removeClass('hidden');
      isValid = false;
    }
    if (!$('#drinkPrice').val() || parseFloat($('#drinkPrice').val()) < 0) {
      $('#priceError').removeClass('hidden');
      isValid = false;
    }
    if (!$('#drinkCost').val() || parseFloat($('#drinkCost').val()) < 0) {
      $('#costError').removeClass('hidden');
      isValid = false;
    }
    if (!$('#drinkImage').val()) {
      $('#imageError').removeClass('hidden');
      isValid = false;
    }
    if (!isValid) return;

    const drink = {
      id: $('#drinkId').val() ? parseInt($('#drinkId').val()) : null,
      name: $('#drinkName').val().trim(),
      store: $('#drinkStore').val(),
      price: parseFloat($('#drinkPrice').val()),
      cost: parseFloat($('#drinkCost').val()),
      image: $('#drinkImage').val()
    };

    if ($('#drinkId').val()) {
      //? EDITAR BEBIDA
      $.ajax({
        url: '/api/drinks/update',
        method: 'POST',
        data: drink,
        success: function (data) {
          showToast('Bebida atualizada com sucesso!');
          hideModal($('#drinkModal'));
          reloadDrinks();
        },
        error: function () {
          showToast('Erro ao atualizar bebida!');
        }
      });
      const index = drinks.findIndex(d => d.id === parseInt($('#drinkId').val()));
      if (index !== -1) {
        drinks[index] = drink;
        showToast('Bebida atualizada com sucesso!');
      }
    } else {
      //? ADICIONAR BEBIDA
      $.ajax({
        url: '/api/drinks/create',
        method: 'POST',
        data: drink,
        success: function (data) {
          showToast('Bebida cadastrada com sucesso!');
          hideModal($('#drinkModal'));
          reloadDrinks();
        },
        error: function (error) {
          console.error('Erro ao cadastrar bebida:', error);
          showToast('Erro ao cadastrar bebida!');
        }
      });
    }

    hideModal($('#drinkModal'));
    renderDrinks();
  });

  $('#confirmDelete').on('click', function () {
    if (drinkToDelete !== null) {
      //? EXCLUIR BEBIDA
      $.ajax({
        url: '/api/drinks/delete',
        method: 'POST',
        data: {
          id: drinkToDelete
        },
        success: function (data) {
          drinkToDelete = null;
          hideModal($('#deleteModal'));
          showToast('Bebida excluída com sucesso!');
          reloadDrinks();
        },
        error: function () {
          showToast('Erro ao excluir bebida!');
        }
      });
    }
  });
});

function reloadDrinks() {
  $.ajax({
    url: '/api/drinks/view',
    method: 'GET',
    dataType: 'json',
    data: {
      admin: true
    },
    success: function (data) {
      drinks = data.drinks.map(drink => ({
        id: drink.id,
        name: drink.name,
        store: drink.store,
        price: parseFloat(drink.price),
        cost: parseFloat(drink.cost),
        image: drink.image || "https://placehold.co/1080"
      }));
      renderDrinks();
    },
    error: function () {
      $('#noResults').removeClass('hidden');
    }
  });
}

function renderDrinks() {
  const selectedStore = $('#storeFilter').val();
  const filteredDrinks = selectedStore === 'all'
    ? drinks
    : drinks.filter(drink => drink.store === selectedStore);

  $('#drinksList').empty();

  if (filteredDrinks.length === 0) {
    $('#noResults').removeClass('hidden');
  } else {
    $('#noResults').addClass('hidden');
    filteredDrinks.forEach(drink => {
      const storeColorClass = {
        'Drinks Clássicos': 'bg-blue-100 text-blue-800',
        'Drinks Temáticos': 'bg-purple-100 text-purple-800',
        'Drinks Shakes': 'bg-green-100 text-green-800'
      }[drink.store];

      const card = $(`
          <div class="bg-white rounded-xl shadow-md overflow-hidden card-hover transition-all duration-300">
            <div class="relative">
              <img src="${drink.image}" alt="${drink.name}" class="w-full h-48 object-cover">
              <span class="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${storeColorClass}">
                ${storeNames[drink.store]}
              </span>
            </div>
            <div class="p-5">
              <h3 class="text-xl font-bold text-gray-800 mb-2">${drink.name}</h3>
              <div class="flex justify-between mb-4">
                <div>
                  <p class="text-sm text-gray-600">Valor de venda</p>
                  <p class="text-lg font-semibold text-gray-800">R$ ${drink.price.toFixed(2)}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Custo</p>
                  <p class="text-lg font-semibold text-gray-800">R$ ${drink.cost.toFixed(2)}</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button class="edit-btn flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 rounded-lg transition-colors duration-300" data-id="${drink.id}">
                  <i class="fas fa-edit mr-1"></i> Editar
                </button>
                <button class="delete-btn flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg transition-colors duration-300" data-id="${drink.id}" data-name="${drink.name}">
                  <i class="fas fa-trash-alt mr-1"></i> Excluir
                </button>
              </div>
            </div>
          </div>
        `);

      $('#drinksList').append(card);
    });

    // Delegated events for dynamic content
    $('#drinksList').off('click', '.edit-btn').on('click', '.edit-btn', function () {
      const id = parseInt($(this).data('id'));
      editDrink(id);
    });

    $('#drinksList').off('click', '.delete-btn').on('click', '.delete-btn', function () {
      const id = parseInt($(this).data('id'));
      const name = $(this).data('name');
      confirmDeleteDrink(id, name);
    });
  }
}

function editDrink(id) {
  id = parseInt(id);
  const drink = drinks.find(d => d.id == id);
  if (drink) {
    $('#modalTitle').text('Editar Bebida');
    $('#drinkId').val(drink.id);
    $('#drinkName').val(drink.name);
    $('#drinkStore').val(drink.store);
    $('#drinkPrice').val(drink.price);
    $('#drinkCost').val(drink.cost);
    $('#drinkImage').val(drink.image);
    $('#previewImg').attr('src', drink.image);
    $('#imagePreview').removeClass('hidden');
    showModal($('#drinkModal'));
  }
}

function confirmDeleteDrink(id, name) {
  drinkToDelete = id;
  $('#deleteDrinkName').text(name);
  showModal($('#deleteModal'));
}

function showModal($modal) {
  $modal.removeClass('hidden');
  setTimeout(() => {
    $modal.addClass('opacity-100');
  }, 10);
  $('body').css('overflow', 'hidden');
}

function hideModal($modal) {
  $modal.removeClass('opacity-100');
  setTimeout(() => {
    $modal.addClass('hidden');
    $('body').css('overflow', '');
  }, 300);
}

function showToast(message) {
  $('#toastMessage').text(message);
  $('#toast').addClass('show');
  setTimeout(() => {
    $('#toast').removeClass('show');
  }, 3000);
}
