"use strict";

var visir = visir || {};

visir.TripleDC = function(id, elem)
{
	visir.TripleDC.parent.constructor.apply(this, arguments)
	
	var me = this;
	this._activeChannel = "6V+";
	this._elem = elem;
	
	// all the values are represented times 1000 to avoid floating point trouble
	// XXX: need to change this later, both voltage and current has an active digit
	this._values = {
		"6V+": { voltage: 0, current: 5000, digit: 2 },
		"25V+": { voltage: 0, current: 5000, digit: 2 },
		"25V-": { voltage: 0, current: 5000, digit: 2 }
	 }
	
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
	<div class="button button_left"><img class="up active" src="instruments/tripledc/arrowleft_up.png" alt="left button" /><img class="down" src="instruments/tripledc/arrowleft_down.png" alt="left button" /></div>\
	<div class="button button_right"><img class="up active" src="instruments/tripledc/arrowright_up.png" alt="right button" /><img class="down" src="instruments/tripledc/arrowright_down.png" alt="right button" /></div>\
	<div class="knob">\
		<div class="top">\
			<img src="instruments/tripledc/3dc_wheel.png" alt="handle" />\
		</div>\
	</div>\
	</div>';
		
	elem.append(tpl);
	
	var $doc = $(document);
	
	var prev = 0;
	
	function handleTurn(deg) {
		var diff = deg - prev;
		// fixup the wrapping
		if (diff > 180) diff = -360 + diff;
		else if (diff < -180) diff = 360 + diff;
		
		if (Math.abs(diff) > 36) {
			prev = deg;
			//trace("diff: " + diff);
			if (diff < 0) me._DecDigit();
			else if (diff > 0) me._IncDigit();
		}

		return deg;
	}
	
	elem.find(".knob").turnable({offset: 90, turn: handleTurn });
	
	// make all buttons updownButtons
	elem.find(".button").updownButton();
	
	elem.find("div.button_p6v").click( function() {
		me._SetActiveChannel("6V+");
	});
	elem.find("div.button_p25v").click( function() {
		me._SetActiveChannel("25V+");
	});
	elem.find("div.button_m25v").click( function() {
		me._SetActiveChannel("25V-");
	});
	elem.find("div.button_left").click( function() {
			var aCh = me._GetActiveChannel();
			trace("digit: " + (aCh.digit + 1));
			me._SetActiveValue(aCh.voltage, aCh.digit + 1);
	});
	elem.find("div.button_right").click( function() {
			var aCh = me._GetActiveChannel();
			trace("digit: " + (aCh.digit -1));
			me._SetActiveValue(aCh.voltage, aCh.digit - 1);
	});
	
	// XXX: need to fix this when making it possible to change current limits
	var blink = elem.find(".tripledc .voltage");
	setInterval(function() {
		blink.toggleClass("on");
	},500);
	
	me._UpdateDisplay();
}

extend(visir.TripleDC, visir.DCPower)

function _lightNum(strnum, digit) {
	var out = "";
	//trace("lightnum: " + strnum + " " + digit)
	
	var idx = 0;
	for(var i=strnum.length - 1; i >= 0; i--)
	{
		if (strnum[i] == ".") {
			out = strnum[i] + out;
			continue;
		}
		
		if (idx == digit) {
			out = '<span class="green">'+ strnum[i] + '</span>' + out;
		} else {
			out = strnum[i] + out;
		}
		idx++;
	}
	
	return out;
}

visir.TripleDC.prototype._UpdateDisplay = function(ch) {
	var aCh = this._GetActiveChannel();
	var digitoffset = 0;
	if (aCh.voltage >= 10000) {
		digitoffset = 1;
	} 
	//var fixed = (aCh.voltage >= 10000) ? 2 : 3;
	var num = (aCh.voltage / 1000).toFixed(3 - digitoffset);
	this._elem.find(".voltage").html( _lightNum(num, aCh.digit - digitoffset) + "V" );
}

visir.TripleDC.prototype._GetActiveChannel = function() {
	return this._values[this._activeChannel];
}

visir.TripleDC.prototype._SetActiveChannel = function(ch) {
	trace("activechannel: " + ch);
	this._activeChannel = ch;
	
	this._elem.find(".channelselect > div").addClass("hide");
	var show = "";
	switch(ch) {
		case "6V+": show = "p6v"; break;
		case "25V+": show = "p25v"; break;
		case "25V-": show = "m25v"; break;
		default: show = "p6v";
	}
	this._elem.find(".channelselect > div." + show).removeClass("hide");
	this._UpdateDisplay();
}

visir.TripleDC.prototype._SetActiveValue = function(val, digit) {
	var aCh = this._GetActiveChannel();
	if (val < 0 || val > 25000) return;
	if (digit > 4 || digit < 0) return;
	//trace("setactivevalue: " + val + " " + digit + " " + Math.pow(10, digit));
	if (val > 1000 && val < Math.pow(10, digit)) return;
	if (val < 10000 && digit == 4) return;
	aCh.voltage = val;
	aCh.digit = digit;
	this.GetChannel(this._activeChannel).voltage = (val / 1000);
	this._UpdateDisplay();
}

visir.TripleDC.prototype._DecDigit = function() {
	var aCh = this._GetActiveChannel();
	this._SetActiveValue(aCh.voltage - Math.pow(10, aCh.digit), aCh.digit);
}

visir.TripleDC.prototype._IncDigit = function() {
	var aCh = this._GetActiveChannel();
	this._SetActiveValue(aCh.voltage + Math.pow(10, aCh.digit), aCh.digit);
}
