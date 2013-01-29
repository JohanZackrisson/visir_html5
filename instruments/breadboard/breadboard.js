

var visir = visir || {};

function snapPoint(p)
{
	p.x += 6; p.y += 6;
	p.x = p.x - (p.x % 13);
	p.y = p.y - (p.y % 13);
	p.x -= 5;
	p.y += 3;
}

//////////////////////////////////////////////////////////////////////////////
// Point

visir.Point = function(x,y)
{
	this.x = x || 0;
	this.y = y || 0;
}

visir.Point.prototype.SnapToGrid = function()
{
	this.x += 6; this.y += 6;
	this.x = this.x - (this.x % 13);
	this.y = this.y - (this.y % 13);
	this.x -= 5;
	this.y += 3;
}

//////////////////////////////////////////////////////////////////////////////
// Wire

visir.Wire = function(color)
{
	this._color = color;
	this._lineWidth = 3.4;
	this._start = new visir.Point();
	this._end = new visir.Point();
	this._mid = new visir.Point();
}

visir.Wire.prototype.SetBentPoints = function(start, end)
{
	if (start.x > end.x) {
		var p1 = end;
		var p2 = start;
	}
	else {
		var p1 = start;
		var p2 = end;
	}

	var diff = { x: p2.x - p1.x, y: p2.y - p1.y };
	var cross = { x: diff.y, y: -diff.x };
	var scale = 5;
	cross.x /= scale;
	cross.y /= scale;
	
	var mid = { x: 0, y: 0 };
	mid.x = start.x + (end.x - start.x) / 2;
	mid.y = start.y + (end.y - start.y) / 2;
	mid.x += cross.x;
	mid.y += cross.y;
	
	this.SetPoints(start, mid, end);
}

visir.Wire.prototype.SetPoints = function(start, mid, end)
{
	this._start = start;
	this._mid = mid;
	this._end = end;
}

visir.Wire.prototype.Draw = function(context)
{	
	context.lineCap = 'round';
	context.strokeStyle = this._color;
	context.lineWidth   = this._lineWidth;
	context.beginPath();
	context.moveTo(this._start.x, this._start.y);
	context.quadraticCurveTo(this._mid.x, this._mid.y, this._end.x, this._end.y);
	context.stroke();
	context.closePath();

	/*
	context.lineWidth = 1;
	context.beginPath();	
	context.arc(this._start.x, this._start.y, 10, 0, Math.PI*2, true);
	context.closePath();
	context.stroke();
	context.beginPath();	
	context.arc(this._mid.x, this._mid.y, 10, 0, Math.PI*2, true);
	context.closePath();
	context.stroke();
	context.beginPath();
	context.arc(this._end.x, this._end.y, 10, 0, Math.PI*2, true);
	context.closePath();
	context.stroke();
	*/
}

/*
function drawWire(context, start, end, color)
{
	color = color || "#000000";
	// the point with largest x is the second point
	if (start.x > end.x) {
		var p1 = end;
		var p2 = start;
	}
	else {
		var p1 = start;
		var p2 = end;
	}

	var diff = { x: p2.x - p1.x, y: p2.y - p1.y };
	var cross = { x: diff.y, y: -diff.x };
	var scale = 5;
	cross.x /= scale;
	cross.y /= scale;
	
	var mid = { x: 0, y: 0 };
	mid.x = start.x + (end.x - start.x) / 2;
	mid.y = start.y + (end.y - start.y) / 2;
	mid.x += cross.x;
	mid.y += cross.y;
	
	context.lineCap = 'round';
	
	context.strokeStyle = color;
	context.lineWidth   = 3.4;
	context.beginPath();
	context.moveTo(start.x, start.y);
	context.quadraticCurveTo(mid.x, mid.y, end.x, end.y);
	context.stroke();
	context.closePath();
}
*/

//////////////////////////////////////////////////////////////////////////////
// Grid

