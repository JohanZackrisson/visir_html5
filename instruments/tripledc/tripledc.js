var visir = visir || {};

visir.TripleDC = function(id, elem)
{
	visir.TripleDC.parent.constructor.apply(this, arguments)
	
	var me = this;
	this._activeChannel = "+6V";
	this._elem = elem;
	
	var tpl = '<div class="tripledc">\
	<img src="instruments/tripledc/3dc.png" />\
	<div class="bigtext voltage"><span class="green">0</span>.000V</div>\
	<div class="bigtext current">0.500A</div>\
	<div class="channelselect">\
	<div class="smalltext p6v">+6V</div>\
	<div class="smalltext p25v hide">+25V</div>\
	<div class="smalltext m25v hide">-25V</div>\
	</div>\
	<div class="button button_p6v"><img class="up active" src="instruments/tripledc/6v_up.png" alt="+6v button" /><img class="down" src="instruments/tripledc/6v_down.png" alt="+6v button" /></div>\
	<div class="button button_p25v"><img class="up active" src="instruments/tripledc/25plusv_up.png" alt="+25v button" /><img class="down" src="instruments/tripledc/25plusv_down.png" alt="+25v button" /></div>\
	<div class="button button_m25v"><img class="up active" src="instruments/tripledc/25minusv_up.png" alt="-25v button" /><img class="down" src="instruments/tripledc/25minusv_down.png" alt="-25v button" /></div>\
	<div class="knob">\
		<div class="top">\
			<img src="instruments/tripledc/3dc_wheel.png" alt="handle" />\
		</div>\
	</div>\
	</div>';
		
	elem.append(tpl);
	
	var $doc = $(document);
	
	elem.find(".knob").turnable({offset: 90});
	
	// make all buttons updownButtons
	elem.find(".button").updownButton();
	
	elem.find("div.button_p6v").click( function() {
		me._SetActiveChannel("+6V");
	});
	elem.find("div.button_p25v").click( function() {
		me._SetActiveChannel("+25V");
	});
	elem.find("div.button_m25v").click( function() {
		me._SetActiveChannel("-25V");
	});

}

extend(visir.TripleDC, visir.DCPower)

visir.TripleDC.prototype._SetActiveChannel = function(ch) {
	trace("activechannel: " + ch);
	this._activeChannel = ch;
	
	this._elem.find(".channelselect > div").addClass("hide");
	switch(ch) {
		case "+6V": show = "p6v"; break;
		case "+25V": show = "p25v"; break;
		case "-25V": show = "m25v"; break;
		default: show = "p6v";
	}
	this._elem.find(".channelselect > div." + show).removeClass("hide");
}
