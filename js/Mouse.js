Mouse ={
	button :function( evt ){
		evt = Events.get( evt )
		if( in_array( evt.type, [ 'mousedown', 'mouseup' ])){
			var n = evt.which
			if( n ) switch( n ){
				case 1 : return 'left'
			//	case 2 : return "middle"
				case 3 : return 'right'
				default: return n
				}
			n = evt.button
			if( n ) switch( n ){
				case 1 : return 'left'
				case 2 : return 'right'
			//	case 4 : return "middle"
				default: return n
				}
			}
		return ''
		},
	position :function( evt ){
		evt = Events.get( evt )
		var o = { 
			left: evt.pageX ? evt.pageX : evt.clientX || 0 , 
			top: evt.pageY ? evt.pageY : evt.clientY || 0
			}
		return o
		/* @DELETE@ */
		if( Browser.isIE ){
			var o={ 
				left: Browser.scrollAttr( 'Left' ) + window.event.clientX,
				top: Browser.scrollAttr( 'Top' ) + window.event.clientY
				}
			// TEST Navigation & ColorPicker
			if( window.parent == window ){
				o.left -= 2
				o.top -= 2
				}
		}else{
			evt=Events.get( evt )
			var o={ 
				left: evt.pageX ? evt.pageX : evt.clientX || 0, 
				top: evt.pageY ? evt.pageY : evt.clientY || 0
				}
			}
		return o
		},
	wheel :function(evt){
		evt = Events.get( evt )
		if( in_array( evt.type, [ 'mousewheel', 'DOMMouseScroll' ])){
			var n = evt.wheelDelta ? evt.wheelDelta / 120 : -( evt.detail || 0 ) / 3
			return n < 0 ? 'down' : 'up'
			}
		return ''
		}
	}