// Ocuppation grid for the bin (to know which positions are available)
visir.Grid = function(componentList, $bin) {
    var me = this;

    // Being true = "available", and false = "busy"
    this._grid = [
        // row 0 (y=0): [ true, true, true ... ],
        // row 1 (y=1): [ true, true, true ... ],
    ];

    this._rows = 7;
    this._cols = 54;

    for(var y = 0; y < this._rows; y++) {
        var rowOccupation = [];
        for(var x = 0; x < this._cols; x++)
            rowOccupation.push(true);
        this._grid.push(rowOccupation);
    }

    var bin_position = $bin.position();
    var bin_left = bin_position.left;
    var bin_top  = bin_position.top;

    $(componentList).each(function(pos, component) {
        var position = component._$elem.position();
        var relative_top  = Math.floor((position.top  - bin_top  - 5 + parseInt(component.translation.y)) / 13);
        var relative_left = Math.floor((position.left - bin_left - 5 + parseInt(component.translation.x)) / 13);

        // trace("Component found in: " + relative_top + ", " + relative_left);

        if(relative_top >= 0 && relative_top < me._rows && relative_left >= 0 && relative_left < me._cols) {
            for(var x = relative_left; x < relative_left + component.widthInPoints(); x++) 
                for(var y = relative_top; y < relative_top + component.heightInPoints(); y++) {
                    me._set(x,y, false);
//                    trace("Marking busy..." + x + "; " + y);
                }
        }
    });
}

visir.Grid.prototype._get = function(x, y)
{
    // trace("Attempting " + x + ", " + y);
    return this._grid[y][x];
}

visir.Grid.prototype._set = function(x, y, value)
{
    // trace("Attempting " + x + ", " + y);
    this._grid[y][x] = value;
}


visir.Grid.prototype._FindSlot = function(height, width) 
{
    for (var x = 0; x <= this._cols - width; x++) { // x = 0 .. ~54
        for (var y = 0; y <= this._rows - height; y++) { // y = 0 .. ~7
            if (this._get(x, y)) {
                var potentialHole = true;
                for (var x2 = x; x2 < this._cols && x2 < x + width && potentialHole; x2++) {
                    for (var y2 = y; y2 < this._rows && y2 < y + height && potentialHole; y2++) {
                        // trace(" " + x2 + " " + y2);
                        // trace(this._grid);
                        if (!this._get(x2, y2))
                            potentialHole = false;
                    }
                }
                if (potentialHole)
                    return { 'x' : x, 'y' : y };
            }
        }
    }

    return { 'x' : 0, 'y' : 0 };
}


//////////////////////////////////////////////////////////////////////////////
// Component

// Component container
visir.Component = function($elem, breadboard)
{
   this._$elem        = $elem;
   this._breadboard   = breadboard;
   this._$circle      = null;
   this._current_step = 0;
   this.translation   = { 'x' : 0, 'y' : 0 };
   this.translations  = [];
}

visir.Component.prototype.width = function() 
{
    return this._$elem.find('.active').width();
}

visir.Component.prototype.height = function() 
{
    return this._$elem.find('.active').height();
}

visir.Component.prototype.heightInPoints = function()
{
    return Math.ceil(this.height() / 13);
}

visir.Component.prototype.widthInPoints = function()
{
    return Math.ceil(this.width() / 13);
}

visir.Component.prototype.remove = function() 
{
    this._RemoveCircle();
    this._$elem.remove();
    this._breadboard._RemoveComponent(this);
}

visir.Component.prototype._RemoveCircle = function() 
{
    if(this._$circle != null) {
        this._$circle.remove();
        this._$circle = null;
    }
}

