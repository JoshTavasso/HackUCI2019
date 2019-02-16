function props(newLat,newLng,newContent)
{
    this.coords = {lat: newLat, lng: newLng},
    this.information = newContent;
};
//Place object with lat and long
var result;
var markers = [];
var circle;
function initMap(){
    //remove clutter on map
    var mapStyles = [
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
            featureType: 'poi',
            stylers: [{visibility: 'off'}]
        },
        {
            featureType: 'transit',
            stylers: [{visibility: "off"}]
        },

            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
    ];
    var options = {
        zoom: 13,
        center: {lat:37.7749, lng: -122.4194},
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: mapStyles
    };
    //creating a new map
    //set up strict bounds for map to SF
    var map = new google.maps.Map(document.getElementById('map'), options);
    //Array

    //takes in props object
    function addMarker(props)
    {
        //delete any existing markers
        //zoom in on marker
        //console.log(props.coords);
        var marker = new google.maps.Marker({
        position: props.coords,
        map: map
        //used to set a custom icon
        //icon:
        });

        //check content
        if(props.content)
        {
            var infoWindow = new google.maps.InfoWindow({
            content: props.content
            });

            marker.addListener('click', function(){
            infoWindow.open(map, marker)});
        }
        markers.push(marker);
    };

    function deleteMarkers(map)
    {
        for(var i = 0; i < markers.length; ++i)
        {
            markers[i].setMap(map);
        }

    };

    function clearMarkers()
    {
        deleteMarkers(null);
    };
    // set SF boundaries;
    var SFboundaries;
    var input = document.getElementById('input');

    //set up autocomplete box
    var field = new google.maps.places.Autocomplete(input);
    field.bindTo('bounds', map);
    field.setFields(['geometry', 'name']);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    //main area of functionality
    field.addListener("place_changed", function() {
        result = field.getPlace();
        if (!result.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        } else {
            clearMarkers();
            var p = new props(result.geometry.location.lat(), result.geometry.location.lng(), result.name);
            options.center = {lat: result.geometry.location.lat(), lng:result.geometry.location.lng()};

            map.setZoom(18);
            map.panTo(options.center);
            //map = new google.maps.Map(document.getElementById('map'), options);
            console.log(result);
            addMarker(p);
            input.value = "";

            //create circle at this location
            if (circle != null)
                circle.setCenter(p.coords);
            else
                circle = new google.maps.Circle(
                    {   center: p.coords,
                        strokeColor: 'blue',
                        strokeOpacity: 0.5,
                        strokeWeight: 1,
                        fillColor: 'blue',
                        editable: false,
                        draggable: false,
                        fillOpacity: 0.3,
                        map: map,
                        radius: 100
                    }
                );
            //set up JSON for flask to handle
            var location = result.geometry.location.toJSON();
            console.log("location: ", location);
            //call Flask function - returns JSON
            $.ajax({
                url: "/results",
                type: "POST",
                data: JSON.stringify(location),
                success: function(data, textStatus, jqXHR) {
                },
                contentType: "application/json",
                dataType: "json"
            });
            //get results from url - results
            // <% for r in {{results}} %}
            //     p = new Props(r.latitude, r.longitude, r.description);
            //     addMarker(p);
            // {% endfor %}
            var results = $.get("/results");
        }
    });

}