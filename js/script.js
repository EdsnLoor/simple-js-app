let pokemonRepository = (function () {
    let pokemonList = [];
    let apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=150';
    let modalContainer = document.querySelector('#modal-container');

    function add(pokemon) {
        pokemonList.push(pokemon);
    }
    // Get all the Pokémon
    function getAll() {
        return pokemonList;
    }
    function loadList() {
        showLoadingMessage();
        return fetch(apiUrl)
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                const promises = json.results.map(function (item) {
                    let pokemon = {
                        name: item.name.toUpperCase(),
                        detailsUrl: item.url
                    };
                    return fetch(pokemon.detailsUrl)
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (details) {
                            // Add the details to the pokemon object
                            pokemon.imageUrl = details.sprites.other.dream_world.front_default;
                            pokemon.height = details.height;
                            pokemon.type = details.types.map((type) => type.type.name);
                            // Return the modified pokemon object
                            return pokemon
                        })
                        .catch(function (e) {
                            console.error(e);
                        });
                });
                // Return a Promise that resolves to the array of objects
                return Promise.all(promises);
            })
            .then(function (pokemonList) {
                // Map the pokemonList to an array of objects with the desired data
                return pokemonList.map(function (pokemon) {
                    let updatedPokemon = {
                        name: pokemon.name,
                        height: pokemon.height,
                        imageUrl: pokemon.imageUrl,
                        detailsUrl: pokemon.detailsUrl,
                        type: pokemon.type
                    };
                    add(updatedPokemon)
                });
            })
            .catch(function (e) {
                console.error(e);
            });

    }
    function addListItem(pokemon){
        // setting variables
        let pokemonList = document.querySelector(".container");
        let listPokemon = document.createElement("span");
        let button = document.createElement("button");

        // creating a button for each Pokémon
        button.innerText = pokemon.name;
        button.classList.add("type");
        let pokemonType = pokemon.type[0];
        button.classList.add(pokemonType);
        button.classList.add("left");
        listPokemon.appendChild(button)
        pokemonList.appendChild(listPokemon)
        button.addEventListener('click', function () {
            showDetails(pokemon);
        });
    }
    // Shows Pokémon individual details
    function showDetails(pokemon) {
        loadList(pokemon).then(function () {
        });
        hideLoadingMessage();
        showModal(pokemon);
    }

    // Function that shows a pop-up for each Pokemon
    function showModal(pokemonList) {
        const modalElement = document.getElementById('modal-container');
        const modal = new bootstrap.Modal(modalElement);

        // Set the modal title
        const titleElement = modalElement.querySelector('.modal-title');
        titleElement.innerText = pokemonList.name;

        // Set the modal body
        const bodyElement = modalElement.querySelector('.modal-body');
        bodyElement.innerHTML = `
            <div class="text-center">
                <img src="${pokemonList.imageUrl}" alt="${pokemonList.name}" />
            </div>
            <hr>
            <p>Height: ${pokemonList.height}</p>
            <p>Type: ${pokemonList.type.join(', ')}</p>
    `;

        // Show the modal
        modal.show();
    }

    function hideModal() {
        modalContainer.classList.remove('is-visible');
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalContainer.classList.contains('is-visible')) {
            hideModal();
        }
    });

    modalContainer.addEventListener('click', (e) => {
        // Since this is also triggered when clicking INSIDE the modal
        // We only want to close if the user clicks directly on the overlay
        let target = e.target;
        if (target === modalContainer) {
            hideModal();
        }
    });

    function showLoadingMessage() {
        let loadingScreen= document.querySelector('.loading-screen')
        loadingScreen.classList.remove('not-visible');
        loadingScreen.classList.add('visible');
    }

    function hideLoadingMessage() {
        let loadingScreen= document.querySelector('.loading-screen');
        loadingScreen.classList.remove('visible');
        loadingScreen.classList.add('not-visible');
    }

    return {
        add: add,
        getAll: getAll,
        addListItem : addListItem,
        loadList : loadList,
        hideLoadingMessage : hideLoadingMessage
    };
})();

pokemonRepository.loadList().then(function() {
    // Now the data is loaded!
    pokemonRepository.getAll().forEach(function(pokemon){
        pokemonRepository.addListItem(pokemon);
    });
    setTimeout(pokemonRepository.hideLoadingMessage, 300);
});
