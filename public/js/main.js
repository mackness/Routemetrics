
$(document).ready(function() {
	initLocationProcedure();
	drawingManager();
});

var map;
var drawingManager;
var placeIdArray = [];
var polylines = [];
var snappedCoordinates = [];
var API_KEY = 'AIzaSyAOraoCS2YWp6ogkhbS8DvY88y-7H6zAdg';

function initLocationProcedure() {
    map = new google.maps.Map(document.getElementById('map'), {
          zoom : 17,
          styles: window.mapStyles
    });

		var bikeLayer = new google.maps.BicyclingLayer();
		bikeLayer.setMap(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(displayAndWatch, locError, {
            enableHighAccuracy : true,
            timeout : 60000,
            maximumAge : 0
        });
    } else {
        alert("Your phone does not support the Geolocation API");
    }
}

function locError(error) {
	// the current position could not be located
	alert("The current position could not be found!");
}

function drawingManager() {
  // Enables the polyline drawing control. Click on the map to start drawing a
  // polyline. Each click will add a new vertice. Double-click to stop drawing.
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYLINE,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYLINE
      ]
    },
    polylineOptions: {
      strokeColor: 'yellow',
      strokeWeight: 2
    }
  });
  drawingManager.setMap(map);

   drawingManager.addListener('polylinecomplete', function(poly) {
    var path = poly.getPath();
    polylines.push(poly);
    placeIdArray = [];
    runSnapToRoad(path);
  });
}

function drawPolyline(coords) {
  var polyline = new google.maps.Polyline({
    path: snappedCoordinates,
    strokeColor: 'black',
    strokeWeight: 3
  });

  polyline.setMap(map);
  polylines.push(snappedPolyline);
}
	

function runSnapToRoad(path) {
  var pathValues = [];
  for (var i = 0; i < path.getLength(); i++) {
    pathValues.push(path.getAt(i).toUrlValue());
  }

  $.get('https://roads.googleapis.com/v1/snapToRoads', {
    interpolate: true,
    key: API_KEY,
    path: pathValues.join('|')
  }, function(data) {
    processSnapToRoadResponse(data);
    // drawPolyLine();
  });
}

// Store snapped polyline returned by the snap-to-road method.
function processSnapToRoadResponse(data) {
  snappedCoordinates = [];
  placeIdArray = [];
  for (var i = 0; i < data.snappedPoints.length; i++) {
    var latlng = new google.maps.LatLng(
        data.snappedPoints[i].location.latitude,
        data.snappedPoints[i].location.longitude);
    snappedCoordinates.push(latlng);
    placeIdArray.push(data.snappedPoints[i].placeId);
  }
}


function displayAndWatch(position) {
    // set current position
    setUserLocation(position);
    // watch position
    watchCurrentPosition();
}

function setUserLocation(pos) {
    // marker for userLocation
    userLocation = new google.maps.Marker({
           map : map,
           position : new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
           title : "You are here",
	});
    // pan to updated location
    map.panTo(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));

		//debugging
		var currval = $('.console').val();
		$('.console').val(currval += '\n' + 'Your updated position is:\n' + 'lat ' + pos.coords.latitude + 'lng: ' + pos.coords.longitude + '\n' + 'acc: ' + pos.coords.accuracy + '\n' + 'spd: ' + pos.coords.speed );
		var textarea = document.querySelector('.console');
		textarea.scrollTop = textarea.scrollHeight;
		//debugging
}

function collectCoords(pos) {
	var pos = pos.coords;
	polylines.push({lng: pos.longitude, lat: pos.latitude});
	console.log(polylines);
}

function watchCurrentPosition() {
    var positionTimer = navigator.geolocation.watchPosition(function(pos) {
        setMarkerPosition(userLocation, pos);
        map.panTo(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        collectCoords(pos);
    });
}

function setMarkerPosition(marker, pos) {
    marker.setPosition(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
		//debugging
		var currval = $('.console').val();
		$('.console').val(currval += '\n' + 'Your updated position is:\n' + 'lat ' + pos.coords.latitude + 'lng: ' + pos.coords.longitude + '\n' + 'acc: ' + pos.coords.accuracy + '\n' + 'spd: ' + pos.coords.speed  );
		var textarea = document.querySelector('.console');
		textarea.scrollTop = textarea.scrollHeight;
		//debugging
}