visir.Component.prototype._PlaceInBin = function()
{
    var grid = this._breadboard._BuildOccupationGrid();

    var height = this.heightInPoints();
    var width  = this.widthInPoints();

    var availablePos = grid._FindSlot(height, width);
    var bin_position = this._breadboard._GetBin().position();

    // TODO: Take into account: this.translation.rot
    var new_left = availablePos.x * 13 + bin_position.left + 5 - parseInt(this.translation.x);
    var new_top  = availablePos.y * 13 + bin_position.top  + 5 - parseInt(this.translation.y);

    // trace("Available position found: [x=" + availablePos.x + ", y=" + availablePos.y + "] (which is [" + new_left + ", " + new_top + "])");

    this._$elem.css({
        "left" : new_left,
        "top"  : new_top,
    });
}

visir.Component.prototype.Rotate = function(step)
{
    if(step == undefined) {
        step = this._current_step + 1;
    }

	var $imgs = this._$elem.find("img");
	if (step >= $imgs.length) 
        step = step % $imgs.length;
	// trace("step: " + step);
	var idx = 0;
    var currentImage = null;
	$imgs.each(function() {
		if (idx == step) {
			$(this).addClass("active");
            currentImage = $(this);
		} else {
			$(this).removeClass("active");
		}
		idx++;
	});
    this._current_step = step;
    this.translation   = this.translations[step];
    // trace("New translation: " + this.translation.x + "; " + this.translation.y);
}


visir.Component.prototype._AddCircle = function() 
{
    var me = this;

    // Placed here for math operations
    // var CIRCLE_SIZE    =  140;
    var CIRCLE_SIZE    =  this.width() + 100;
    var ICON_SIZE      =  40;

    // If the circle may be slightly bigger than the four 
    // corner icons, since circles don't have corners. This
    // constant establishes the level of overlap between the 
    // square that surrounds a circle and the square that
    // surrounds the icons. Example: establishing it to 0 
    // the circle will not overlap at all; establishing it to
    // 1 will overlap completely.
    var CIRCLE_OVERLAP =  0.4;

    // Where is the component?
    var originalTop  = parseInt(this._$elem.css('top'),  10);
    var originalLeft = parseInt(this._$elem.css('left'), 10);

    // Where should be located inside the circle?
    var relativeTop  = this._$elem.height() / 2;
    var relativeLeft = this._$elem.width()  / 2;

    // Where should the whole circle be located?
    var newTop       = originalTop  - relativeTop;
    var newLeft      = originalLeft - relativeLeft;

    // Later they are removed
    var $parentNode = this._$elem.parent();
    // this._$elem.remove();

    // Overall block
    this._$circle = $('<span class="componentcircle"></span>');
    this._$circle.width(CIRCLE_SIZE);
    var transform = 'translate(-' + (CIRCLE_SIZE / 2) + 'px,-' + (CIRCLE_SIZE / 2) + 'px)';
    this._$circle.css({
        'position'  : 'absolute',
        'top'       : newTop + 'px',
        'left'      : newLeft + 'px',
        'transform' : transform,
        '-moz-transform' : transform,
        '-webkit-transform' : transform
    });

    // Circle
    var $circleImg = $('<img src="instruments/breadboard/images/empty_circle.png"/>');
    $circleImg.width(CIRCLE_SIZE - 2 * (1 - CIRCLE_OVERLAP) * ICON_SIZE);
    $circleImg.height(CIRCLE_SIZE - 2 * (1 - CIRCLE_OVERLAP) * ICON_SIZE);
    $circleImg.css({
        'position' : 'absolute',
        'left'     : (1 - CIRCLE_OVERLAP) * ICON_SIZE,
        'top'      : (1 - CIRCLE_OVERLAP) * ICON_SIZE
    });
    this._$circle.append($circleImg);

    // Trash button
    // http://openclipart.org/detail/68/trash-can-by-andy
    var $trashImg = $('<img src="instruments/breadboard/images/trash.png"/>');
    $trashImg.width(ICON_SIZE);
    $trashImg.height(ICON_SIZE);
    $trashImg.css({
        'position' : 'absolute',
        'left'     : 0,
        'top'      : CIRCLE_SIZE - ICON_SIZE
    })
    $trashImg.click(function() {
        me.remove();
    });
    this._$circle.append($trashImg);

    // Rotation button
    // Public domain
    // http://openclipart.org/detail/33685/tango-view-refresh-by-warszawianka
    var $rotateImg = $('<img src="instruments/breadboard/images/rotate.png"/>');
    $rotateImg.width(ICON_SIZE);
    $rotateImg.height(ICON_SIZE);
    $rotateImg.css({
        'position' : 'absolute',
        'left'     : CIRCLE_SIZE - ICON_SIZE,
        'top'      : CIRCLE_SIZE - ICON_SIZE
    });
    $rotateImg.click(function() {
        me.Rotate();

        $rotateImg.animate({'rotation' : '+=360'}, {
            step : function(now, fx){
                var currentRotation  = 'rotate(' + (now % 360) + 'deg)';
                $rotateImg.css({
                    'transform'         : currentRotation,
                    '-moz-transform'    : currentRotation,
                    '-webkit-transform' : currentRotation,
                });
            },
            duration : 'slow'
        });
    });
    this._$circle.append($rotateImg);

    // Drag and drop button
    // XXX Gentleface; CC Attribution-NonCommercial 3.0
    // http://www.softicons.com/free-icons/toolbar-icons/black-wireframe-toolbar-icons-by-gentleface/cursor-hand-icon
    // http://www.softicons.com/free-icons/toolbar-icons/black-wireframe-toolbar-icons-by-gentleface/cursor-drag-hand-icon
    var $dragImg = $('<img src="instruments/breadboard/images/drop.png" />');
    $dragImg.width(ICON_SIZE);
    $dragImg.height(ICON_SIZE);
    $dragImg.css({
        'position' : 'absolute',
        'left'     : CIRCLE_SIZE - ICON_SIZE,
        'top'      : 0
    });
    this._$circle.append($dragImg);

    $parentNode.append(this._$circle);

    var handler = this.generateHandler(this._$circle, function() {
        // On clicked
        me._RemoveCircle();
    }, this._$elem, function() {
        $dragImg.attr("src", "instruments/breadboard/images/drag.png");
    }, function () {
        $dragImg.attr("src", "instruments/breadboard/images/drop.png");
    })

    $circleImg.on("mousedown touchstart", handler);
    $dragImg.on("mousedown touchstart", handler);
}

