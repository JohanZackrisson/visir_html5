
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
