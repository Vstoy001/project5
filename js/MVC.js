
//global var to hold place queried
var destination = "";
//global var to hold markers of interests to reset
var interestMarkers = [];

var model = {
    initMap: function () {
        model.poll();
        //setup a google map at full zoom out
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions = {
                center: {
                    lat: 0,
                    lng: 0
                },
                zoom: 1
            }
        );
        //return the map to be used as a global var
        return map;
    },

    updateInterests: function () {
        var interestArray = [];
        if (wantsShops === true) {
            interestArray.push('store');
            interestArray.push('shopping_mall');
            interestArray.push('convenience_store');
            interestArray.push('home_goods_store');
        }
        if (wantsFood === true) {
            interestArray.push('food');
            interestArray.push('bar');
        }
        if (wantsParks === true) {
            interestArray.push('park');
            interestArray.push('campground');
            interestArray.push('lodging');
        }
        console.log("interests of: " + interestArray);
        return interestArray;
    },

    poll: function () {
        console.log("polling for connection");

        var state = navigator.onLine ? "online" : "offline";
        if(state == "offline") {
            alert('lost connection to internet');
        }
    }
};

var wantsShops = false;
var wantsFood = false;
var wantsParks = false;


var controller = {
    setCity: "",
    setStreet: "",

    setNeighborhood: function () {
        //check for internet connection
        model.poll();
        //clear destination for new value
        destination = "";
        var query = controller.setCity + ", " + controller.setStreet;
        //setup geocoder
        var finder = new google.maps.Geocoder();
        //locate the address user input
        finder.geocode({
            'address': query
        }, function (results, status) {
            //error handling
            if (status != google.maps.GeocoderStatus.OK) {
                alert("Geocode was not successful in finding that location!" + status);
                return;
            } else {
                var location = results[0].geometry.location;
                map.setCenter(location);
                //make marker at desired location

                var marker = new google.maps.Marker({
                    map: map,
                    position: location
                });

                //set a reasonable zoom in and make sure marker is in view
                map.setZoom(12);
                map.panTo(location);
                //pass location to use as global var
                destination = location;
            }
        });
    },

    searchInterests: function () {
        //handle undefined destination
        if (destination === "") {
            alert("please enter a location to search near first");
            return;
        }
        //get user interests to search for
        var interests = model.updateInterests();
        //set current interest markers' map to null to clear off the map
        for (var i = 0; i < interestMarkers.length; i++) {
            interestMarkers[i].setMap(null);
        }
        interestMarkers = [];
        //clear out html in list to populate with new info
        $(".interest-list-item").remove();

        //check for internet connection
        model.poll();
        //request is centered on the location that was queried earlier
        var request = {
            location: destination,
            radius: '5000',
            types: interests
        };
        //make a new search
        var search = new google.maps.places.PlacesService(map);
        //search for places of interest
        search.nearbySearch(request, function (results, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                alert("There was a problem looking for anything of interest " + status);
                return;
            } else {
                console.log("found " + results.length + " places");

                //layout markers on the map and add them to an array
                for (var i = 0; i < results.length; i++) {
                    controller.findDetails({
                        placeId: results[i].place_id
                    });
                }
            }
        });
    },

    findDetails: function (id) {
        //check for internet connection
        model.poll();
        var search = new google.maps.places.PlacesService(map);
        //get details about places of interest
        search.getDetails(id, function (result, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                //alert("There was a problem getting details " + status);
                return;
            } else {
                var marker = new google.maps.Marker({
                    map: map,
                    position: result.geometry.location,
                });

                interestMarkers.push(marker);
                //attach information to markers and list
                controller.attachInfo(id, result, marker);
            }
        });
    },

    attachInfo: function (id, result, marker) {
        //build html for info list item
        $("#interest-list").append('<li class="interest-list-item" id="' + id.placeId + '">' + result.name + ' -v- </li>');

        //build html for list item content
        var $infoBox = $("#" + id.placeId);
        var pContent = '<p id="infoFor' + id.placeId + '">';
        pContent += 'Located at: ' + result.vicinity + '.';
        if (result.rating !== undefined) {
            pContent += '<br> Average rating at ' + result.rating + ' out of 5 stars!';
        }
        pContent += '<br> Visit their <a href="' + result.website + '">website</a>.';
        pContent += '</p>';

        $infoBox.append(pContent);

        //hide the description until user requested
        $('#infoFor' + id.placeId).hide(0);

        //attach listener for clicking on list
        document.getElementById(id.placeId).addEventListener("click", function () {
            view.displayInfo(id.placeId, result);
        });
        //variable for google info window
        var info = new google.maps.InfoWindow({
            content: "<p>" + result.name + "</p>"
        });
        
        //attach listener for clicking on marker
        google.maps.event.addDomListener(marker, 'click', function () {
            info.open(map, marker);
            view.displayInfo(id.placeId, result);
        });
    },

    convertTime: function (time) {
        var t = time / 100;
        if (t > 12) {
            t -= 12;
        }
        return t;
    }
};

var view = {
    setMarker: function (marker, icon) {
        marker.setIcon(icon);
    },

    displayInfo: function (id, query) {
        console.log("toggling: " + id + " for " + query.name);
        $('#infoFor' + id).toggle('drop');
    }
};

ko.applyBindings(controller);
var map = model.initMap();