//////////////////////////////////////////////////////////////////////////////
// Breadboard

visir.Breadboard = function(id, $elem)
{
	var me = this;
	this._$elem = $elem;
	this._$library = null;
	this._components = [];
	this._wires = [];
	
	var tpl = '<div class="breadboard">\
	<img class="background" src="instruments/breadboard/breadboard.png" alt="breadboard"/>\
	<div class="clickarea"></div>\
	<div class="bin">\
    	<div class="teacher">+</div>\
    </div>\
	<div class="colorpicker">\
		<div class="color red"></div>\
		<div class="color black"></div>\
		<div class="color green"></div>\
		<div class="color yellow"></div>\
		<div class="color blue"></div>\
		<div class="color brown"></div>\
	</div>\
	<div class="components"></div>\
	<canvas id="wires" width="715" height="450"></canvas>\
	<div class="componentbox">\
        <div class="componentlist">\
            <table class="componentlist-table">\
            </table>\
        </div>\
        <div class="componentbutton">\
            <button>Close</button>\
        </div>\
    </div>\
	</div>';
		
	$elem.append(tpl);
	
	var $wires = $elem.find("#wires");
	var wires_offset = $wires.offset();
	var offset = { x: wires_offset.left, y: wires_offset.top };
	var $doc = $(document);
	var context = $wires[0].getContext('2d');
	this._wireCtx = context;
	this._$wires = $wires;
	var $click = $elem.find(".clickarea");

    var teacher_mode = true; // TODO: make it configurable (argument?)
    if(!teacher_mode)
        $elem.find(".teacher").hide();

    $elem.find(".teacher").click(function(e) {
        $elem.find(".componentbox").show();
        var $components = me._$library.find("component").each(function() {
            var img   = $(this).find("rotation").attr("image");
            var type  = $(this).attr("type");
            var value = $(this).attr("value");
						var img_html = '<tr class="component-list-row">\
							<td>\
								<img src="instruments/breadboard/images/' + img + '"/>\
							</td>\
							<td>' + type + '</td>\
							<td>' + value + '</td>\
							</tr>';
            $elem.find(".componentlist-table").append(img_html);

            $($elem.find('.component-list-row').get(-1)).click(function(e){
                var comp_obj = me.CreateComponent(type, value);
                comp_obj._PlaceInBin();
            });
        });
    });

    $elem.find(".componentbutton button").click(function(e) {
        $elem.find(".componentbox").hide();
    });

	
	$click.on("mousedown touchstart", function(e) {
		if (!me._color) {
			// do picking against the wires
			
			// nothing was picked
			return;
		}
		//trace("mouse down");
		e.preventDefault();
		
		// Draw new wire
		var nWire = new visir.Wire(me._color); // XXX: replace with CreateWire
		me._wires.push(nWire);
		
		e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
		var start = new visir.Point(e.pageX - offset.x, e.pageY - offset.y);
		start.SnapToGrid();
		
		$click.on("mousemove.rem touchmove.rem", function(e) {
			e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
			var end = new visir.Point(e.pageX - offset.x, e.pageY - offset.y);
			end.SnapToGrid();
			
			nWire.SetBentPoints(start, end);
			me._DrawWires();

			//trace("move")
		});
		
		$doc.on("mouseup.rem touchend.rem", function(e) {
			$click.off(".rem");
			$doc.off(".rem");
			
			// deselect the color picker
			me._color = null;
			me._$elem.find(".color").removeClass("selected");
		});
	});
	
	$elem.find(".color").click( function() {
		me._color = $(this).css("background-color");
		me._$elem.find(".color").removeClass("selected");
		$(this).addClass("selected");
	});
	
	me._ReadLibrary("instruments/breadboard/library.xml");
}

