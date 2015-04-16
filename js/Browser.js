Browser = function (){
	if( Browser.cache ) return Browser.cache
	var ua= navigator.userAgent
	, o = {
		isMacOS: ua.indexOf( 'Mac OS' ) != -1,
		isIE: navigator.appName == 'Microsoft Internet Explorer',
		isNS: ua.indexOf( 'Netscape/' ) != -1
		}
	, exit =function(){ throw new Error ()}
	var a = [ 'Gecko', 'Chrome', 'Opera', 'Firefox', 'Camino', 'Safari' ]
	for( var i = 0 , ni = a.length ; i < ni ; i++ )
		o[ 'is' + a[i]] = ua.indexOf( a[i]) != -1
	try {
		if( o.isIE ){
			o.isIE = ua.replace( /^.*?MSIE\s+(\d+\.\d+).*$/, '$1' )
			if( o.isIE<6 ) exit()
			}
		if( o.isNS ){ // work only on netscape > 8 with render mode IE
			o.isNS = ua.substr( ua.indexOf( 'Netscape/' ) + 9 )
			if( o.isNS<8 || ! o.isIE ) exit()
			}
		if( o.isOpera ){	
			o.isOpera = ua.replace( /^.*?Opera.*?([0-9\.]+).*$/i, '$1' )
			if( o.isOpera<9 ) exit()
			o.isIE = false
			}
		if( o.isFirefox ) o.isFirefox = ua.replace( /^.*?Firefox.*?([0-9\.]+).*$/i , '$1' )
		if( o.isCamino ) o.isCamino = ua.replace( /^.*?Camino.*?([0-9\.]+).*$/i , '$1' )
		if( o.isSafari ) o.isSafari = o.isChrome ? true : ua.replace( /^.*?Version\/([0-9]+\.[0-9]+).*$/i , '$1' )
		if( o.isChrome ) o.isChrome = ua.replace( /^.*?Chrome\/([0-9]+\.[0-9]+).*$/i , '$1' )
		o.isValidBrowser = ( o.isIE >= 6 || o.isOpera >= 9 || o.isFirefox || o.isChrome || o.isCamino || o.isSafari >= 3 )
		}catch( e ){ o = false }
	a = [ 'IE', 'Chrome', 'Opera', 'Firefox', 'Safari', 'Camino', 'NS' ]
	for( var s='', i=0, ni=a.length; i<ni; i++ )
		if( o[ 'is' + a[i]]) s += a[i]
	o.appName = s
	Browser.cache = o
	Browser.union( o )
	return o
	}
Browser()
Browser.union({
	viewSize :function( s ){
		if( ! s ){
			var f = this.viewSize
			return { width:f( 'Width' ), height:f( 'Height' )}
			}
		s = s[0].toUpperCase() + s.substring(1)
		return self[ 'inner' + s ] || document.documentElement[ 'client' + s ] || document.body[ 'client' + s ]
		},
	scroller :function(){
		return document.getElementsByTagName('body')[0]
		return document[ document.documentElement[ 'scrollTop' ] != undefined && ! Browser.isSafari ? 'documentElement' : 'body' ]
		},
	scrollAttr :function( s ){
		if( ! s ){
			var f = Browser.scrollAttr
			return { width:f( 'Width' ), height:f( 'Height' ), left:f( 'Left' ), top:f( 'Top' )}
			}
		// return document.documentElement[ 'scroll' + s ] || document.body[ 'scroll' + s ]
		return Browser.scroller()[ 'scroll' + s.charAt(0).toUpperCase() + s.substring(1)]
		}
	})