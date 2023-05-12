"use strict";

var visir = visir || {};

visir.LlTripleDC = function(id, elem)
{
	visir.LlTripleDC.parent.constructor.apply(this, arguments)

	this._elem = elem;
	this._id = id;

	this._Redraw([0, 0, 0]);
};

extend(visir.LlTripleDC, visir.DCPower)

visir.LlTripleDC.prototype._Redraw = function (initialValue) 
{
	var me = this;
    
	this._elem.empty();

	this._activeChannel = "5V+";

	// all the values are represented times 1000 to avoid floating point trouble
	// XXX: need to change this later, both voltage and current has an active digit
	this._values = {
		"5V+": { voltage: 500, current: 5000, digit: 2, min: 500, max: 5000 },
		"5V-": { voltage: -500, current: 5000, digit: 2, min: -5000, max: -500 }
	 }

	var imgbase = "instruments/tripledc/images";
	if (visir.BaseLocation) imgbase = visir.BaseLocation + imgbase;

	var tpl = '<div class="tripledc">\
	<img src="%img%/ll3dc.png" width="720" height="449" draggable="false" />\
	<div class="bigtext voltage"><span class="green">0</span>.000V</div>\
	<div class="bigtext current">0.500A</div>\
	<div class="channelselect">\n'

    if (this._activeChannel == "5V+") {
        tpl += '<div class="smalltext p5v">+5V</div>';
    } else {
        tpl += '<div class="smalltext p5v hide">+5V</div>';
    }

    if (this._activeChannel == "5V-") {
        tpl += '<div class="smalltext m5v">-5V</div>';
    } else {
        tpl += '<div class="smalltext m5v hide">-5V</div>';
    }
	tpl += '</div>\n';
	tpl += '<div class="button button_p5v"><img class="up active" src="%img%/5plusv_up.png" alt="+5v button" /><img class="down" src="%img%/5plusv_down.png" alt="+5v button" /></div>\n';
	tpl += '<div class="button button_m5v"><img class="up active" src="%img%/5minusv_up.png" alt="-5v button" /><img class="down" src="%img%/5minusv_down.png" alt="-5v button" /></div>\n';
	tpl += '<div class="button button_left"><img class="up active" src="%img%/arrowleft_up.png" alt="left button" /><img class="down" src="%img%/arrowleft_down.png" alt="left button" /></div>\
	<div class="button button_right"><img class="up active" src="%img%/arrowright_up.png" alt="right button" /><img class="down" src="%img%/arrowright_down.png" alt="right button" /></div>\
	<div class="knob">\
		<div class="top">\
			<img src="%img%/3dc_wheel.png" alt="handle" />\
		</div>\
	</div>\
	<div class="manual_link"><a href="http://cp.literature.agilent.com/litweb/pdf/E3631-90002.pdf" target="_blank">%downloadManual%</a></div>\
	</div>';

	tpl = tpl.replace(/%img%/g, imgbase);
	tpl = tpl.replace(/%downloadManual%/g, visir.Lang.GetMessage("down_man"));

	this._elem.append(tpl);

	this._SetInitialValue("5V+", Number(initialValue[0]), 2);
	this._SetInitialValue("5V-", Number(initialValue[1]), 2);
	this._SetActiveChannel("5V+");
	this._activeChannel = "5V+";

	var $doc = $(document);

	var prev = 0;

	function handleTurn(elem, deg) {
		var diff = deg - prev;
		// fixup the wrapping
		if (diff > 180) diff = -360 + diff;
		else if (diff < -180) diff = 360 + diff;

		if (Math.abs(diff) > 360/10) {
			prev = deg;
			//trace("diff: " + diff);
			if (diff < 0) me._DecDigit();
			else if (diff > 0) me._IncDigit();
		}

		return deg;
	}

	if(!visir.Config.Get("readOnly"))
	{
		this._elem.find(".knob").turnable({offset: 90, turn: handleTurn });

		// make all buttons updownButtons
		this._elem.find(".button").updownButton();

		this._elem.find("div.button_p5v").click( function() {
			me._SetActiveChannel("5V+");
		});
		this._elem.find("div.button_m5v").click( function() {
			me._SetActiveChannel("5V-");
		});
		this._elem.find("div.button_left").click( function() {
				var aCh = me._GetActiveChannel();
				trace("digit: " + (aCh.digit + 1));
				me._SetActiveValue(aCh.voltage, aCh.digit + 1);
		});
		this._elem.find("div.button_right").click( function() {
				var aCh = me._GetActiveChannel();
				trace("digit: " + (aCh.digit -1));
				me._SetActiveValue(aCh.voltage, aCh.digit - 1);
		});
	}

	// XXX: need to fix this when making it possible to change current limits
	var blink = this._elem.find(".tripledc .voltage");
	setInterval(function() {
		blink.toggleClass("on");
	},500);

	me._UpdateDisplay();
};