visir.Breadboard.prototype._DrawWires = function()
{
	this._wireCtx.clearRect(0,0, this._$wires.width(), this._$wires.height());
	for(var i=0;i<this._wires.length; i++)
	{
		this._wires[i].Draw(this._wireCtx);
	}
}

visir.Breadboard.prototype._UpdateDisplay = function(ch)
{
}

visir.Breadboard.prototype._ReadLibrary = function(url)
{
	var me = this;
	$.ajax({
		type: "GET",
		url: url,
		dataType: "xml",
		async: true,
		success: function(xml) {
			trace("xml: " + xml);
			me._$library = $(xml);
		}
	});
}

visir.Breadboard.prototype.CreateComponent = function(type, value)
{
	var BASE_URL = "instruments/breadboard/images/";
	
	var me = this;
	var $libcomp = this._$library.find('component[type="'+ type+'"][value="'+ value+ '"]');
	var $comp = $('<div class="component"></div>');
    var comp_obj = new visir.Component($comp, me);
	
	var idx = 0;
	
	$libcomp.find("rotation").each(function() {
		var imgtpl = '<img src="' + BASE_URL + $(this).attr("image") + '" alt="'+ type + value + '"/>';
		var $img = $(imgtpl);
		var rot = $(this).attr("rot");
		var ox = $(this).attr("ox");
		var oy = $(this).attr("oy");

		// fix weird library format..
		if (rot == 90 || rot == 270) {
			var tmp = ox;
			ox = oy;
			oy = tmp;
		}
		
		var transform = "";
		transform	+= ' translate(' + ox + 'px, ' + oy + 'px)';
		transform += ' rotate(' + rot + 'deg)';
				
		$img.css( {
			'transform': transform,
			'-moz-transform': transform,
			'-webkit-transform': transform,
//			, 'top': oy + 'px'
//			, 'left': ox + 'px'
		})
	
        var current_translation = { 'x' : ox, 'y' : oy, 'rot' : rot };
        comp_obj.translations.push(current_translation);
        trace("Adding " + ox + ", " + oy);
		if (idx == 0) {
			$img.addClass("active");
            comp_obj.translation = current_translation;
		}
		$comp.append($img);
		idx++;
	});
	
	me._components.push(comp_obj);
	me._AddComponentEvents(comp_obj, $comp);
	me._$elem.find(".components").append($comp);
	return comp_obj;
}

