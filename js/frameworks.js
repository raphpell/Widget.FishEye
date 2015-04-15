
extend =function( o, m, bPreserve ){
	if( ! o ) return ;
	var b = bPreserve || false, s
	if( m )switch( m.constructor ){
		case Array: for( var i=0, n=m.length; i<n; i++) extend( o, m[i], b )
			break;
		default:for( s in m ){
			if( s=='prototype' ) continue
			if( o[s]==undefined ) try{ o[s]=m[s] }catch(e){ /*alert( 'IE BUG' )*/ }
				else if( ! b )
					switch( o[s].constructor ){
						case Array: o[s] = Array.merge( o[s], to_array( m[s]))
							break
						default:
							var s2
							if( s=='style' ) for( s2 in m[s]) o[s][s2] = m[s][s2] 
								else try{ o[s]=m[s] }catch( e ){ alert( "extend:\n" + s + "\n" + o[s] + "\n" + m[s] + "\n" + e.message )}
						}
			}
			if( m.prototype ) extend( o.prototype, m.prototype, true )
		}
	return o
	}
each =function( m, f1, aTargetedConstructors, m2 ){
	var a1 = ( m2 && m2.constructor == Array ) ? m2 : []
	, aTarget = aTargetedConstructors || false
	, f = m.constructor || ""
	, o1 = ( ! m2 || m2.constructor == Array ) ? window : m2
	switch(f){
		case Array: for( var i = 0 , ni = m.length ; i < ni ; i++ )
				if( m[i] != undefined && (  ! aTarget || in_array( m[i].constructor , aTarget )))
					f1.apply( o1 ,[ m[i] ,i ].concat( a1 ))
			break;
		default: for( var s in m ) 
				if( m[s] != undefined && ( ! aTarget || in_array( m[s].constructor , aTarget )))
					f1.apply( o1 ,[ m[s] , s ].concat( a1 ))
		}
	return m
	}
getTags =function( s, e ){
	e=e||document
	return e.getElementsByTagName(s)
	}
isset =function( m ){ return m !== undefined }

Object.prototype.union = function( o, b ){
	if( b ) for( n in o ){ if( !this[n]) this[n]=o[n] }
		else for( n in o ) this[n]=o[n]
	return this
	}
Object.prototype.extend =function( mSources, b ){
	return extend( this, mSources, b )
	}

to_array =function( M ){
	if( M ) switch( M.constructor ){
		case Array : return M
		case Function :
		case String : return [ M ]
		default: if( M.length >= 0 ){
			for( var i=0 , aA = [] , n = M.length ; i < n ; i++ ) aA.push( M[i])
			return aA
			}
		}
	return [ M ]
	}
in_array =function( M , A , bStrict ){ return A.contain( M , bStrict )}
Array.prototype.contain =function(m,b){
	var b=b||false
	for(var i=0,n=this.length;i<n;i++)
		if(b?this[i]===m:this[i]==m)return true
	return false
	}
Array.unique =function( a1 ){
	for( var a2=[], a3=[], i=0, n=a1.length ; i<n ; i++ ){
		var mValue=a1[i],s1=to_string( mValue )
		if( ! in_array( s1 , a3 )){ a2.push( mValue ); a3.push( s1 )}
		}
	return a2
	}
	
to_string =function( m, a ){
	var s = "" , a = a ? a : []
	if( m ) switch( m.constructor ){
		case Array :
			for( var i = 0 , n = m.length , a1 = [] ; i < n ; i++ ) a1.push( to_string( m[i] , a ))		
			s = "[" + a1.join( "," ) + "]"
			break
		case Boolean: s = m.toString(); break
		case RegExp: s = m.source;break
		case Number :s = m; break
		case Object :
			if( in_array( m , a , true )) s += "@RECURSION@"
				else{
					a.push( m )
					var a1 = []
					for( var i in m )
						if( m[i].constructor != Function )
							a1.push( i + ":" + to_string( m[i] , a ))
					s = "{" + a1.join( "," ) + "}"
					}
			break
		case String : s = "'" +  m.replace( /([^/])'/ , "$1\\'" ) + "'"; break
		case Function : s = m.toString(); break
		default : ;
		} else s = m
	return s ? s : "''"
	}

CallBack =function( o, m ){
	var a=to_array(arguments).slice(2), f=m.constructor
	if(f==String)f =function(){
		if(o[m])return o[m].apply(o,to_array(arguments).concat( a ))
		throw new Error ( m +"\nNOT_A_METHOD" )
		}
	if(f==Function)f =function(){
		return m.apply(o,to_array(arguments).concat( a ))
		}
	return f
	}