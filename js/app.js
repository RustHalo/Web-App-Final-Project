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

//inquiry function
function getInquiries() {
    let inquiries = localStorage.getItem('marketplace_inquiries');
    if (!inquiries) {
        return [];
    }
    return JSON.parse(inquiries);
}
//save inquiries
function saveInquiries(inquiriesArray) {
    localStorage.setItem('marketplace_inquiries', JSON.stringify(inquiriesArray));
}

//favorites data function
function getFavorites() {
    let favorites = localStorage.getItem('marketplace_favorites');
    if (!favorites) {
        return [];
    }
    //json turns text back to object
    return JSON.parse(favorites);
}
//save favorites function
function saveFavorites(favoritesArray) {
    localStorage.setItem('marketplace_favorites', JSON.stringify(favoritesArray));
}

//report listing
function getReports() {
    let reports = localStorage.getItem('marketplace_reports');
    if (!reports) {
        return [];
    }
    return JSON.parse(reports);
}
//function to save reports in browser storage
function saveReports(reportsArray) {
    localStorage.setItem('marketplace_reports', JSON.stringify(reportsArray));
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

    //for search engine
    let searchQuery = $('#search-input').val().toLowerCase();
    let categoryFilter = $('#category-filter').val();
    let filteredListings = listings.filter((item) => {
        let itemTitle = item.title.toLowerCase();
        let itemDesc = item.description.toLowerCase();
        let matchesSearch = itemTitle.includes(searchQuery) || itemDesc.includes(searchQuery);

        let matchesCategory = (categoryFilter === 'all') || (item.category === categoryFilter);

        return matchesSearch && matchesCategory;
    });
    if (filteredListings.length === 0) {
        let emptyMsg = document.createElement('p');
        emptyMsg.textContent = "No Items Found.";
        emptyMsg.classList.add('empty-message');
        grid.appendChild(emptyMsg);
    } else {
        filteredListings.forEach((item) => {

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

                deleteBtn.classList.add('btn-delete', 'mt-15', 'mr-10');

                deleteBtn.onclick = function() {
                    deleteListing(item.id);
                };

                card.appendChild(deleteBtn);
            }

            //favorites button (members only)
            if (currentRole === 'member') {
                let favBtn = document.createElement('button');
                favBtn.textContent = 'Save to Favorites';

                favBtn.classList.add('btn-fav', 'mt-15', 'mr-10');

                favBtn.onclick = function() {
                    let currentFavorites = getFavorites();
                    let existingItem = currentFavorites.find((fav) => fav.id === item.id);

                    //existing item?
                    if (existingItem) {
                        alert("This item is already saved to favorites!");
                    } else {
                        //not existing item?
                        currentFavorites.push(item);
                        saveFavorites(currentFavorites);
                        alert(item.title + " has been saved to your favorites!");

                        renderDashboard();
                    }
                };
                card.appendChild(favBtn);
            }
        

            //view details button
            let viewBtn = document.createElement('button');
            viewBtn.textContent = 'View Details';

            viewBtn.classList.add('btn-view', 'mt-15');

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

                window.scrollTo(0, 0);
            });
            card.appendChild(viewBtn);

            grid.appendChild(card);
        });
    }
}

