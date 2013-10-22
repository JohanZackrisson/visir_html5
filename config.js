var visir = visir || {};

visir.ConfigClass = function()
{
	this._teacherMode = true;
	this._instrReg = null;
	this._manualInstConfig = null;
	
	this._deferred = this.LoadConfig("config.xml")
	this._isLoaded = false;
}

visir.ConfigClass.prototype.WaitUntilLoaded = function()
{
	// busy wait, not that good
	// XXX: this could be solved in the visir.js loader
	while(!this._isLoaded) {}
}

visir.ConfigClass.prototype.Get = function(name)
{
	switch(name) {
		case "teacher": return this._teacherMode;
	}
	
	return undefined;		
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
	this.WaitUntilLoaded();
	if (this._manualInstConfig) return this._manualInstConfig[type];
	if (this._instrReg) return this._instrReg.GetNrInstrOfType(type);	
	return 1;
}

// XXX: There is a timing problem with this, properties can be read before the config is read
visir.ConfigClass.prototype.LoadConfig = function(url)
{
	var me = this;
	return $.ajax({
		type: "GET",
		url: url,
		dataType: "xml",
		/*async: true, //can't use async: true, chrome bugs out */
		cache: false
	}).success( function(rawxml) {
		var $xml = $(rawxml);
		var teacher = parseInt($xml.find("teacher").text(), 10);
		me._teacherMode = teacher | false;
	})
	.fail(function() { trace("config.xml not found"); })
	.always(function() {
		me._isLoaded = true;
	})
	;
}

visir.Config = new visir.ConfigClass();
