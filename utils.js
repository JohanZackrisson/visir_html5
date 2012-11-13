var visir = visir || {};

function extend(Child, Parent) {
  Child.prototype = inherit(Parent.prototype)
  Child.prototype.constructor = Child
  Child.parent = Parent.prototype
}

function inherit(proto) {
  function F() {}
  F.prototype = proto
  return new F
}

function trace(msg)
{
	$("#logwindow").append(msg + "<br/>");
	if (console && console.log) console.log(msg);
}

function setRotation(elem, deg)
{
	var rotateCSS = 'rotate(' + deg + 'deg)';
	elem.css({
		'transform': rotateCSS
		,'-moz-transform': rotateCSS
		,'-webkit-transform': rotateCSS
	});
}

function AddXMLValue(where, name, value) {
	where.append('<' + name + ' value="'+ value + '"/>');
}

visir.LightNum = function(strnum, digit) {
	var out = "";
	trace("lightnum: " + strnum + " " + digit)
	
	var idx = 0;
	for(var i=strnum.length - 1; i >= 0; i--)
	{
		if (strnum[i] == "." || strnum[i] == "-") {
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
