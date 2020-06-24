var visir = visir || {};

visir.ConfigClass = function()
{
	this._teacherMode = true;
	this._instrReg = null;
	this._manualInstConfig = null;
	this._readOnly = false;
	this._dcPower25 = true;
	this._dcPowerM25 = true;
	this._dcPower6 = true;

	var base = "";
	if (visir.BaseLocation) base = visir.BaseLocation;
}

visir.ConfigClass.prototype.GetDeferredConfigLoader = function(baseurl)
{
	var me = this;

	var def = $.Deferred();

	$.get(baseurl + "config.json", function(data) {
		me.ReadConfig(data);
	}, "json")
	.error( function(obj, msg) {
		alert("failed to read config.json. " + msg);
	}).always( function() {
		def.resolve();
	});

	return def;
}

visir.ConfigClass.prototype.ReadConfig = function(config)
{
	this._teacherMode = config.teacherMode;
	this._instrReg = config.instrReg;
	this._locale = config.locale;
	this._mesServer = config.mesServer;
	this._readOnly = config.readOnly;
	this._transMethod = config.transMethod;
	this._oscRunnable = config.oscRunnable;
	this._dcPower25 = (config.dcPower25 !== undefined)?config.dcPower25:true;
	this._dcPowerM25 = (config.dcPowerM25 !== undefined)?config.dcPowerM25:true;
	this._dcPower6 = (config.dcPower6 !== undefined)?config.dcPower6:true;
}

visir.ConfigClass.prototype.Get = function(name)
{
	switch(name) {
		case "teacher": return this._teacherMode;
		case "locale": return this._locale;
		case "mesServer": return this._mesServer;
		case "readOnly": return this._readOnly;
		case "transMethod": return this._transMethod;
		case "oscRunnable": return this._oscRunnable;
		case "dcPower25": return this._dcPower25;
		case "dcPowerM25": return this._dcPowerM25;
		case "dcPower6": return this._dcPower6;
	}

	return undefined;
}

visir.ConfigClass.prototype.Set = function(name, value)
{
	switch(name) {
		case "teacher": this._teacherMode = value;
		case "locale": this._locale = value;
		case "mesServer": this._mesServer = value;
		case "readOnly": this._readOnly = value;
		case "transMethod": this._transMethod = value;
		case "oscRunnable": this._oscRunnable = value;
		case "dcPower25": this._dcPower25 = value;
		case "dcPowerM25": this._dcPowerM25 = value;
		case "dcPower6": this._dcPower6 = value;
	}
}

visir.ConfigClass.prototype.SetInstrRegistry = function(registry)
{
	this._instrReg = registry;
}

visir.ConfigClass.prototype.SetManualInstrConfig = function(instrmap)
{
	this._manualInstConfig = instrmap;
}

visir.ConfigClass.prototype.GetNrInstrOfType = function(type)
{
	if (this._manualInstConfig) return this._manualInstConfig[type];
	if (this._instrReg) return this._instrReg.GetNrInstrOfType(type);
	return 1;
}

visir.Config = new visir.ConfigClass();
