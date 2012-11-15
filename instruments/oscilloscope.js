"use strict";

var visir = visir || {};

visir.Oscilloscope = function(id)
{
	this._id = id;
}
	
visir.Oscilloscope.prototype.WriteRequest = function()
{
	var $xml = $('<oscilloscope />');
	$xml.attr("id", this._id);
	
	return $("<root />").append($xml).html();
},

visir.Oscilloscope.prototype.ReadResponse = function(response) {
/*
	var $xml = $(response);
	var $multimeter = $xml.find("multimeter[id=" + this._id + "]");
	if ($multimeter.length > 0) {
		var result = $multimeter.find("dmm_result").attr("value");
		if (!isNaN(result))	{
			this._result = parseFloat(result);
		} else {
			this._result = NaN;
		}
	}
*/
}
