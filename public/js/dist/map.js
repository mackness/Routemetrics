"use strict";

function Map() {
  google.charts.load("current", { packages: ["corechart"] }), this.mapReady = !1, this.tracking = !1, this.roughCoords = [], this.snappedCoords = [], this.watch, this.speed = 0, this.distance = 0, this.distanceService = new google.maps.DistanceMatrixService(), this.elevationService = new google.maps.ElevationService(), this.key = "AIzaSyDLIr5g6ySB20U-oc8-NmrfYTZhc70bMwY", this.geolocation = "geolocation" in navigator, this.elements = { mapContainer: document.querySelector("#map"), body: document.body }, this.init();
}Map.prototype.getCurrentLocation = function (t, e) {
  this.geolocation ? navigator.geolocation.getCurrentPosition(function (e) {
    t(e.coords);
  }, function (t) {
    e(t);
  }) : alert("sorry no geolocation support");
}, Map.prototype.watchPosition = function (t) {
  this.geolocation ? navigator.geolocation.watchPosition(function (e) {
    t(e.coords);
  }, function (e) {
    t(e);
  }) : alert("sorry no geolocation support");
}, Map.prototype.formatPath = function (t) {
  return t.map(function (t) {
    return [t.lat(), t.lng()].join(",");
  }).join("|");
}, Map.prototype.snapToRoads = function () {
  Ajax("https://roads.googleapis.com/v1/snapToRoads?path=" + this.formatPath(this.roughCoords) + "&key=" + this.key, function (t) {
    this.snappedCoords = t.snappedPoints;
  }.bind(this), function (t) {
    console.log(t);
  });
}, Map.prototype.getDistance = function () {
  distanceService.getDistanceMatrix({ origins: [this.roughCoords[0]], destinations: [this.roughCoords[this.roughCoords.length - 1]], travelMode: "BICYCLING", unitSystem: google.maps.UnitSystem.METRIC, avoidHighways: !1, avoidTolls: !1 }, function (t, e) {
    "OK" !== e ? alert("Error was: " + e) : (this.distance = t.rows[0].elements[0].distance.text, this.elements.distanceElement.innerHTML = this.distance);
  }.bind(this));
}, Map.prototype.getElevation = function (t) {
  this.elevationService.getElevationAlongPath({ path: t, samples: 100 }, this.plotElevation.bind(this));
}, Map.prototype.plotElevation = function (t, e) {
  var n = this.elements.graphElement;if ("OK" !== e) return n.innerHTML = "Cannot show elevation: request failed because " + e, void 0;console.log(google.visualization);var a = new google.visualization.ColumnChart(n),
      i = new google.visualization.DataTable();i.addColumn("string", "Sample"), i.addColumn("number", "Elevation");for (var o = 0; o < t.length; o++) {
    i.addRow(["", t[o].elevation]);
  }a.draw(i, { height: 200, legend: "none", titleY: "Elevation (m)" });
}, Map.prototype.drawPloyline = function () {
  var t = new google.maps.Polyline({ path: this.roughCoords, strokeColor: "green", strokeWeight: 3 });t.setMap(this.map);
}, Map.prototype.initMap = function (t, e) {
  this.map = new google.maps.Map(t, { zoom: 18, mapTypeControl: !1, disableDefaultUI: !0, center: { lat: e.latitude, lng: e.longitude } });
}, Map.prototype.marker = function (t) {
  this.marker = new google.maps.Marker({ position: { lat: t.latitude, lng: t.longitude }, map: this.map });
}, Map.prototype.insertMapElement = function (t, e) {
  this.map.controls[google.maps.ControlPosition[e]].push(t);
}, Map.prototype.trackingButton = function () {
  var t = document.createElement("button");t.classList.add("tracking-button"), t.classList.add("tracking-button--start"), t.innerHTML = "Start", t.addEventListener("click", function (e) {
    e.preventDefault(), t.classList.contains("tracking-button--start") ? (t.classList.remove("tracking-button--start"), t.classList.add("tracking-button--stop"), t.innerHTML = "Stop", this.tracking = !0, this.elements.body.classList.add("tracking-active"), this.stopwatch.start(), this.init()) : (t.classList.remove("tracking-button--stop"), t.classList.add("tracking-button--start"), t.innerHTML = "Start", this.tracking = !1, this.elements.body.classList.remove("tracking-active"), this.stopwatch.stop(), this.init());
  }.bind(this)), this.insertMapElement(t, "BOTTOM_CENTER");
}, Map.prototype.stopwatchElement = function () {
  var t = document.createElement("div"),
      e = document.createElement("div"),
      n = document.createElement("span");return n.innerHTML = "time: ", t.innerHTML = "0:00:000", n.classList.add("data-panel__label"), e.classList.add("data-panel__row"), t.classList.add("data-panel__stopwatch"), e.appendChild(n), e.appendChild(t), this.watch = t, this.elements.stopwatchElement = t, e;
}, Map.prototype.speedElement = function () {
  var t = document.createElement("div"),
      e = document.createElement("div"),
      n = document.createElement("span");return n.innerHTML = "speed: ", t.innerHTML = this.speed, n.classList.add("data-panel__label"), e.classList.add("data-panel__row"), t.classList.add("data-panel__speed"), e.appendChild(n), e.appendChild(t), this.speed = t, this.elements.speedElement = t, e;
}, Map.prototype.distanceElement = function () {
  var t = document.createElement("div"),
      e = document.createElement("div"),
      n = document.createElement("span");return n.innerHTML = "distance: ", console.log("dist", this.distance), n.classList.add("data-panel__label"), e.classList.add("data-panel__row"), t.classList.add("data-panel__distance"), e.appendChild(n), e.appendChild(t), t.innerHTML = this.distance + " (km)", this.elements.distanceElement = t, e;
}, Map.prototype.elevationElement = function () {
  var t = document.createElement("div"),
      e = document.createElement("div"),
      n = document.createElement("span");return n.innerHTML = "elevation: ", n.classList.add("data-panel__label"), e.classList.add("data-panel__row"), t.classList.add("data-panel__elevation"), e.appendChild(n), e.appendChild(t), console.log(this.elevation), t.innerHTML = this.elevation || "0 (m)", this.elements.elevationElement = t, e;
}, Map.prototype.graphElement = function () {
  var t = document.createElement("div"),
      e = document.createElement("div");return e.classList.add("data-panel__row"), t.classList.add("data-panel__graph"), e.appendChild(t), this.elements.graphElement = t, e;
}, Map.prototype.dataPanelElement = function () {
  var t = document.createElement("div");t.classList.add("data-panel"), t.style.height = window.innerHeight - 225 + "px", t.appendChild(this.stopwatchElement()), t.appendChild(this.speedElement()), t.appendChild(this.distanceElement()), t.appendChild(this.elevationElement()), t.appendChild(this.graphElement()), this.insertMapElement(t, "BOTTOM_RIGHT");
}, Map.prototype.init = function () {
  this.tracking ? this.watchPosition(function (t) {
    var e = new google.maps.LatLng(t.latitude, t.longitude),
        n = new google.maps.LatLng(t.latitude - 8e-4, t.longitude);this.roughCoords.push(e), this.elements.speedElement.innerHTML = Math.round(t.speed) || "0 (km/h)", this.roughCoords.length % 10 == 0 && (this.snapToRoads(), this.getDistance(), this.getElevation(), this.getElevation(path, this.elevator, this.map)), this.drawPloyline(), this.map.panTo(n), this.marker.setPosition(e), this.getElevation([e, n], this.elevator, this.map);
  }.bind(this), function (t) {
    console.log("error", t);
  }) : this.getCurrentLocation(function (t) {
    this.initMap(this.elements.mapContainer, t), this.marker(t), this.trackingButton(), this.dataPanelElement(), this.stopwatch = new Stopwatch(this.watch);
  }.bind(this), function (t) {
    console.log("error", t);
  });
};