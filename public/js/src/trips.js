"use strict";

function Trips(outlets) {
	this.outlets = outlets;
	this.elevationService = new google.maps.ElevationService;
	this.elements = {
		button: document.querySelectorAll('.btn-danger'),
		outlets: document.querySelectorAll('.chart__outlet')
	};

	this.init();
}

Trips.prototype.getElevationPoints = function (trip, path) {
	this.elevationService.getElevationAlongPath({
		'path': path,
		'samples': 50
	}, this.plotElevation.bind(this, trip));
}

Trips.prototype.plotElevation = function (chartEl, elevations, status) {

	if (status !== 'OK') {
		chartEl.innerHTML = 'Cannot show elevation: request failed because ' + status;
		return;
	}

	var chart = new google.visualization.LineChart(chartEl);
	var data = new google.visualization.DataTable();

	data.addColumn('string', 'Sample');
	data.addColumn('number', 'Elevation');
	for (var i = 0; i < elevations.length; i++) {
		data.addRow(['', elevations[i].elevation]);
	}

	chart.draw(data, {
		height: 200,
		legend: 'none',
		titleY: 'Elevation (m)'
	});
}

Trips.prototype.constructPath = function () {
	Array.prototype.forEach.call(this.outlets, function (trip, i) {
		if (trip.dataset.route != 0) {
			var path = JSON.parse(trip.dataset.route).map(function (coords, i) {
				return {
					lat: +coords.location.latitude,
					lng: +coords.location.longitude,
				}
			})
			this.getElevationPoints(trip, path)
		}
	}.bind(this))
}

Trips.prototype.init = function () {

	google.charts.load('current', { packages: ['corechart'] });

	google.charts.setOnLoadCallback(function () {
		this.constructPath();

		$(this.elements.button).on('click', function (event) {
			event.preventDefault();
			$(this).text('Deleting')
			$.ajax({
				"url": '/trips/' + $(this).data('index'),
				"type": 'DELETE',
				"success": function (response, status) {
					$(this).closest('.trip').fadeOut()
				}.bind(this)
			})
		})
	}.bind(this));
}
