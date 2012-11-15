//"use strict";

var visir = visir || {};

visir.AgilentOscilloscope = function(id, elem)
{
	visir.AgilentOscilloscope.parent.constructor.apply(this, arguments)
	
	this._voltages = [5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001];
	this._voltIdx = [2,2];
	
	this._timedivs = [0.005, 0.002, 0.001, 0.0005, 0.0002, 0.0001, 0.00005, 0.00002, 0.00001];
	this._timeIdx = 1;
	
	var me = this;
	this._$elem = elem;
	
	var imgbase = "instruments/ag_oscilloscope/images";
		
	var tpl = '<div class="ag_osc">\
	<img src="%img%/osc.jpg" />\
	<div class="stepwheel small horz_offset"><img class="active top" src="%img%/osc_wheel_small_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_small_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel small offset_ch1"><img class="active top" src="%img%/osc_wheel_small_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_small_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel small offset_ch2"><img class="active top" src="%img%/osc_wheel_small_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_small_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel small offset_trg"><img class="active top" src="%img%/osc_wheel_small_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_small_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel large horz"><img class="active top" src="%img%/osc_wheel_big_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_big_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel large vert_ch1"><img class="active top" src="%img%/osc_wheel_big_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_big_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel large vert_ch2"><img class="active top" src="%img%/osc_wheel_big_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_big_2.png" alt="stepwheel" /></div>\
	<div class="display_buttons">\
		<div class="button display_button_1"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_2"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_3"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_4"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_5"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_6"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
	</div>\
	<div class="button channel_1">\
		<div class="dark">\
			<img class="up active" src="%img%/osc_vert_off_up_enable_1.png" alt="display button" /><img class="down" src="%img%/osc_vert_off_down_enable_1.png" alt="display button" />\
		</div>\
		<div class="light">\
			<img class="up active" src="%img%/osc_vert_on_up_enable_1.png" alt="display button" /><img class="down" src="%img%/osc_vert_on_down_enable_1.png" alt="display button" />\
		</div>\
	</div>\
	<div class="button channel_2">\
		<div class="dark">\
			<img class="up active" src="%img%/osc_vert_off_up_enable_2.png" alt="display button" /><img class="down" src="%img%/osc_vert_off_down_enable_2.png" alt="display button" />\
		</div><div class="light">\
			<img class="up active" src="%img%/osc_vert_on_up_enable_2.png" alt="display button" /><img class="down" src="%img%/osc_vert_on_down_enable_2.png" alt="display button" />\
		</div>\
	</div>\
	<div class="display">\
		<div class="background">\
			<div class="channel ch1"><span class="channelname">1</span><span class="voltage voltage_ch1">1.00V/</span></div>\
			<div class="channel ch2"><span class="channelname">2</span><span class="voltage voltage_ch2">1.00V/</span></div>\
			<div class="timedelay"><img class="arrow" src="%img%/delay_arrow.png" alt="delay arrow" /><span class="voltage">0.00s</span></div>\
			<div class="timescale"><span class="voltage timediv">500us</span></div>\
			<div class="trigtype"><span class="voltage">Level</span><img class="flank" src="%img%/osc_trig_edge_up_small.png" alt="trigger flank" /><span class="channelname">1</span></div>\
			<div class="triglevel"><span class="voltage">0.00V</span></div>\
			<div class="graph">\
				<canvas class="grid" width="330" height="208"></canvas>\
				<canvas class="plot" width="330" height="208"></canvas>\
			</div>\
		</div>\
	</div>\
	</div>';
	
	tpl = tpl.replace(/%img%/g, imgbase);
		
	elem.append(tpl);

	var prev = 0;
	
	function newHandleFunc(up, down)
	{
		up = up || function() {};
		down = down || function() {};
		return function(elem, deg) {
			var diff = deg - prev;
			// fixup the wrapping
			if (diff > 180) diff = -360 + diff;
			else if (diff < -180) diff = 360 + diff;
		
			if (Math.abs(diff) > 360/10) {
				prev = deg;
				//trace("diff: " + diff + " " + elem.html());
				if (diff < 0) down();
				else if (diff > 0) up();
				elem.find("img").toggleClass("active");
			}
		}
	}
	
	function handleTurn(elem, deg)
	{
		//trace("turn: " + deg);
		var diff = deg - prev;
		// fixup the wrapping
		if (diff > 180) diff = -360 + diff;
		else if (diff < -180) diff = 360 + diff;
		
		if (Math.abs(diff) > 360/10) {
			prev = deg;
			//trace("diff: " + diff + " " + elem.html());
			//if (diff < 0) me._DecDigit();
			//else if (diff > 0) me._IncDigit();
			elem.find("img").toggleClass("active");
		}
		
		// dont return, we want it undefined
	}
	
	// abuses the turnable to get events, but not turning the component at all
	elem.find(".horz_offset").turnable({turn: newHandleFunc(function() { trace("up");}, function() {trace("down");}) });
	elem.find(".offset_ch1").turnable({turn: newHandleFunc(function() { trace("up");}, function() {trace("down");}) });
	elem.find(".offset_ch2").turnable({turn: newHandleFunc(function() { trace("up");}, function() {trace("down");}) });
	elem.find(".offset_trg").turnable({turn: newHandleFunc(function() { trace("up");}, function() {trace("down");}) });
	elem.find(".horz").turnable({turn: newHandleFunc(function() { me._SetTimedivIdx(me._timeIdx+1); }, function() { me._SetTimedivIdx(me._timeIdx-1); }) });
	elem.find(".vert_ch1").turnable({turn: newHandleFunc(function() { me._SetVoltIdx(0, me._voltIdx[0]+1); }, function() { me._SetVoltIdx(0, me._voltIdx[0]-1);}) });
	elem.find(".vert_ch2").turnable({turn: newHandleFunc(function() { me._SetVoltIdx(1, me._voltIdx[1]+1); }, function() { me._SetVoltIdx(1, me._voltIdx[1]-1);}) });

	elem.find(".button").updownButton();
	
	var $doc = $(document);
	
	
	//me._UpdateDisplay();
	
	me._DrawGrid(elem.find(".grid"));
	me._DrawPlot(elem.find(".plot"));
	
	setInterval(function() {
		me._DrawPlot(elem.find(".plot"));
	},500);
	
	me._UpdateDisplay();

}

