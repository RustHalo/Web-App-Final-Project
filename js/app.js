//Data Model

//func. to retrieve listings from browser's storage
function getListings() {
    let listings = localStorage.getItem('marketplace_listings');

    //no data? return blank array
    if (!listings) {
        return [];
    }

    //json turns text back into objects
    return JSON.parse(listings);
}

//func. to save listings to browser storage
function saveListings(listingsArray) {
    //json turns objects to text to survive page reload
    localStorage.setItem('marketplace_listings', JSON.stringify(listingsArray));
}



//Logic Layer

//wait for html to fully load before running logic
$(document).ready(function() {

    renderListings();

    $('#role-switch').on('change', function() {
        let currentRole = $(this).val();
        //interface changes by role
        if (currentRole === 'member') {
            $('#create-view').show();
        }
        else {
            $('#create-view').hide();
        }
    });

    //Create operation
    $('#create-listing-form').on('submit', function(event) {
        //prevent browser from reloading page automatically
        event.preventDefault();

        //gather data from html form input
        let newTitle = $('#item-title').val();
        let newPrice = $('#item-price').val();
        let newCategory = $('#item-category').val();
        let newDesc = $('#item-desc').val();

        //new data object
        let newItem = {
            id: Date.now(),
            title: newTitle,
            price: parseFloat(newPrice),
            category: newCategory,
            description: newDesc,
            author: "Member"
        };

        //get and parse current array from storage
        let currentListings = getListings();
        //push new item to array
        currentListings.push(newItem);
        //stringify and set updated array to localStorage
        saveListings(currentListings);
        //re-render grid
        renderListings();
        //clear form fields
        this.reset();
    })
});

//initial data (seed data)
// if storage is empty, add 1dummy item to have something to read
let currentListings = getListings();
if (currentListings.length === 0) {
    let dummyListing = {
        id: Date.now(),
        title: "Calculus Textbook",
        price: 45.00,
        category: "Textbooks",
        description: "Barely used, no highlighting or writings.",
        author: "Member"
    };
    //push method to add new item to array
    currentListings.push(dummyListing);
    saveListings(currentListings);
}

//the Read operation
function renderListings() {
    let listings = getListings();

    let grid = document.getElementById('listings-grid');
    grid.innerHTML = '';

    listings.forEach((item) => {

        let card = document.createElement('div');
        card.classList.add('controls');

        let title = document.createElement('h3');
        title.textContent = item.title;

        let price = document.createElement('p');
        price.textContent = "Price: €" + item.price;

        let category = document.createElement('p');
        category.textContent = "Category: " + item.category;

        let author = document.createElement('p');
        author.textContent = "Seller: " + item.author;

        let description = document.createElement('p');
        description.textContent = "Description: " + item.description;

        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(category);
        card.appendChild(author);
        card.appendChild(description);

        grid.appendChild(card);
    });
}