"use strict";
var visir = visir || {};

visir.FlukeMultimeter = function(id, elem)
{
	//"off", "ac volts", "dc volts", "off", "resistance", "off", "ac current", "dc current");
	//var rotFuncMap = { 345: "off", 15: "ac volts", 45: "dc volts", 75: "off", 105: "resistance", 135: "off", 165: "ac current", 195: "dc current"};
	
	var dmm = this;
	this._elem = elem;
	
	visir.FlukeMultimeter.parent.constructor.apply(this, arguments)
	
	var tpl = '<div class="flukedmm">\
	<img src="instruments/flukemultimeter/fluke23.png" />\
	<div class="dmm_value" id="value">12.3</div>\
	<div class="rot">\
		<div class="top vred">\
			<img src="instruments/flukemultimeter/fluke23_vred.png" alt="handle" />\
		</div>\
	</div>\
	</div>';
		
	elem.append(tpl);
	
	var top = elem.find(".top");
	setRotation(top, 345);
	
	var handle = elem.find(".rot");
	
	function handleTurn(deg)
	{
		deg = ( deg - deg % 30 )  + 15;

		if (deg <= 105 || deg >= 255)
		{
			setRotation(top, deg);

			var rotFuncMap = { 255: "off", 285: "ac volts", 315: "dc volts", 345: "off", 15: "resistance", 45: "off", 75: "ac current", 105: "dc current"};
			var mode = rotFuncMap[deg];
			dmm.SetMode(mode);
			dmm._result = "?";
			dmm.UpdateDisplay();
			return deg;
		}
		return undefined; // don't set a new rotation
	}
	
	handle.turnable({ offset: 90, turn: handleTurn })
}

extend(visir.FlukeMultimeter, visir.Multimeter)

visir.FlukeMultimeter.prototype.Test = function() {
	
}

visir.FlukeMultimeter.prototype.UpdateDisplay = function() {
	var out = this.GetResult();
	if (typeof out == "number") out = out.toPrecision(4);
	this._elem.find(".dmm_value").text(out);
}

visir.FlukeMultimeter.prototype.ReadResponse = function(response) {
	visir.FlukeMultimeter.parent.ReadResponse.apply(this, arguments)
	this.UpdateDisplay();
}
