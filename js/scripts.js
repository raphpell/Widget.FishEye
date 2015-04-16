FishEye =function( aItems, oSettings, eParent ){
	var o = this
	o.extend([ oSettings?oSettings:{}, FishEye.oDefaultSettings ], true )
	o.aContainerEffect[0] = Fx.getEffect( o.aContainerEffect[0])
	o.mItemsEffect = Fx.getEffect( o.mItemsEffect )
	o.XXX = FishEye.XXX[ o.sType ]
	o.sDirection = o.XXX.direction
	Tag.interlock(
		o.tag = Tag( 'DIV', { className:'fisheye' }),
		o.container = Tag( 'UL', { className:o.sType })
		)
	o.aItems= []
	for(var i=0; aItems[i]; i++)
		o.aItems.push( FishEye.Item.call( o, aItems[i]))
	o.XXX.init.call( o )
	var fLabel =function( sMethod, sDisplay ){
		return function( evt ){
			var e = Events.element( evt )
			if( e.nodeName == 'IMG' ){
				e = e.previousSibling
				if( ! o.custom( sMethod+'Label', [e])) e.style.display = sDisplay
				}
			}
		}
	Events.add(
		window,
			'load',	CallBack( o, 'reset' ),
			'resize', CallBack( o, 'reset' ),
		document, 'mousemove', CallBack( o, FishEye.mousemove ),
		o.tag,
			'mousedown', FishEye.mousedown,
			'mouseover', fLabel( 'show', 'block' ),
			'mouseout', fLabel( 'hide', 'none' )
		)
	if( eParent ) eParent.appendChild( o.tag )
	else document.getElementsByTagName( 'BODY' )[0].appendChild( o.tag )
	}
FishEye.prototype={
	state: 'visible',
	custom :function( s, a ){
		var f = this.XXX[s]
		if( f ) return f.apply( this, a ) || true
		return null
		},
	position :function( n, eTargeted, oMouse ){
		var o = this, s = o.sDirection
		if( ! o.custom( 'position', arguments )){
			if( 'H,V'.indexOf( s ) > -1 ){
				var s1 = { H:'left', V:'top' }[ s ]
				if( o.aDimensions ){
					var n = 0
					for(var i=0; o.aItems[i]; i++){
						var eLI = o.aItems[i]
						var nDim = o.aDimensions[i]
						eLI.style[s1] = n + 'px'
						eLI.center = n + nDim/2
						eLI.style.width = nDim + 'px'
						eLI.style.zIndex = parseInt( nDim )
						n += nDim
						}
					}
				o.cotes = Tag.cotes( o.tag )
				o.container.style[{ H:'width', V:'height' }[ s ]] = n + 'px'
				if( eTargeted ){
					var x3 = oMouse[s1] - o.cotes[s1]
					, x1 = eTargeted.pos
					, y1 = x1 - eTargeted.center
					, bLeft1 = x3 < x1 ? 1 : 0
					, eSibling =  eTargeted[ ( bLeft1 ? 'previous' : 'next' ) + 'Sibling' ]
					if( eSibling ){
						var f = Fx.Effects.linear
						, x2 = eSibling.pos
						, y2 = x2 - eSibling.center
						, y3 = f( x3-x2, y2, y1-y2, x1-x2 )
						if( ! isNaN( y3 )) return o.container.style[s1] = parseInt( y3 ) + 'px'
						}
					return o.container.style[s1] = y1 + 'px'
					}
				o.container.style[s1] = parseInt( -n / 2 ) + 'px'
				}
			}
		},
	reset :function(){
		var o = this, s = o.sDirection
		if( o.state == 'hidden' ) return ;
		if( o.bHide ) o.hide()
		o.aDimensions = null
		if( ! o.custom( 'reset' ))
			if( 'H,V'.indexOf( s ) > -1 ){
				var s1 = { H:'height', V:'width' }[ s ]
				var s2 = { H:'left', V:'top' }[ s ]
				o.container.style[s1] = o.tag.style[s1] = o.nMin + 'px'
				o.position( o.aItems.length * o.nMin )
				for(var i=0, eLI; o.aItems[i]; i++){
					eLI = o.aItems[i]
					eLI.center = o.nMin*(i+0.5)
					eLI.pos = eLI.center + parseInt( o.container.style[s2])
					eLI.style[s2] = o.nMin * i + 'px'
					eLI.style.width = o.nMin + 'px'
					}
				}
		},
	hide :function(){
		var o = this
		o.state = 'hidden'
		if( Fx.playing( o.tag )) Fx.stop( o.tag ) // return ;
		var s = o.sType
		if( ! o.custom( 'hide' ))
			if( 'top,right,bottom,left'.indexOf( s ) > -1 )
				new Fx ( o.tag, FishEye.fO( s, -o.nMax ), o.aContainerEffect )
		},
	show :function(){
		var o = this
		if( o.state == 'visible' ) return ;
		o.state = 'visible'
		var s = o.sType
		if( ! o.custom( 'show' ))
			if( 'top,right,bottom,left'.indexOf( s ) > -1 )
				new Fx ( o.tag, FishEye.fO( s, 0 ), o.aContainerEffect )
		},
	blink :function( nItem, n ){ this.aItems[nItem].blink(n) },
	coeff :function( n ){ return n > 1 ? 1 : ( n < 0 ? 0 : n.toFixed( 3 )) },
	distance :function( oMouse, mCenter, i ){
		var o = this
		, n = o.custom( 'distance', arguments )
		if( n !== null ) return n
		if( 'left,right'.indexOf( o.sType ) > -1 ){
			if( i == 0 ) o.tmp = oMouse.top - Browser.scrollAttr( 'top' ) - Browser.viewSize().height/2
			return Math.abs( o.tmp - mCenter )
			}
		if( 'top,bottom'.indexOf( o.sType ) > -1 ){
			if( i == 0 ) o.tmp = oMouse.left - Browser.scrollAttr( 'left' ) - Browser.viewSize().width/2
			return Math.abs( o.tmp - mCenter )
			}
		}
	}
