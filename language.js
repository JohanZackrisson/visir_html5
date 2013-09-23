var visir = visir || {};

visir.Language = function()
{
	this.ReLoad();
}

visir.Language.prototype.GetMessage = function(key)
{
	return this._strings[key].message;
}

visir.Language.prototype.GetDescription = function(key)
{
	return this._strings[key].description;
}

visir.Language.prototype.ReLoad = function()
{
	var locale = visir.Config.Get('locale');

	strings = {};

	$.ajax({
		async: false,
		dataType: "json",
		url: '_locales/'+locale+'/messages.json'
	}).done(function(data)
	{
		strings = data;
	});

	this._strings = strings;
}

visir.Lang = new visir.Language();