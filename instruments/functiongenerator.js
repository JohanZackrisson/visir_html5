"use strict";

var visir = visir || {};

visir.FunctionGenerator = function(id)
{
	this._id = id;
	this._frequency = 1000.0;
	this._amplitude = 1.0;
	this._offset = 0.0;
}
	
visir.FunctionGenerator.prototype.WriteRequest = function()
{
	var $xml = $("<functiongenerator></functiongenerator>");
	$xml.attr("id", this._id);
	
	AddXMLValue($xml, "fg_frequency", this._frequency);
	AddXMLValue($xml, "fg_amplitude", this._amplitude);
	AddXMLValue($xml, "fg_offset", this._offset);
		
	// XXX: trick to get a valid root doc
	return $("<root />").append($xml).html();
},

visir.DCPower.prototype.ReadResponse = function(response) {
}
