var visir = visir || {};

visir.ConfigClass = function()
{
	this._teacherMode = true;
	this._instrReg = null;
	this._manualInstConfig = null;
	
	var base = "";
	if (visir.BaseLocation) base = visir.BaseLocation;
	this._loadURL = base + "load.php";
	this._saveURL = base + "save.php";
}

// This is used during the visir startup phase to make sure the config.xml is loaded before any of the instruments are initialized
visir.ConfigClass.prototype.GetDeferredLoader = function(baseurl)
{
	// we don't want to propagate errors, so we use our own deferred
	var me = this;
	var def = $.Deferred();
		me.LoadConfig(baseurl + "config.xml").always( function() {
		def.resolve();
	});
	
	/*
		XXX: maybe there should be an overloading local config defined in the config.xml,
		so that local sites using the same base js library could load their own config.
		Should be pretty easy to add here if needed
	*/
	
	return def;
}

visir.ConfigClass.prototype.Get = function(name)
{
	switch(name) {
		case "teacher": return this._teacherMode;
		case "loadurl": return this._loadURL;
		case "saveurl": return this._saveURL;
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
	if (this._manualInstConfig) return this._manualInstConfig[type];
	if (this._instrReg) return this._instrReg.GetNrInstrOfType(type);	
	return 1;
}

visir.ConfigClass.prototype.ParseXML = function(rawxml)
{
	var $xml = $(rawxml);
	var teacher = parseInt($xml.find("teacher").text(), 10);
	this._teacherMode = teacher | false;
	
	var xmlloadurl = $xml.find("loadurl").text();
	if (xmlloadurl) this._loadURL = xmlloadurl;
	
	var xmlsaveurl = $xml.find("saveurl").text();
	if (xmlsaveurl) this._saveURL = xmlsaveurl;
}

visir.ConfigClass.prototype.LoadConfig = function(url)
{
	var me = this;
	return $.ajax({
		type: "GET",
		url: url,
		dataType: "xml",
		cache: false
	}).success( function(rawxml) {
		me.ParseXML(rawxml);
	})
	.fail(function() { trace("config.xml not found"); })
	;
}

visir.Config = new visir.ConfigClass();
