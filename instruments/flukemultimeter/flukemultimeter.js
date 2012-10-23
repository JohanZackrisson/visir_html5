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

	handle.on("mousedown touchstart", function(e) {

		e.preventDefault();
		//alert("elem clicked");
		//$('#info').html("clicked");
		console.log("clicked");
		var doc = $(document);

		doc.on("mousemove.rem touchmove.rem", function(e) {

			e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;

			var offset = handle.offset();
			//console.log("move: " + offset.left + " " + offset.top + " " + e.pageX + " " + e.pageY);
			var center = { x: 16, y: 102 };
			var dx = e.pageX - offset.left - center.x;
			var dy = e.pageY - offset.top - center.y;

			var deg = Math.atan2(dy, dx) * 180 / Math.PI;
			deg += 90;
			if (deg < 0) deg += 360;
			//console.log("rel: " + dx + " " + dy + " " + deg);

			deg = ( deg - deg % 30 )  + 15;

			//console.log("deg: " + deg);
			if( deg < 225 || deg > 315 )
			{
				setRotation(top, deg);
				
				var rotFuncMap = { 345: "off", 15: "ac volts", 45: "dc volts", 75: "off", 105: "resistance", 135: "off", 165: "ac current", 195: "dc current"};
				var mode = rotFuncMap[deg];
				dmm.SetMode(mode);
				dmm._result = "?";
				dmm.UpdateDisplay();
			}
		});

		doc.on("mouseup.rem touchend.rem", function(e) {
			console.log("up");
			handle.off(".rem");
			doc.off(".rem");
		});
	});
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
