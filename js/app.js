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

//Delete operation
function deleteListing(id) {
    let currentListings = getListings();
    currentListings = currentListings.filter((item) => item.id !== id);
    saveListings(currentListings);
    renderListings();
}

//Read operation (render)
function renderListings() {
    let listings = getListings();
    let grid = document.getElementById('listings-grid');
    if (!grid) return;

    grid.innerHTML = '';

    //check current role
    let currentRole = $('#role-switch').val();

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

        //role-based access control

        //delete button for moderator
        if (currentRole === 'moderator') {
            let deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete Item';

            deleteBtn.style.backgroundColor = '#dc2626';
            deleteBtn.style.marginTop = '15px';

            deleteBtn.onclick = function() {
                deleteListing(item.id);
            };

            card.appendChild(deleteBtn);
        }

        //edit button for member
        if (currentRole === 'member' && item.author === "Member") {
            let editBtn = document.createElement('button');
            editBtn.textContent = 'Edit Item';
            editBtn.style.backgroundColor = '#f59e0b';
            editBtn.style.marginTop = '15px';

            editBtn.onclick = function () {
                $('#item-title').val(item.title); 
                $('#item-price').val(item.price); 
                $('#item-category').val(item.category); 
                $('#item-desc').val(item.description);

                $('#create-listing-form').attr('data-edit-id', item.id);

                $('#create-view').show();
                window.scrollTo(0, 0);
            };

            card.appendChild(editBtn);
        }
        //view details button
        let viewBtn = document.createElement('button');
        viewBtn.textContent = 'View Details';
        viewBtn.style.backgroundColor = '#1eb568'; 
        viewBtn.style.marginTop = '15px';

        viewBtn.addEventListener('click', function(event) {
            console.log("1. Button clicked! Trying to load data for:", item.title);

            document.getElementById('detail-title').textContent = item.title;
            document.getElementById('detail-price').textContent = item.price;
            document.getElementById('detail-category').textContent = item.category;
            document.getElementById('detail-author').textContent = item.author;
            document.getElementById('detail-desc').textContent = item.description;

            //store the item ID in the hidden form input
            document.getElementById('inquiry-listing-id').value = item.id;

            console.log("2. Data injected safely. Now switching views...");

            //switch view
            $('#listings-grid').hide();
            $('#create-view').hide();
            $('#detail-view').show();

            window.scrollTo(viewBtn);
        });
        card.appendChild(viewBtn);

        grid.appendChild(card);
    });
}

//Logic Layer

//wait for html to fully load before running logic
$(document).ready(function() {

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

    renderListings();

    //role switch
    $('#role-switch').on('change', function() {
        let currentRole = $(this).val();
        //interface changes by role
        if (currentRole === 'member') {
            $('#create-view').show();
        }
        else {
            $('#create-view').hide();
        }

        //re-render every time role changes
        renderListings();
    });

    //back button logic
    $('#back-to-grid').on('click', function() {
        $('detail-view').hide();
        $('#listings-grid').show();

        let currentRole = $('#role-switch').val();
        if (currentRole === 'member') {
            $('#create-view').show();
        }

        window.scrollTo(0, 0);
    });


    //Create & update operation
    $('#create-listing-form').on('submit', function(event) {
        //prevent browser from reloading page automatically
        event.preventDefault();

        //gather data from html form input
        let newTitle = $('#item-title').val();
        let newPrice = $('#item-price').val();
        let newCategory = $('#item-category').val();
        let newDesc = $('#item-desc').val();

        //get+parse current array from storage first
        let currentListings = getListings();
        //check if form has hidden ID
        let editId = $('#create-listing-form').attr('data-edit-id');
        //decision (update or create)
        if (editId) {
            //update
            console.log("Updating item with ID: " + editId);
            //find item - update- save
            for (let i = 0; i < currentListings.length; i++) {
                if (String(currentListings[i].id) === String(editId)) {
                    currentListings[i].title = newTitle;
                    currentListings[i].price = parseFloat(newPrice);
                    currentListings[i].category = newCategory;
                    currentListings[i].description = newDesc;
                    break;
                }
            }

            //clean up form
            $('#create-listing-form').removeAttr('data-edit-id');
        } else {
            //create
            let newItem = {
                id: Date.now(),
                title: newTitle,
                price: parseFloat(newPrice),
                category: newCategory,
                description: newDesc,
                author: "Member"
            };

            currentListings.push(newItem);
        }

        //stringify and set updated array to localStorage
        saveListings(currentListings);
        //re-render grid
        renderListings();
        //clear form fields
        this.reset();

    })});