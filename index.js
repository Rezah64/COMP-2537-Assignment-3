const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []


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
  // test out poke api using axios here


  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
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

// get total count of pokemon
axios.get('https://pokeapi.co/api/v2/pokemon/')
  .then(response => {
    const totalCount = response.data.count;
    document.getElementById('totalPokemon').textContent = totalCount;
  })
  .catch(error => {
    console.log(error);
  });
const apiUrl = 'https://pokeapi.co/api/v2/type/';

// Fetch the types from the API
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    const types = data.results;
    const checkboxesDiv = document.getElementById('checkboxes');
    const submitBtn = document.getElementById('submitBtn');

    // Dynamically generate checkboxes for each type
    types.forEach(type => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = type.name;
      checkbox.name = 'type';
      checkbox.value = type.name;

      const label = document.createElement('label');
      label.htmlFor = type.name;
      label.appendChild(document.createTextNode(type.name));

      checkboxesDiv.appendChild(checkbox);
      checkboxesDiv.appendChild(label);
      checkboxesDiv.appendChild(document.createElement('br'));
    });

    // Add event listener to submit button
    // Add event listener to submit button
    submitBtn.addEventListener('click', async () => {
      const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked'))
        .map(checkbox => checkbox.value);

      $('#pokeCards').empty();

      // display up to 10 pokemon of selected types
      for (const type of selectedTypes) {
        const res = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
        const pokemonUrls = res.data.pokemon.slice(0, 10).map(pokemon => pokemon.pokemon.url);
        for (const url of pokemonUrls) {
          const res = await axios.get(url);
          $('#pokeCards').append(`
        <div class="pokeCard card" pokeName=${res.data.name}>
          <h3>${res.data.name.toUpperCase()}</h3>
          <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
            More
          </button>
        </div>
      `);
        }
      }
    });
  })
$(document).ready(setup)