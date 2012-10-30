(function( $ ){
	var methods = {
		init : function( props ) {
			var options = $.extend({
				offset: 0,
				turn: function(){}
				}, props || {});
			
			return this.each(function(){

				var doc = $(document);
				var handle = $(this);
				var top = handle.find(".top");

				handle.on("mousedown touchstart", function(e) {

					e.preventDefault();
					console.log("clicked");

					doc.on("mousemove.rem touchmove.rem", function(e) {

						e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;

						var offset = handle.offset();
						//console.log("move: " + offset.left + " " + offset.top + " " + e.pageX + " " + e.pageY);
						var center = { x: top.width() / 2, y: top.height() / 2 };
						var origin = top.css("transform-origin");
						if (origin) {
							var sp = origin.split(" ");
							center.x = parseInt(sp[0]);
							center.y = parseInt(sp[1]);
						}
						var dx = e.pageX - offset.left - center.x;
						var dy = e.pageY - offset.top - center.y;

						var deg = Math.atan2(dy, dx) * 180 / Math.PI;
						setRotation(top, deg + options.offset); // XXX: not portable..
					});

					doc.on("mouseup.rem touchend.rem", function(e) {
						console.log("up");
						handle.off(".rem");
						doc.off(".rem");
					});
				});

			});
		},
		destroy : function( ) {
			return this.each(function(){
			});
		}


	};

	$.fn.turnable = function( method ) {

		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.turnable' );
		}    

	};

})( jQuery );