visir.Breadboard.prototype._AddComponentEvents = function(comp_obj, $comp)
{
	var me = this;
	var $doc = $(document);
	
	var offset = this._$elem.offset();
	
	var touches = 0;
    var initialTouchTime = 0;

    var generateHandler = function(component, callbackClicked, internalComponent, callbackPressed, callbackReleased) {
        return function(e) {
            e.preventDefault();

            initialTouchTime = new Date().getTime();

            touches = (e.originalEvent.touches) ? e.originalEvent.touches.length : 1;
            e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
            //var start = { x: e.pageX - offset.x, y: e.pageY - offset.y};
            
            $doc.on("keypress.rem", function(e) {
                // trace("key: " + e.which);
                if (e.which == 114) // 'r'
                    comp_obj.Rotate();
            });

            $doc.on("keyup.rem", function(e){
                if(e.keyCode == 46)
                    comp_obj.remove();
            }) 

            $doc.on("mousemove.rem touchmove.rem", function(e) {
                if(callbackPressed != undefined)
                    callbackPressed();

                touches = (e.originalEvent.touches) ? e.originalEvent.touches.length : 1;
                var touch = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
                

                var p = { x: touch.pageX - offset.left, y: touch.pageY - offset.top };
                snapPoint(p);
                //trace("move");
                component.css({
                    "left": p.x + "px",
                    "top": p.y + "px"
                });
                if(internalComponent != undefined) {
                    internalComponent.css({
                        "left": p.x + "px",
                        "top": p.y + "px"
                    });
                }
                
                // if two fingers are down, turn the component around towards the second finger
                if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
                    var turn = e.originalEvent.touches[1];
                    var angle = Math.atan2( touch.pageY - turn.pageY, touch.pageX - turn.pageX ) * 180 / Math.PI;
                    angle = (angle + 360) % 360;
                    var step = 0;
                    if (angle < 45 || angle > 315) step = 0;
                    else if (angle > 45 && angle < 135) step = 1;
                    else if (angle >135 && angle < 225) step = 2;
                    else step = 3;
                    
                    comp_obj.Rotate(step);
                }
                
            });

            $doc.on("mouseup.rem touchend.rem", function(e) {
                trace("up: " + touches);
                if (touches > 1) {
                    touches--;
                    return;
                }

                var timeSincePressed = new Date().getTime() - initialTouchTime;
                trace("Time since pressed: " + timeSincePressed);
                if(timeSincePressed < 300) // Less than this time is considered a click
                    callbackClicked();

                if(callbackReleased != undefined)
                    callbackReleased();

                //if (e.originalEvent.touches && e.originalEvent.touches.length > 1) return;
                component.off(".rem");
                $doc.off(".rem");
            });
        };
    };
	$comp.on("mousedown touchstart", generateHandler($comp, function() {
        // On clicked, add circle
        $(me._components).each(function() {
            this._RemoveCircle();
        });
        comp_obj._AddCircle();
    }));
    comp_obj.generateHandler = generateHandler;
}

visir.Breadboard.prototype._RemoveComponent = function(comp_obj)
{
    for (var i = 0; i < this._components.length; i++) {
        if(this._components[i] == comp_obj) {
            this._components.splice(i, 1);
            break;
        }
    }
}

visir.Breadboard.prototype._BuildOccupationGrid = function() 
{
    return new visir.Grid(this._components, this._GetBin());
}

visir.Breadboard.prototype._GetBin = function()
{
    return this._$elem.find(".bin");
}