//dashboard render operatin
function renderDashboard() {

    let listings = getListings();
    let container = document.getElementById('my-listings-container');
    if (!container) return;

    container.innerHTML = '';

    let myItems = listings.filter((item) => item.author === "Member");

    if (myItems.length === 0) {
        container.innerHTML = '<p>You have not posted any items yet.</p>';
    }

    myItems.forEach((item) => {
        let card = document.createElement('div');
        card.classList.add('controls', 'mt-10');

        let title = document.createElement('h4');
        title.textContent = item.title;

        let price = document.createElement('p');
        price.textContent = "Price: €" + item.price;

        //edit button
        let editBtn = document.createElement('button');
        editBtn.textContent = 'Edit Item';

        editBtn.classList.add('btn-edin', 'mt-10', 'mr-10');

        editBtn.onclick = function () {
            $('#item-title').val(item.title); 
            $('#item-price').val(item.price); 
            $('#item-category').val(item.category); 
            $('#item-desc').val(item.description);

            $('#create-listing-form').attr('data-edit-id', item.id);

            $('#dashboard-view').hide();
            $('#create-view').show();

            window.scrollTo(0, 0);
        };

        //new delete btn
        let deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Item';

        deleteBtn.classList.add('btn-delete');

        deleteBtn.onclick = function () {
            if (confirm("Are you sure you want to delete this listing?")) {
                deleteListing(item.id);
                renderDashboard();
            }
        };

        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(editBtn);
        card.appendChild(deleteBtn);

        container.appendChild(card);
    });

    //render fav
    let favorites = getFavorites();
    let favContainer = document.getElementById('favorites-container');
    if (!favContainer) return;

    favContainer.innerHTML = "";

    if (favorites.length === 0) {
        favContainer.innerHTML = '<p>You have no saved favorites yet.</p>';
    } else {
        favorites.forEach((item) => {
            let card = document.createElement('div');
            card.classList.add('controls', 'mt-10');

            let title = document.createElement('h4');
            title.textContent = item.title;

            let price = document.createElement('p');
            price.textContent = "Price: €" + item.price;

            let viewBtn = document.createElement('button');
            viewBtn.textContent = 'View Details';

            viewBtn.classList.add('btn-view', 'mt-10', 'mr-10');

            viewBtn.addEventListener('click', function(event) {
                // Populate the detail page with this specific item's data
                document.getElementById('detail-title').textContent = item.title;
                document.getElementById('detail-price').textContent = item.price;
                document.getElementById('detail-category').textContent = item.category;
                document.getElementById('detail-author').textContent = item.author;
                document.getElementById('detail-desc').textContent = item.description;

                document.getElementById('inquiry-listing-id').value = item.id;

                $('#dashboard-view').hide();
                $('#listings-grid').hide();
                $('#create-view').hide();
                $('#detail-view').show();

                window.scrollTo(0, 0);
            });

            //remove from fav
            let removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.classList.add('btn-delete', 'mt-10', 'ml-10');

            removeBtn.onclick = function() {
                if (confirm("Remove this item from favorites?")) {
                    let currentFavorites = getFavorites();

                    currentFavorites = currentFavorites.filter((fav) => fav.id !== item.id);

                    saveFavorites(currentFavorites);
                    renderDashboard();
                }
            };

            card.appendChild(title);
            card.appendChild(price);
            card.appendChild(viewBtn);
            card.appendChild(removeBtn);

            favContainer.appendChild(card);
        });
    }
}


//Logic Layer

