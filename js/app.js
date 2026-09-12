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
    localStorage.setItem('marketplace:listings', JSON.stringify(listingsArray))
}



//Logic Layer

//wait for html to fully load before running logic
$(document).ready(function() {
    $('#role-switch').on('change', function() {
        let currentRole = $(this).val();
        console.log("Current role is now: " + currentRole);
    });
});