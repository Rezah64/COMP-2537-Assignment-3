const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let types = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  let startPage, endPage;
  if (numPages <= 5) {
    startPage = 1;
    endPage = numPages;
  } else {
    if (currentPage <= 3) {
      startPage = 1;
      endPage = 5;
    } else if (currentPage >= numPages - 2) {
      startPage = numPages - 4;
      endPage = numPages;
    } else {
      startPage = currentPage - 2;
      endPage = currentPage + 2;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons ${i === currentPage ? 'active' : ''}" value="${i}">${i}</button>
    `)
  }

  if (currentPage > 1) {
    $('#pagination').prepend(`
      <button class="btn btn-primary page ml-1 prevButton" value="${currentPage - 1}">Prev</button>
    `)
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 nextButton" value="${currentPage + 1}">Next</button>
    `)
  }
}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
}




const setup = async () => {
  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

 

  const totalCount = response.data.results.length;
  document.getElementById('totalPokemon').textContent = totalCount;
  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)

  // Fetch Pokemon types and display them as checkboxes
  const typeResponse = await axios.get('https://pokeapi.co/api/v2/type');
  types = typeResponse.data.results.map(type => type.name);
 
  const typeCheckboxes = types.map(type => `
    <div class="form-check">
      <input class="form-check-input typeCheckbox" type="checkbox" name="typeFilter" value="${type}">
      <label class="form-check-label">
        ${type}
      </label>
    </div>
  `).join('');
  $('#typeFilter').html(`
    <h3>Pokemon Types:</h3>
    ${typeCheckboxes}
  `);

  // add event listener to type checkboxes
  $('body').on('click', '.typeCheckbox', async function (e) {
    const selectedTypes = $('input[name="typeFilter"]:checked').map((_, el) => el.value).get()
    $('#pokeCards').empty()
    if (selectedTypes.length === 0) {
      paginate(currentPage, PAGE_SIZE, pokemons)
    } else {
      const filteredPokemons = await Promise.all(pokemons.map(async (pokemon) => {
        const res = await axios.get(pokemon.url)
        const pokemonTypes = res.data.types.map(type => type.type.name)
        return {
          ...pokemon,
          types: pokemonTypes
        }
      })).then(pokemons => {
        return pokemons.filter(pokemon => {
          return selectedTypes.every(type => pokemon.types.includes(type))
        })
      })
      paginate(currentPage, PAGE_SIZE, filteredPokemons)
      updatePaginationDiv(currentPage, Math.ceil(filteredPokemons.length / PAGE_SIZE))
      document.getElementById('totalPokemon').textContent = filteredPokemons.length;
    }
  })


  // initialize filter
  

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    const types = res.data.types.map((type) => type.type.name)
    $('.modal-body').html(`
      <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
          <h3>Abilities</h3>
          <ul>
            ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
        </div>

        <div>
          <h3>Stats</h3>
          <ul>
            ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
          </ul>
        </div>
      </div>
      <h3>Types</h3>
      <ul>
        ${types.map((type) => `<li>${type}</li>`).join('')}
      </ul>
    `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons, .prevButton, .nextButton", async function (e) {
    if ($(this).hasClass('numberedButtons')) {
      currentPage = Number(e.target.value)
    } else if ($(this).hasClass('prevButton')) {
      currentPage -= 1
    } else if ($(this).hasClass('nextButton')) {
      currentPage += 1
    }
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })
}



  
$(document).ready(setup)

