Style ={
	calculate :function( s, m ){
		if( ! m && m !== 0 ) return ''
		var bColor = /color/i.test( s ), sUnit = ''
		switch( s ){
			case 'font-size':
			case 'height':
			case 'width':
				m=m<0?0:m
				break
			case 'opacity':
				m = new Number ( m )
				n = m <= 0 ? 0 :( m >= 1 ? 1 : m.toFixed( 2 ))
				return [ 'filter:alpha(opacity=', (n*100), ');-moz-opacity:', n, ';-khtml-opacity:', n, ';opacity:', n, ';' ].join( '' )
			}
		switch( s ){
			// case 'font-size' : sUnit = 'em' ; break;
			case 'font-weight' : sUnit = '' ; m = parseInt( m );break;
			default :
				sUnit = bColor ? '' : 'px'
				if( sUnit == 'px' ) m = parseInt( m ) || 0
			}
		return s + ':' + m + sUnit + ';'
		},
	get :function( e, sAttr ){
		if( sAttr == 'opacity' && e.opacity ) return e.opacity // FOR IE
		var s = Style.getAttributeNS( sAttr )
		, sValue = e.style[s]
		if( ! sValue && in_array( s, [ 'height', 'width', 'left', 'top' ])){
			o = Tag.cotes( e )
			sValue = o[s]
			}
		if( ! sValue ){
			if( e.currentStyle ) sValue = e.currentStyle[s]
				else if( window.getComputedStyle )
					sValue = window.getComputedStyle( e, '' ).getPropertyValue( sAttr )
			}
		if( ! sValue ){
			var sClasses = e.className
			if( sClasses ){
				a = sClasses.split(' ')
				for( var i=0, n=a.length, sClassName, o; i<n; i++ ){
					sClassName = a[i].trim ()
					if( CssRules ){
						var o = CssRules.get( '.'+sClassName )
						if( o ) sValue = o[s] || sValue
						}
					}
				}
			}
		return sValue || '0'
		},
	getAttributeNS :function( s ){
		if( s.indexOf( '-' )){
			var a = s.split('-')
			for( var i=0, s='', n=a.length, s1; i<n; i++ ){
				s1 = a[i]
				s += i==0 ? s1 : s1.charAt(0).toUpperCase()+s1.substr(1)
				}
			}
		return s
		},
	remove :function( m, s ){ // m == CssRule || Element
		m=m.style
		s=Style.getAttributeNS( s )
		if( m && m[s]){
			if( m.removeProperty ) m.removeProperty( s ) 
				else try{ m[s] = '' }catch(e){}
			}
		},
	set :function( m, s ){
		var e = m
		, m = m.style || m
		, o = {}
		, aAttr = []
		each( ( m.cssText+';'+s ).split( ';' ),function(sAttr){
			var a = sAttr.split( ':' ), key
			if( a.length == 2 && a[1]){
				aAttr.push( key = a[0].trim().toUpperCase())
				o[ key ] = a[1] || ''
				}
			})
		s = ''
		each( Array.unique( aAttr ), function( key ){
				s += key +':'+ o[ key ] +';'
			})
		if( o.OPACITY ) e.opacity = o.OPACITY  // FOR IE
		return m.cssText = s
		}
	}