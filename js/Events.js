Events ={
	remove :function(){
		var nj = arguments.length, e = null
		,removeEvent =function( e, n ){
			var a=e.aEvents,b=false
			if(!a)return b
			if(a[n]){
				var s=a[n][0]
				a[n]=null
				// Efface les index vides à la fin du tableau
				for(var ni=a.length,i=ni-1;i>=0;i--)if(a[i])break;
				var ni=a.length=i+1
				// Efface l'événement si il n'existe plus
				for(var i=0,j=0;i<ni;i++)if(a[i]&&a[i][0]==s){j++;break}
				if(j==0) e['on'+s] = null
				// Redéfini la liste d'évenements
				e.aEvents=!a.length?undefined:a
				b=true
				}
			return b
			}
		for( var j=0, n=0; j<nj; j++ ){
			var m = arguments[j]
			if( !m && m!=0 ) e = null
			if( e && in_array( m.constructor, [ Array, Number ])){
				m = to_array( m )
				for( var i=0, ni=m.length; i<ni; i++ )
					if( removeEvent( e, m[i]))
						n++
				}else e = m
			}
		return n
		},
	enable :function( e, s, b ){
		return ! ( e['on'+s].bDisabled = b == false )
		},
	get :function( evt ){
		return evt?evt:(window.event?window.event:null)
		},
	element :function( m ){
		if(!m)return null
		if(m.nodeName)return m
		if(m.type){
			m=Events.get(m)
			return m.target?(m.target.nodeType==3?m.target.parentNode:m.target):m.srcElement
			}
		return false
		},
	prevent :function( evt, sButNotInTags ){
		var e = Events.element( evt )
		if( sButNotInTags && ~sButNotInTags.indexOf( e.nodeName.toUpperCase())) return true
		if(evt=Events.get(evt)){
			evt.returnValue=false
			if(evt.preventDefault)evt.preventDefault() 
			}
		return false
		},
	stop :function( evt ){
		if(evt=Events.get(evt)){
			evt.cancelBubble=true
			if(evt.stopPropagation)evt.stopPropagation() 
			}
		return false
		},
	preventSelection :function( b, e, sButNotInTags ){
		e = e || document
		var s = 'aSelectionDisabled'
		if( b && ! e[s]){
			var f=function(evt){ return Events.prevent( evt, sButNotInTags )}
			e[s] = Events.add( e, 'mousedown', f, 'selectstart', f )
			}
		if( ! b && e[s])
			e[s] = Events.remove( e, e[s])
		} ,
	// MAJ ???
	add :function(){
		var addEvent =function( e , s1 , f1 ){
			if( ! e || ! s1 || ! f1 ) return false ;
			var f =function(e,s1,f1){
				if( e.attachEvent ) return e.attachEvent( 'on' + s1 , f1 )
				if( e.addEventListener ) return e.addEventListener( s1 , f1 , false )
				}
			var f3 =function( evt ){
				if( e['on'+s1].bDisabled ) return null
				var aArgs = to_array( arguments )
				aArgs.unshift( Events.get( aArgs.shift()))
				var m, a
				if( a=this.aEvents )
					for( var i=0, ni=a.length; i<ni; i++ )
						if( a[i] && ( a[i][0]==s1 ))
							m = a[i][1].apply( this, aArgs )
				return m
				}
			// FIREFOX
			if( s1=="mousewheel" && window.addEventListener ) return f( e, 'DOMMouseScroll', f1 )
			e.aEvents = e.aEvents || []
			e.aEvents.push([ s1, f1 ])
			e[ 'on'+ s1 ] = f3
			return e.aEvents.length-1
			}
			
		var aId=[], n=arguments.length, e=null, s=null, f=null
		for( var i=0; i<n; i++ ){
			var m = arguments[i]
			if( ! m ) e=null
				else switch( m.constructor ){
						case String: s = m ; f = null; break;
						case Function:
							if( e ){
								f = m;
								break;
								}
						default: e = m; f = null
						}
			if(e&&s&&f) aId.push( addEvent( e, s, f ))
			}
		return aId
		}
	}

call =function( o, m ){
	var f = CallBack.apply( window, arguments )
	return function( evt ){ return f(Events.get(evt))}
	}