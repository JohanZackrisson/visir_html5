

var visir = visir || {};

function snapPoint(p)
{
	p.x += 6; p.y += 6;
	p.x = p.x - (p.x % 13);
	p.y = p.y - (p.y % 13);
	p.x -= 5;
	p.y += 3;
}

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
	/*
	context.strokeStyle = '#000000';
	context.lineWidth   = 5;
	context.beginPath();
	context.moveTo(start.x, start.y);
	context.quadraticCurveTo(mid.x, mid.y, end.x, end.y);
	context.stroke();
	context.closePath();
	*/
	
	context.strokeStyle = color;
	context.lineWidth   = 3.4;
	context.beginPath();
	context.moveTo(start.x, start.y);
	context.quadraticCurveTo(mid.x, mid.y, end.x, end.y);
	context.stroke();
	context.closePath();
}

visir.Breadboard = function(id, $elem)
{
	//visir.Breadboard.parent.constructor.apply(this, arguments)
	
	var me = this;
	this._$elem = $elem;
	this._$library = null;
	
	var tpl = '<div class="breadboard">\
	<img class="background" src="instruments/breadboard/breadboard.png" alt="breadboard"/>\
	<div class="clickarea"></div>\
	<div class="bin">\
    	<div class="teacher">+</div>\
    </div>\
	<div class="components"></div>\
	<canvas id="wires" width="715" height="450"></canvas>\
	<div class="colorpicker">\
		<div class="color red"></div>\
		<div class="color black"></div>\
		<div class="color green"></div>\
		<div class="color yellow"></div>\
		<div class="color blue"></div>\
		<div class="color brown"></div>\
	</div>\
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
                me.CreateComponent(type, value);
            });
        });
    });

    $elem.find(".componentbutton button").click(function(e) {
        $elem.find(".componentbox").hide();
    });

	
	$click.on("mousedown touchstart", function(e) {
		if (!me._color) return;
		//trace("mouse down");
		e.preventDefault();
		
		e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
		var start = { x: e.pageX - offset.x, y: e.pageY - offset.y};
		//trace("start: " + start.x + " " + start.y);
		
		$click.on("mousemove.rem touchmove.rem", function(e) {
			e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
			var end = { x: e.pageX - offset.x, y: e.pageY - offset.y };
			
			context.clearRect(0,0, $wires.width(), $wires.height());
			snapPoint(start);
			snapPoint(end);
			//trace("start2: " + start.x + " " + start.y);
			drawWire(context, start, end, me._color);

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

//extend(visir.TripleDC, visir.DCPower)

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
			me.CreateComponent("D", "1N4002")
			//me.CreateComponent("R", "10k")
		}
	});
}

var BASE_URL = "instruments/breadboard/images/";

visir.Breadboard.prototype.CreateComponent = function(type, value)
{
	var me = this;
	var $libcomp = this._$library.find('component[type="'+ type+'"][value="'+ value+ '"]');
	var $comp = $('<div class="component"></div>');
	
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
			'transform': transform
			,'-moz-transform': transform
			,'-webkit-transform': transform
//			, 'top': oy + 'px'
//			, 'left': ox + 'px'
		})
		
		if (idx == 0) {
			$img.addClass("active");
		}
		$comp.append($img);
		idx++;
	});
	
	me._AddComponentEvents($comp);
	
	me._$elem.find(".components").append($comp);
}

visir.Breadboard.prototype._AddComponentEvents = function($comp)
{
	var me = this;
	var $doc = $(document);
	
	var offset = this._$elem.offset();
	
	var touches = 0;

	$comp.on("mousedown touchstart", function(e) {
		e.preventDefault();
		touches = (e.originalEvent.touches) ? e.originalEvent.touches.length : 1;
		e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
		//var start = { x: e.pageX - offset.x, y: e.pageY - offset.y};
		
		$doc.on("keypress.rem", function(e) {
			trace("key: " + e.which);
			if (e.which == 114) { // 'r'
				var $next = $comp.find("img.active").next();
				$comp.find("img").removeClass("active");
				if ($next.length > 0) {					
					$next.addClass("active");
				} else {
					$comp.find("img").first().addClass("active");
				}
			}
		});

		$doc.on("mousemove.rem touchmove.rem", function(e) {
			touches = (e.originalEvent.touches) ? e.originalEvent.touches.length : 1;
			var touch = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
			

			var p = { x: touch.pageX - offset.left, y: touch.pageY - offset.top };
			snapPoint(p);
			//trace("move");
			$comp.css({
				"left": p.x + "px",
				"top": p.y + "px"
			});
			
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
				
				me._SetComponentRotation($comp, step);
			}
			
		});

		$doc.on("mouseup.rem touchend.rem", function(e) {
			trace("up: " + touches);
			if (touches > 1) {
				touches--;
				return;
			}
			//if (e.originalEvent.touches && e.originalEvent.touches.length > 1) return;
			$comp.off(".rem");
			$doc.off(".rem");
		});
	});

    $comp.on("click", function() {
        // TODO XXX Where should I place constants / settings?
        var CIRCLE_SIZE    =  140;
        var ICON_SIZE      =   40;

        // If the circle may be slightly bigger than the four 
        // corner icons, since circles don't have corners. This
        // constant establishes the level of overlap between the 
        // square that surrounds a circle and the square that
        // surrounds the icons. Example: establishing it to 0 
        // the circle will not overlap at all; establishing it to
        // 1 will overlap completely.
        var CIRCLE_OVERLAP =  0.4;

        // Where is the component?
        var originalTop        = parseInt($comp.css('top'), 10);
        var originalLeft       = parseInt($comp.css('left'), 10);

        // Where should be located inside the circle?
        var relativeTop  = (CIRCLE_SIZE - $comp.height()) / 2;
        var relativeLeft = (CIRCLE_SIZE - $comp.width())  / 2;

        // Where should the whole circle be located?
        var newTop  = originalTop  - relativeTop;
        var newLeft = originalLeft - relativeLeft;

        // Later they are removed
        var $parentNode = $comp.parent();
        // $comp.remove();

        // Overall block
        var $blockSpan = $('<span class="componentcircle"></span>');
        $blockSpan.width(CIRCLE_SIZE);
        $blockSpan.css({
            'position' : 'absolute',
            'top'      : newTop + 'px',
            'left'     : newLeft + 'px'
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
        $circleImg.click(function() {
            $blockSpan.remove();
        });
        $blockSpan.append($circleImg);

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
            $blockSpan.remove();
            $comp.remove();
        });
        $blockSpan.append($trashImg);

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
            // TODO: refactor to avoid duplicating this code
            var $next = $comp.find("img.active").next();
            $comp.find("img").removeClass("active");
            if ($next.length > 0) {					
                $next.addClass("active");
            } else {
                $comp.find("img").first().addClass("active");
            }
        });
        $blockSpan.append($rotateImg);

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
        $blockSpan.append($dragImg);


        $parentNode.append($blockSpan);
        //$comp.css('position', 'static');
    });
}

visir.Breadboard.prototype._SetComponentRotation = function($comp, step)
{
	var $imgs = $comp.find("img");
	//if ($imgs.length <= 2) step = step % 2;
	if (step >= $imgs.length) step = step % $imgs.length;
	trace("step: " + step);
	var idx = 0;
	$imgs.each(function() {
		if (idx == step) {
			$(this).addClass("active");
		} else {
			$(this).removeClass("active");
		}
		idx++;
	});
}