extend(visir.AgilentOscilloscope, visir.Oscilloscope)

visir.AgilentOscilloscope.prototype._DrawGrid = function($elem)
{
	var context = $elem[0].getContext('2d');
	
	//context.strokeStyle = "#004000";
	context.strokeStyle = "#00ff00";
	context.lineWidth		= 0.5;
	context.beginPath();
	
	var len = 3.5;
	var w = $elem.width();
	var h = $elem.height();
	var xspacing = w / 10;
	var yspacing = h / 8;
	
	for(var i=1;i<=9;i++) {
		var x = xspacing * i;
		x += 0.5;
		context.moveTo(x, 0);
		context.lineTo(x, h);
	}

	for(var i=1;i<=10*5 ;i++) {
		if (i % 5 == 0) continue;
		var x = (xspacing / 5) * i;
		x += 0.5;
		var h2 = (h / 2) + 0.5;
		context.moveTo(x, h2 - len);
		context.lineTo(x, h2 + len);
	}

	for(var i=1;i<=7;i++) {
		var y = yspacing * i;
		context.moveTo(0, y+0.5);
		context.lineTo(w, y+0.5);
	}
	
	for(var i=1;i<=7*5 ;i++) {
		if (i % 4 == 0) continue;
		var y = (yspacing / 4) * i;
		y += 0.5;
		var w2 = (w / 2);
		w2 = Math.floor(w2) + 0.5;
		context.moveTo(w2 - len, y);
		context.lineTo(w2 + len, y);
	}
	
	context.stroke();
}

visir.AgilentOscilloscope.prototype._DrawPlot = function($elem)
{
	var context = $elem[0].getContext('2d');
	context.strokeStyle = "#00ff00";
	context.lineWidth		= 0.7;
	
	var w = $elem.width();
	var h = $elem.height();
	context.clearRect(0,0, $elem.width(), $elem.height());
	context.beginPath();
	
	var first = true;
	
	for(var i=0;i<400;i++) {
		var x = i*w / 400;
		var y = Math.sin(i/50) * h/3 + ((Math.random()-0.5) * h / 4) + h/2;
		if (first) context.moveTo(x,y);
		else context.lineTo(x,y);
		first = false;
	}
	context.stroke();
}

visir.AgilentOscilloscope.prototype._SetVoltIdx = function(ch, idx)
{
	if (idx < 0) idx = 0;
	if (idx > this._voltages.length - 1) idx = this._voltages.length - 1;
	this._voltIdx[ch] = idx;
	trace("idx: " + ch + " " + idx);
	// XXX: update osc settings for xml serialization
	// XXX: light indicator
	this._UpdateDisplay();
}

visir.AgilentOscilloscope.prototype._SetTimedivIdx = function(idx)
{
	if (idx < 0) idx = 0;
	if (idx > this._timedivs.length - 1) idx = this._timedivs.length - 1;
	this._timeIdx = idx;
	trace("timediv idx: " + idx);
	// XXX: update osc settings for xml serialization
	// XXX: light indicator
	this._UpdateDisplay();
}


visir.AgilentOscilloscope.prototype._UpdateDisplay = function()
{
		this._$elem.find(".voltage_ch1").text(this._voltages[this._voltIdx[0]]);
		this._$elem.find(".voltage_ch2").text(this._voltages[this._voltIdx[1]]);
		this._$elem.find(".timediv").text(this._timedivs[this._timeIdx]);
}