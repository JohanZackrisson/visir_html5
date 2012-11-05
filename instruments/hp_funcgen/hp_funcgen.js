"use strict";

var visir = visir || {};

visir.HPFunctionGenerator = function(id, elem)
{
	visir.HPFunctionGenerator.parent.constructor.apply(this, arguments)
	
	var me = this;
	this._activeChannel = 0;
	this._elem = elem;
		
	var tpl = '<div class="hp_funcgen">\
	<img src="instruments/hp_funcgen/images/fgen.png" />\
	<div class="bigtext num_display">1.00<span class="green">0</span>0000</div>\
	<div class="bigtext num_unit">KHz</div>\
	<div class="funcselect">\
	<div class="sine">[sine]</div>\
	<div class="square">[square]</div>\
	<div class="triangle">[triangle]</div>\
	<div class="sawtooth">[sawtooth]</div>\
	</div>\
	<div class="button button_sine"><img class="up active" src="instruments/hp_funcgen/images/reflad_sin_up.png" alt="sine button" /><img class="down" src="instruments/hp_funcgen/images/reflad_sin_down.png" alt="sine button" /></div>\
	<div class="button button_square"><img class="up active" src="instruments/hp_funcgen/images/reflad_square_up.png" alt="square button" /><img class="down" src="instruments/hp_funcgen/images/reflad_square_down.png" alt="square button" /></div>\
	<div class="button button_tri"><img class="up active" src="instruments/hp_funcgen/images/reflad_tri_up.png" alt="tri button" /><img class="down" src="instruments/hp_funcgen/images/reflad_tri_down.png" alt="tri button" /></div>\
	<div class="button button_saw"><img class="up active" src="instruments/hp_funcgen/images/reflad_saw_up.png" alt="saw button" /><img class="down" src="instruments/hp_funcgen/images/reflad_saw_down.png" alt="saw button" /></div>\
	<div class="button button_noise"><img class="up active" src="instruments/hp_funcgen/images/reflad_noise_up.png" alt="noise button" /><img class="down" src="instruments/hp_funcgen/images/reflad_noise_down.png" alt="noise button" /></div>\
	<div class="button button_arb"><img class="up active" src="instruments/hp_funcgen/images/reflad_arb_up.png" alt="arb button" /><img class="down" src="instruments/hp_funcgen/images/reflad_arb_down.png" alt="arb button" /></div>\
	<div class="button button_enter"><img class="up active" src="instruments/hp_funcgen/images/enter_up.png" alt="enter button" /><img class="down" src="instruments/hp_funcgen/images/enter_down.png" alt="enter button" /></div>\
	<div class="button button_freq"><img class="up active" src="instruments/hp_funcgen/images/ren_freq_up.png" alt="freq button" /><img class="down" src="instruments/hp_funcgen/images/ren_freq_down.png" alt="freq button" /></div>\
	<div class="button button_ampl"><img class="up active" src="instruments/hp_funcgen/images/ren_ampl_up.png" alt="ampl button" /><img class="down" src="instruments/hp_funcgen/images/ren_ampl_down.png" alt="ampl button" /></div>\
	<div class="button button_offset"><img class="up active" src="instruments/hp_funcgen/images/ren_offset_up.png" alt="offset button" /><img class="down" src="instruments/hp_funcgen/images/ren_offset_down.png" alt="offset button" /></div>\
	<div class="button button_single"><img class="up active" src="instruments/hp_funcgen/images/ren_single_up.png" alt="single button" /><img class="down" src="instruments/hp_funcgen/images/ren_single_down.png" alt="single button" /></div>\
	<div class="button button_recall"><img class="up active" src="instruments/hp_funcgen/images/ren_recall_up.png" alt="recall button" /><img class="down" src="instruments/hp_funcgen/images/ren_recall_down.png" alt="recall button" /></div>\
	<div class="button button_enternumber"><img class="up active" src="instruments/hp_funcgen/images/ren_enternumber_up.png" alt="enternumber button" /><img class="down" src="instruments/hp_funcgen/images/ren_enternumber_down.png" alt="enternumber button" /></div>\
	<div class="button button_shift"><img class="up active" src="instruments/hp_funcgen/images/shift_up.png" alt="shift button" /><img class="down" src="instruments/hp_funcgen/images/shift_down.png" alt="shift button" /></div>\
	<div class="button button_up"><img class="up active" src="instruments/hp_funcgen/images/small_up_up.png" alt="up button" /><img class="down" src="instruments/hp_funcgen/images/small_up_down.png" alt="up button" /></div>\
	<div class="button button_down"><img class="up active" src="instruments/hp_funcgen/images/small_down_up.png" alt="down button" /><img class="down" src="instruments/hp_funcgen/images/small_down_down.png" alt="down button" /></div>\
	<div class="button button_right"><img class="up active" src="instruments/hp_funcgen/images/small_right_up.png" alt="right button" /><img class="down" src="instruments/hp_funcgen/images/small_right_down.png" alt="right button" /></div>\
	<div class="button button_left"><img class="up active" src="instruments/hp_funcgen/images/small_left_up.png" alt="left button" /><img class="down" src="instruments/hp_funcgen/images/small_left_down.png" alt="left button" /></div>\
	<div class="knob">\
		<div class="top">\
			<img src="instruments/hp_funcgen/images/wheel.png" alt="handle" />\
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
		
		if (Math.abs(diff) > 360/10) {
			prev = deg;
			//trace("diff: " + diff);
			//if (diff < 0) me._DecDigit();
			//else if (diff > 0) me._IncDigit();
		}

		return deg;
	}

	
	elem.find(".knob").turnable({offset: 90, turn: handleTurn });
	
	// make all buttons updownButtons
	elem.find(".button").updownButton();
	
/*	elem.find("div.button_p6v").click( function() {
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
	*/
	
	// XXX: need to fix this when making it possible to change current limits
	var blink = elem.find(".hp_funcgen .num_display");
	setInterval(function() {
		blink.toggleClass("on");
	},500);
	
	//me._UpdateDisplay();
}

extend(visir.HPFunctionGenerator, visir.FunctionGenerator)

/*
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

visir.HPFunctionGenerator.prototype._UpdateDisplay = function(ch) {
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
*/
