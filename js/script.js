function theMap() {
    var mapCanvas = document.getElementById('map-canvas');

    var map = new google.maps.Map(mapCanvas,
        mapOptions = {
            center: {
                lat: 0,
                lng: 0
            },
            zoom: 1
        }
    );

    function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        
        var info = new google.maps.InfoWindow({
            content: "<p>" + marker.getPosition() + "</p>"
        });
        
        google.maps.event.addDomListener(marker, 'click', function() {
            info.open(map, marker);
        });
    }
    
    google.maps.event.addDomListener(map, 'click', function(e) {
        placeMarker(e.latLng);
    });
}

function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // load streetview
    var city = $('#city').val();
    var street = $('#street').val();
    var query = city + ", " + street;
    
    

    $greeting.text("Are you sure you want to live at " + query + " ? This is what I heard...")

    var addressUrl = 'http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + query + '';

    $body.append('<img class="bgimg" src="' + addressUrl + '">');
    // YOUR CODE GOES HERE!

    var NYT_KEY = "837e833e94d663da1867af8c86710f88:9:71463205";
    var articleUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + query + '&sort=oldest&api-key=' + NYT_KEY + '';

    $.getJSON(articleUrl, function (data) {
        $nytHeaderElem.text("New York Times Articles About " + query);

        var articles = data.response.docs;
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            $nytElem.append('<li class="article">' + '<a href="' + article.web_url + '">' + article.headline.main + '</a>' + '<p>' + article.snippet + '</p>' + '</li>');
        };
    }).error(function (e) {
        $nytHeaderElem.append(" could not find an article about this place...hmm...");
        return;
    });

    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + city + '&format=json&callback=wikiCallback';

    var wikiRequestTimeout = setTimeout(function () {
        $wikiElem.text("failed to find wikipedia resources");
    }, 10000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function (response) {
            var articles = response[1];

            //console.log(response);

            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                var url = 'http://en.wikipedia.org/wiki/' + article;
                $wikiElem.append('<li><a href="' + url + '">' + article + '</a></li>');
            };

            clearTimeout(wikiRequestTimeout);
        }
    });

    return false;
};

$('#form-container').submit(loadData);
theMap();

//NY key: 837e833e94d663da1867af8c86710f88:9:71463205
//google key: AIzaSyDRU0gQykqW2GldIIRDEnnAXPIFtBIPSwk
// loadData();