FishEye.Item =function( aItem ){
	var o = this
	var eLI = Tag( 'LI' ).appendNodes(
		Tag( 'DIV', { innerHTML: aItem[1] ? '<span>'+ aItem[1] +'</span>' : '' }),
		Tag( 'IMG', { src:aItem[0] })
		)
	if( aItem[2]) Events.add( eLI, 'mousedown', function(){ document.location = aItem[2]})
	eLI.blink =function( n ){
		var f = o.XXX.blink
		, s = o.sType
		if( f ) f.call( this, o.nMax, n )
		else if( in_array( s, ['top','right','bottom','left'])){
			this.style[s] = 0
			;( new Fx ( this, FishEye.fO( s, o.nMax ), 'circ.out', 500 )).blink( n )
			}
		}
	return o.container.appendChild( eLI )
	}
FishEye.union({ 
	fO :function( s, m ){var o={};o[s]=m;return o},
	oDefaultSettings:{
		bHide: true,
		sType: 'bottom',
		nMin: 40,
		nMax: 100,
		nMaxDistance: 100,
		nPow: 1,
		aContainerEffect: [ 'circ.out', 500 ],
		mItemsEffect: 'sine.inOut' // linear' //  '
		},
	mousemove :function( evt ){
		var o = this
		o.cotes = Tag.cotes( o.tag )
		var oMouse = Mouse.position( evt )
		, nDistanceScale = o.XXX.scale.call( o, oMouse ) * ( o.nMax - o.nMin )
		if( isNaN( nDistanceScale )) return o.reset()
		o.show()
		Events.enable( document, 'mousemove', false )
		o.aDistances = []
		o.aDimensions = []
		var eTargeted
		, f =function(){
			var nMaxDim = 0, eTargeted
			for(var i=0, eLI; o.aItems[i]; i++){
				eLI = o.aItems[i]
			// 1. Calculate items distance
				var nDistance = o.distance( oMouse, o.aItems[i].pos, i )
				o.aDistances.push( nDistance )
			// 2. Calculate items dimension
				var nCoeff = Math.pow( o.coeff( o.aDistances[i] / o.nMaxDistance ), o.nPow )
				, nItemScale = 1 - o.mItemsEffect( nCoeff, 0, 1, 1 ).toFixed( 2 )
				, nDim = o.nMin + nDistanceScale * nItemScale
				o.aDimensions.push( nDim )
				if( nMaxDim < nDim ){
					nMaxDim = nDim
					eTargeted = eLI
					}
				}
			// 3. Position items & container 
			o.position( null, eTargeted, oMouse )
			Events.enable( document, 'mousemove' )
			o.tmp = null
			}
		if( Browser.isIE < 9 ) return f()
		f()
		/*
		o.tmp = f
		Fx.Interval.push( 50, CallBack( o, 'tmp' )) // Needed for performance
		*/
		},
	mousedown :function( evt ){
		var e = Events.element( evt )
		while( e && e.nodeName != 'IMG' ){
			e = e.parentNode
			if( e && e.className=='fisheye' ) e = null
			}
		if( e ) e.parentNode.blink(2)
		},
	XXX:{
		left:{
			direction:'V',
			init: function(){
				var o=this.tag.style
				o.left=0
				o.top='50%'
				},
			scale :function( oMouse ){
				var o = this
				return oMouse.left < o.cotes.left + o.nMin + o.nMax
					? o.coeff( 1 - ( oMouse.left - o.nMin ) / o.nMax )
					: NaN
				}
			},
		right:{
			direction:'V',
			init: function(){
				var o=this.tag.style
				o.right=0
				o.top='50%'
				},
			scale :function( oMouse ){
				var o = this
				return oMouse.left > o.cotes.left - o.nMax
					? o.coeff( ( oMouse.left - parseInt( o.cotes.left - o.nMax )) / o.nMax )
					: NaN
				}
			},
		top:{
			direction:'H',
			init: function(){
				var o=this.tag.style
				o.top=0
				o.left='50%'
				},
			scale :function( oMouse ){
				var o = this
				return oMouse.top < o.cotes.top + o.nMin + o.nMax
					? o.coeff( 1 - ( oMouse.top - o.nMin ) / o.nMax )
					: NaN
				}
			},
		bottom:{
			direction:'H',
			init: function(){
				var o=this.tag.style
				o.bottom=0
				o.left='50%'
				},
			scale :function( oMouse ){
				var o = this
				return oMouse.top > o.cotes.top - o.nMax
					? o.coeff( ( oMouse.top - parseInt( o.cotes.top - o.nMax )) / o.nMax )
					: NaN
				}
			},
		block:{
			direction:'H',
			init: function(){
				var o=this.tag.style
				o.position='relative'
				o.left='50%'
				},
			scale :function( oMouse ){
				var o = this
				return oMouse.top > o.cotes.top - o.nMax && oMouse.top < o.cotes.top + o.nMin
					? o.coeff( ( oMouse.top - parseInt( o.cotes.top - o.nMax )) / o.nMax )
					: NaN
				},
			distance :function( oMouse, mCenter, i ){
				var o = this
				if( i == 0 ) o.tmp = oMouse.left - Browser.scrollAttr('Left') - o.cotes.left
				return Math.abs( o.tmp - mCenter )
				},
			blink: function( nMax, n ){
				this.style.bottom = '0px'
				;( new Fx ( this, { 'bottom':nMax }, 'circ.out', 500 )).blink( n )
				}
			},
		circle:{
			init: function(){
				var o = this
				if( ! o.nRadius ){
					o.nRadius = o.nMin * o.aItems.length / ( 2 * Math.PI )
					o.nStart = -Math.PI/2
					}
				with( o.tag.style ){
					top = '50%'
					left = '50%'
					}
				},
			hide: function(){
				this.tag.style.visibility = "hidden"
				},
			reset: function(){
				var o = this
				, nItemAngle = 2*Math.PI/o.aItems.length
				each( o.aItems, function( eLI, i ){
					var nAngle = nItemAngle * i + o.nStart
					, x = o.nRadius * Math.cos( nAngle )
					, y = o.nRadius * Math.sin( nAngle )
					eLI.pos = {
						nAngle: nAngle,
						x: x,
						y: y
						}
					with( eLI.style ){
						left = parseInt( x + o.nRadius ) + 'px'
						top = parseInt( y + o.nRadius ) + 'px'
						width = o.nMin + 'px'
						marginLeft = marginTop = -o.nMin/2 + 'px'
						}
					})
				o.position( o.nRadius*2 )
				},
			position :function( nPerimeter, eTargeted, oMouse ){
				var o = this
				, mCenter = { x:0, y:0 }
				if( o.aDimensions ){
					var nPerimeter = 0
					each( o.aDimensions, function( n ){ nPerimeter += n })
					var nRadius = nPerimeter / ( 2 * Math.PI )
					, t = Math.atan2( o._top, o._left )
					, nAngle = o.nStart
					, aAngles = []
					mCenter = {
						x: o.nRadius*Math.cos( t ) - nRadius*Math.cos( t ),
						y: o.nRadius*Math.sin( t ) - nRadius*Math.sin( t )
						}
					each( o.aItems, function( eLI, i ){
						var nAlpha1 = o.aDimensions[i]/( nRadius*2 )
						var nAlpha2 = o.nMin/( o.nRadius*2)
						aAngles.push( nAngle )
						if( eLI == eTargeted && eTargeted.pos ){
							var nSign = t > eTargeted.pos.nAngle ? -1 : 1
							, nDiff = t-eTargeted.pos.nAngle
							var nBaseAngle = ( nAngle - Fx.Effects.linear(
								-nSign * ( nDiff < 1 && nDiff > -1 ? nDiff : ((Math.PI*2) + nDiff )),
								eTargeted.pos.nAngle,
								nSign * ( nAlpha1 - nAlpha2 ),
								nAlpha2
								))
							for( var j = 0, nj = aAngles.length; j < nj ; j++ ) aAngles[j] -= nBaseAngle
							nAngle -= nBaseAngle	
							}
						nAngle = nAngle + nAlpha1 + o.aDimensions[i+1]/(nRadius*2)
						})
					each( o.aItems, function( eLI, i ){
						var n = o.aDimensions[i]
						, x = parseInt( nRadius + nRadius * Math.cos( aAngles[i]))
						, y = parseInt( nRadius + nRadius * Math.sin( aAngles[i]))
						with( eLI.style ){
							left = x + 'px'
							top = y + 'px'
							width = n + 'px'
							marginLeft = marginTop = -n/2 + 'px'
							zIndex = parseInt( n )
							}
						if( eLI == eTargeted && eTargeted.pos ){
							var oLabel = eTargeted.firstChild.style 
							oLabel.width = parseInt( nRadius*2 ) + 'px'
							oLabel.height = oLabel.lineHeight = parseInt( nRadius*2 - 10 ) + 'px'
							oLabel.left = -x + parseInt( n/2 ) + 'px'  
							oLabel.top = -y + parseInt( n/2 ) + 'px'
							}
						})
					n = nRadius*2
					} else n = o.nRadius*2
				o.cotes = Tag.cotes( o.tag )
				with( o.container.style ){
					left = parseInt( -n/2 + mCenter.x ) + 'px'
					top = parseInt( -n/2 + mCenter.y  )+ 'px'
					width = height = n + 'px'
					}
				},
			scale :function( oMouse ){
				var o = this
				, f = function( s ){
					var s2 = {top:'height',left:'width'}[s]
					return o['_'+ s] = oMouse[s] - Browser.scrollAttr( s ) - Browser.viewSize( s2 )/2
					}
				, x = f( 'left' ), y = f( 'top' )
				, nCircleDistance = Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 )) - o.nRadius
				if( nCircleDistance < 0 ) return o.coeff( 1 + nCircleDistance / o.nRadius )
				return nCircleDistance > o.nMax ? NaN : o.coeff( 1 - nCircleDistance / o.nMax )
				},
			distance :function( oMouse, mPos, i ){
				if( ! mPos ) return 0
				return Math.sqrt( Math.pow( this._left-mPos.x, 2 ) + Math.pow( this._top-mPos.y, 2 )).toFixed( 2 )
				}
			}
		}
	})