//wait for html to fully load before running logic
$(document).ready(function() {

    //nav logic
    //main page link
    $('#nav-main').on('click', function(event) {
        //prevent browser from trying to dollow the linkURL
        event.preventDefault();

        //hide newly added static pages and create form
        $('#about-view').hide();
        $('#contact-view').hide();
        $('#detail-view').hide();
        $('#create-view').hide();
        $('#moderator-view').hide();

        //show main grid
        $('#listings-grid').show();
        $('#grid-view').show();

        //show trole switch when returning to main
        $('#role-container').show();

        //re-evaluate role switch
        $('#role-switch').trigger('change');

        //update visual active state
        $('#main-menu a').removeClass('active-nav');
        $(this).addClass('active-nav');
    });

    //about page link
    $('#nav-about').on('click', function(event) {
        event.preventDefault();

        //hide all sections
        $('#grid-view').hide();
        $('#create-view').hide();
        $('#dashboard-view').hide();
        $('#detail-view').hide();
        $('#contact-view').hide();
        $('#role-container').hide();

        //show only About
        $('#about-view').show();

        //update visual active state
        $('#main-menu a').removeClass('active-nav');
        $(this).addClass('active-nav');
    });

    //contact page link
    $('#nav-contact').on('click', function(event) {
        event.preventDefault();

        //hide all sections
        $('#grid-view').hide();
        $('#create-view').hide();
        $('#dashboard-view').hide();
        $('#detail-view').hide();
        $('#about-view').hide();
        $('#role-container').hide();

        //show only Contact
        $('#contact-view').show();

        //update visual active state
        $('#main-menu a').removeClass('active-nav');
        $(this).addClass('active-nav');
    });

    //post a listing
    $('#btn-show-post-form').on('click', function(event) {
        event.preventDefault();
        $('#dashboard-view').hide();
        $('#grid-view').hide();
        $('#listings-grid').hide();
        $('#create-view').show();

        window.scrollTo(0, 0);

    });

    //back to dashboard button
    $('#back-to-dashboard').on('click', function(event) {
        event.preventDefault();

        $('#create-listing-form').removeAttr('data-edit-id');
        document.getElementById('create-listing-form').reset();

        $('#create-view').hide();
        $('#dashboard-view').show();

        window.scrollTo(0, 0);
    });

    $('#link-report-problem').on('click', function(event) {
        event.preventDefault();

        let currentItemId = $('#inquiry-listing-id').val();
        $('#report-listing-id').val(currentItemId);

        $('#detail-view').hide();
        $('#report-view').show();
        
        window.scrollTo(0, 0);
    });

    $('#cancel-report').on('click', function() {
        $('#report-form')[0].reset();
        $('#report-view').hide();
        $('#detail-view').show();
    });

    $('#report-form').on('submit', function(event) {
        event.preventDefault();

        let targetListingId = $('#report-listing-id').val();
        let reportReason = $('#report-reason').val();

        let newReport = {
            id: Date.now(),
            listingId: targetListingId,
            reason: reportReason
        };

        let currentReports = getReports();
        currentReports.push(newReport);
        saveReports(currentReports);

        alert("Thank you. This listing has been reported to the moderators.");

        this.reset();
        $('#report-view').hide();
        $('#listings-grid').show();
        $('#grid-view').show();

        window.scrollTo(0, 0);
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

    renderListings();

    //role switch
    $('#role-switch').on('change', function() {
        let currentRole = $(this).val();
        //interface changes by role
        if (currentRole === 'member') {
            $('#create-view').hide();
            $('#grid-view').show();
            $('#moderator-view').hide();
            $('#dashboard-view').show();
        }
        else if (currentRole === 'moderator') {
            $('#create-view').hide();
            $('#grid-view').hide();
            $('#dashboard-view').hide();
            $('#moderator-view').show();
            renderModeratorReports();
        }
        else { 
            $('#create-view').hide();
            $('#dashboard-view').hide();
            $('#moderator-view').hide();
            $('#grid-view').show();
        }
        renderListings();
        renderDashboard();
    });


    //automatic trigger
    $('#role-switch').trigger('change');

    //listenet for typing in search bar
    $('#search-input').on('input', function() {
        renderListings();
    });
    //listen for drop down selection
    $('#category-filter').on('change', function() {
        renderListings();
    });

    //back button logic
    $('#back-to-grid').on('click', function() {
        $('#detail-view').hide();
        $('#listings-grid').show();

        let currentRole = $('#role-switch').val();
        if (currentRole === 'member') {
            $('#create-view').show();
            $('#dashboard-view').show();
        }

        window.scrollTo(0, 0);
    });

    //inline form validation
    function validateCreateForm() {
        //grab elements to be altered
        const oldErrors = document.querySelectorAll('.error-msg');
        //loop to iterate through multiple selected elements and call the remove method to delete the element from the document
        oldErrors.forEach((ele) => {
            ele.remove();
        });

        let isValid = true;
        //select page elements by ID and store as JS objects
        let titleInput = document.getElementById('item-title');
        let priceInput = document.getElementById('item-price');
        let categoryInput = document.getElementById('item-category');
        let descInput = document.getElementById('item-desc');

        //read user data from form
        if (titleInput.value.trim() === "") {
            let errorNode = document.createElement('p');
            //.textContent for unknown user data to safely render exact characters and prevent cross-site scripting (XSS)
            errorNode.textContent = "Please enter a title for you listing.";
            errorNode.classList.add('error-msg');
            //.after to place the error directly after the input field
            titleInput.after(errorNode);

            isValid = false;
        }
        if (priceInput.value.trim() === "") {
            let errorNode = document.createElement('p');
            errorNode.textContent = "please enter a valid price.";
            errorNode.classList.add('error-msg');
            priceInput.after(errorNode);
            isValid = false;
        }
        if (categoryInput.value.trim() === "") {
            let errorNode = document.createElement('p');
            errorNode.textContent = "Please select a category.";
            errorNode.classList.add('error-msg');
            categoryInput.after(errorNode);
            isValid = false;
        }
        if (descInput.value.trim() === "") {
            let errorNode = document.createElement('p');
            errorNode.textContent = "Please provide a description.";
            errorNode.classList.add('error-msg');
            descInput.after(errorNode);
            isValid = false;
        }
        return isValid;
    }


    //Create & update operation
    $('#create-listing-form').on('submit', function(event) {
        //prevent browser from reloading page automatically
        event.preventDefault();
        //call form validation function
        if(!validateCreateForm()) {
            return;
        }

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
        //re-render grid and dashboard
        renderListings();
        renderDashboard();
        //clear form fields
        this.reset();

        $('#create-view').hide();
        $('#dashboard-view').show();

        window.scrollTo(0, 0);
    });

        //render moderator reports
    function renderModeratorReports() {
        let reportsContainer = document.getElementById('reports-container');
        if (!reportsContainer) return;

        reportsContainer.innerHTML = '';
        let reports = getReports();
        let listings = getListings();

        if (reports.length === 0) {
            reportsContainer.innerHTML = '<p>No flagged listings to review.</p>';
            return;
        }

        reports.forEach((report) => {
            let card = document.createElement('div');
            card.classList.add('controls', 'mt-10');

            let title = document.createElement('h4');

            let targetItem = listings.find((item) => String(item.id) === String(report.listingId));
            if (targetItem) {
                let link = document.createElement('a');
                link.href = "#";
                link.textContent = "Reported Listing: " + targetItem.title;
                link.style.color = "#2563eb";
                link.style.textDecoration = "underline";

                link.onclick = function(event) {
                    event.preventDefault();

                    document.getElementById('detail-title').textContent = targetItem.title;
                    document.getElementById('detail-price').textContent = targetItem.price;
                    document.getElementById('detail-category').textContent = targetItem.category;
                    document.getElementById('detail-author').textContent = targetItem.author;
                    document.getElementById('detail-desc').textContent = targetItem.description;
                    document.getElementById('inquiry-listing-id').value = targetItem.id;

                    $('#moderator-view').hide();
                    $('#detail-view').show();

                    window.scrollTo(0, 0);
                };
                title.appendChild(link);
            } else {
                title.textContent = "Reported Listing: (Item No Longer Exists)";
            }
            let reasonP = document.createElement('p');
            reasonP.innerHTML = "<strong>Reason:</strong> " + report.reason;

            let resolveBtn = document.createElement('button');
            resolveBtn.textContent = 'Dismiss / Resolve Report';
            resolveBtn.classList.add('btn-delete', 'mt-10');

            resolveBtn.onclick = function() {
                if (confirm("Are you sure you want to resolve and remove this report?")) {
                    let currentReports = getReports();
                    currentReports = currentReports.filter((r) => r.id !== report.id);
                    saveReports(currentReports);
                    renderModeratorReports();
                }
            };

            card.appendChild(title);
            card.appendChild(reasonP);
            card.appendChild(resolveBtn);
            reportsContainer.appendChild(card);
        });
    }


    //create inquiry operation
    $('#inquiry-form').on('submit', function(event) {
        event.preventDefault();

        let senderEmail = $('#inquiry-sender').val();
        let messageText = $('#inquiry-message').val();

        let targetListingId = $('#inquiry-listing-id').val();

        let newInquiry = {
            id: Date.now(),
            listingId: targetListingId,
            sender: senderEmail,
            message: messageText
        };

        let currentInquiries = getInquiries();
        currentInquiries.push(newInquiry);
        saveInquiries(currentInquiries);

        alert("Your message has been sent to the seller!");
        this.reset();
    });

});

