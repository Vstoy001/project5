//global var to hold place queried
var destination;
//global var to hold markers of interests to reset
var interestMarkers = [];

var model = {
    initMap: function () {
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
    /*    
        map = model.initMap(),
        
        addMarker: function (marker) {
            interestMarkers.push(marker);
        }
    */

};

var wantsShops = false;
var wantsFood = false;
var wantsParks = false;

var controller = {
    updateInterests: function () {
        var interestArray = [];
        if (wantsShops == true) {
            interestArray.push('store');
            interestArray.push('shopping_mall');
        }
        if (wantsFood == true) {
            interestArray.push('food');
        }
        if (wantsParks == true) {
            interestArray.push('park');
        }
        console.log("interests of: " + interestArray);
        return interestArray;
    },


    setNeighborhood: function () {
        //get data from the query box
        var city = $('#city').val();
        var street = $('#street').val();
        var query = city + ", " + street;
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
        //get user interests to search for
        var interests = controller.updateInterests();
        //set current interest markers' map to null to clear off the map
        for (var i = 0; i < interestMarkers.length; i++) {
            interestMarkers[i].setMap(null);
        }
        interestMarkers = [];
        //clear out html in list to populate with new info
        $(".interest-list-item").remove();

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
                //handle undefined destination
                if (destination.property !== undefined) {
                    alert("please enter a location to search near first");
                    return;
                }
                console.log("found " + results.length + " places")

                //layout markers on the map and add them to an array
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];

                    controller.findDetails({
                        placeId: results[i].place_id
                    }); 
                }
            }
        });
    },

    findDetails: function (id) { 
        var search = new google.maps.places.PlacesService(map);
        //get details about places of interest
        search.getDetails(id, function (result, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                //console.log("error found");
                //alert("There was a problem getting details " + status);
                return;
            } else {
                //handle undefined destination
                if (destination.property !== undefined) {
                    alert("please enter a location to search near first");
                    return;
                }
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
        $infoBox = $("#"+id.placeId);
        var pContent = '<p id="infoFor' + id.placeId + '">';
        pContent += '<br><span id="loc"> Located at: ' + result.vicinity + '.</span>';
        /*
        if(result.opening_hours.periods[0].length > 0) {
            var startingTime = controller.convertTime(result.opening_hours.periods[0].open.time);
            var closingTime = controller.convertTime(result.opening_hours.periods[0].close.time);
            $infoBox.append('<br><span id="time"> Open from ' + startingTime + ' am to ' + closingTime + ' pm.</span>');    
        } else {
            $infoBox.append('<br><span id="time"> Could not get opening hours </span>');
        }
        */
        pContent += '<br><span id="rating"> Rated at ' + result.rating + ' out of 5 stars! </span>';
        pContent += '<br><span id="website"> Visit their <a href="' + result.website + '">website</a>.</span>';
        pContent += '</p>'

        $infoBox.append(pContent);
           
        //hide the description until user requested
        $('#infoFor' + id.placeId).hide(0);

        //view.displayInfo(id.placeId, result);
        
        //attach listener for clicking on list
        document.getElementById(id.placeId).addEventListener("click", function () {
            view.displayInfo(id.placeId, result);
        });
        //variable for google info window
        var info = new google.maps.InfoWindow({
            content: "<p>" + result.name + "</p>"
        });
        //view.setMarker(marker, result.icon);
        
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
//ko.applyBindings(controller);
//ko.applyBindings(view);
var map = model.initMap();