visir.LlTripleDC.prototype._UpdateDisplay = function(showMeasured) {
	showMeasured = showMeasured || false;
	var aCh = this._GetActiveChannel();
	var digitoffset = 0;
	if (aCh.voltage >= 10000) {
		digitoffset = 1;
	}

	var value = 0;
	if (showMeasured) {
		var responseData = this._channels[this._activeChannel];
		if (!responseData.enabled) return;
		value = responseData.measured_voltage;
		if (value == 0.0) return;
	} else {
		value = (aCh.voltage / 1000);
	}

	//var value = (showMeasured) ? this._channels[this._activeChannel].measured_voltage : (aCh.voltage / 1000);
	trace("value: " + value);

	//var fixed = (aCh.voltage >= 10000) ? 2 : 3;
	//var num = (aCh.voltage / 1000).toFixed(3 - digitoffset);
	var num = value.toFixed(3 - digitoffset);
	this._elem.find(".voltage").html(visir.LightNum(num, aCh.digit - digitoffset) + "V" );
}

visir.LlTripleDC.prototype._GetActiveChannel = function() {
	return this._values[this._activeChannel];
}

visir.LlTripleDC.prototype._SetActiveChannel = function(ch) {
	trace("activechannel: " + ch);
	this._activeChannel = ch;

	this._elem.find(".channelselect > div").addClass("hide");
	var show = "";
	switch(ch) {
		case "5V+": show = "p5v"; break;
		case "5V-": show = "m5v"; break;
		default: show = "p6v";
	}
	this._elem.find(".channelselect > div." + show).removeClass("hide");
	this._UpdateDisplay();
}

visir.LlTripleDC.prototype._SetActiveValue = function(val, digit) {
	var aCh = this._GetActiveChannel();
	if ((val < aCh.min) || (val > aCh.max)) return;
	if (digit > 4 || digit < 0) return;
	//trace("setactivevalue: " + val + " " + digit + " " + Math.pow(10, digit));
	if (val > 1000 && val < Math.pow(10, digit)) return;
	if (val < 10000 && digit == 4) return;
	aCh.voltage = val;
	aCh.digit = digit;
	this.GetChannel(this._activeChannel).voltage = (val / 1000);
	this._UpdateDisplay();
}

visir.LlTripleDC.prototype._DecDigit = function() {
	var aCh = this._GetActiveChannel();
	this._SetActiveValue(aCh.voltage - Math.pow(10, aCh.digit), aCh.digit);
}

visir.LlTripleDC.prototype._IncDigit = function() {
	var aCh = this._GetActiveChannel();
	this._SetActiveValue(aCh.voltage + Math.pow(10, aCh.digit), aCh.digit);
}

visir.LlTripleDC.prototype.ReadResponse = function(response) {
	var me = this;
	visir.LlTripleDC.parent.ReadResponse.apply(this, arguments);

	this._UpdateDisplay(true);
}

visir.LlTripleDC.prototype._ReadCurrentValues = function() {
	/* Only used if unrFormat = true */
	var volts = "";
	volts = this._channels["5V+"].voltage  * 1000 + ":" + this._channels["5V-"].voltage  * 1000;
	return volts;
}

visir.LlTripleDC.prototype._SetInitialValue = function(ch, val, digit) {
	this._activeChannel = ch;
	this._SetActiveValue(val,digit);
}

visir.LlTripleDC.prototype.ReadSave = function($xml)
{
	var initialValue = [0, 0, 0];

	// Only for backwards compatibility
	var $instrumentsvalues = $xml.find("instrumentsvalues");
	if ($instrumentsvalues.length == 1) {
		var htmlinstrumentsvalues = $instrumentsvalues.attr("htmlinstrumentsvalues");
		if (htmlinstrumentsvalues) {
			$.each(htmlinstrumentsvalues.split("|"), function (pos, instrumentData) {
				var instrumentName = instrumentData.split("#")[0];
				if (instrumentName == "TripleDC") {
					var numbers = instrumentData.split("#")[1].split(":");
					initialValue = [ parseInt(numbers[0]), parseInt(numbers[1]), parseInt(numbers[2]) ];
				}
			});
		}
	}

    var $dcPower5voltage = $xml.find("dc_output[channel='5V+']");
    if ($dcPower5voltage.length == 1) {
        initialValue[1] = Number($dcPower5voltage.attr("value"));
    }

    var $dcPowerM5voltage = $xml.find("dc_output[channel='5V-']");
    if ($dcPowerM5voltage.length == 1) {
        initialValue[2] = Number($dcPowerM5voltage.attr("value"));
    }

	this._Redraw(initialValue);
}

visir.LlTripleDC.prototype.WriteSave = function()
{
	var $xml = $("<dcpower></dcpower>");
    var channel = $("<dc_output channel=\"5V+\" value=\"" + (this._channels["5V+"].voltage * 1000) + "\"/>");
    $xml.append(channel);
    var channel = $("<dc_output channel=\"5V-\" value=\"" + (this._channels["5V-"].voltage * 1000) + "\"/>");
    $xml.append(channel);
	return $xml;
};
