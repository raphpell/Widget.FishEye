/*  REQUIS Les classes Color et Style  */
Fx =function( e, o2, mEffect, nTime, oSettings ){
	var o = this
	Object.assign( o, Fx.oDefaultSettings, oSettings?oSettings:{})
	if( o.bPlayNow ) Fx.stop( e )
	if( mEffect.constructor==Array ){
		nTime = mEffect[1]
		mEffect = mEffect[0]
		}
	Object.assign( o,{
		aAttr:[],
		e:e,
		fFx:Fx.getEffect( mEffect ),
		o2:o2, 
		oFrames:{},
		time: parseInt(nTime) || Fx.time
		})
	Object.assign( o,{ // Rupture obligatoire
		nFrameTime: parseInt( 1000/o.fps ),
		nFrames: o.countFrames(),
		o1: Fx.Last[ ( o.method=='merge' ? 'get_o1' : 'get_o2' )]( e ),
		oChange: {}
		})
	o.time = (o.nFrames-1)*o.nFrameTime
	if( o2 ){
		o._createFrames()
		Fx.Methods[ o.method ]( o, o.bPreserveMergin )
		if( o.bPlayNow ) Fx.play( e )
		}
	}
	
Fx.prototype.extend({
	nId: null,
	countFrames :function(){
		return parseInt( this.fps*this.time/1000 )+1
		},
	playFrame :function( nId, b ){
		var o = this
		, e = o.e
		, values=''
		if( o.bCanceling ) return o.bCanceling = undefined
		if( ! b && ! e.sPlaying ){
			e.oFxPaused = o
			return false
			}
		if( o.nId == null ){
			o.nId = e.bDesc ? o.nFrames-1 : 0
			if( o.onlaunch ) o.onlaunch()
			}
		nId = ! isset( nId ) ? ( e.bDesc ? --o.nId : ++o.nId ) : nId
		if( e.bDesc ? nId>=0 : nId<o.nFrames ){
			o.onframe( nId, b )
			for( var j=0, nj=o.aAttr.length, sAttr; j<nj; j++ ){
				sAttr = o.aAttr[j]
				if( ~'cols,rows'.indexOf(sAttr)){
					e[sAttr] = o.oFrames[sAttr][nId] || e[sAttr] 
					values += ';' // ?
					} else 
				if( sAttr.indexOf('scroll')==0 ){
					e[sAttr] = parseInt( o.oFrames[sAttr][nId]) || e[sAttr]
					values += ';' // ?
					} else values += Style.calculate( sAttr, o.oFrames[sAttr][nId])
				}
			}
		if( values ){
			if( Style ) Style.set( e, values )
			if( ! b ) Fx.Interval.push( o.fps, ()=> o.playFrame())
		}else{
			o.nId = null
			if( ! o.oncomplete()) return false
			if( b ) return o.next ? o.next.playFrame( nId-o.nFrames, true ) : null
			var oNext = e.bDesc ? o.previous : o.next
			if( oNext ) Fx.Interval.push( oNext.fps, ()=> oNext.playFrame())
				else{
					if( nId == o.nFrames && o.onend ) return o.onend()
					if( nId < 0 && o.onstart ) return o.onstart()
					Fx.stop( e )
					}
			}
		return true
		},
	_createFrames :function(){
		var o = this
		o._difference()
		for(var j=0, nj=o.aAttr.length, s; j<nj ; j++ ){
			o.oFrames[ s=o.aAttr[j] ] = []
			var ni = o.nFrames
			, oChange = o.oChange[s]
			if( oChange )
				switch( oChange.sType ){
					case 'Frameset':
						for(var i=0; i<ni; i++ ){
							var a = []
							for(var k=0, nk=oChange.length; k<nk; k++ ){
								if( o.o1[s][k].indexOf('*')>-1 ){
									a[k]=o.o1[s][k]
									continue
									}
								a[k] = parseInt( o.fFx( i*o.nFrameTime, parseInt(o.o1[s][k]), oChange[k], o.time ) || 0 )
								if( o.o1[s][k].indexOf('%')>-1 ) a[k]+= '%'
								}
							o.oFrames[s].push( a.join(','))
							}
						break;
					case 'Color':
						if(Color) for(var i=0; i<ni; i++ ){
							var aColor =[]
							for(var k=0, nk=o.sColorMode.length, n; k<nk; k++ ){
								var s1=o.sColorMode[k]
								n = o.fFx( i*o.nFrameTime, o.o1[s][s1], oChange[s1], o.time ) || 0
								aColor.push( parseInt(n))
								}
							o.oFrames[s].push( Color[ o.sColorMode.substr(0,3)].apply( null, aColor ).toHEX().toString('#'))
							}
						break;
					default:
						for(var i=0; i<ni; i++ )
							o.oFrames[s].push( o.fFx( i*o.nFrameTime, o.o1[s], oChange, o.time ).toFixed( 2 ) || 0 )
						break;
					}
			}
		},
	_difference :function(){
		var o = this, o1=o.o1, o2=o.o2, sLowerColorMode = o.sColorMode.substr(0,3).toUpperCase()
		, fDifference =function( m2, s ){
			var fCase =function(){
				if( s.indexOf(' ')==0 ) return 'composed'
				if( s.indexOf('scroll')==0 ) return 'Scroll'
				if( s.indexOf('rows')==0 || s.indexOf('cols')==0 ) return 'Frameset'
				return ( /color/i.test(s)? 'Color': 'style' )
				}
			, m1, sType=fCase()
			switch( sType ){
				case 'composed': /* box-shadow ? color+position+dim */
					break;
				case 'Color':
					var oChange=o.oChange[s]={}
					if(!isset(o1[s])) o1[s]=Style.get(o.e,s)
					o1[s]=Color( o1[s])['to'+ sLowerColorMode ]()
					o2[s]=Color( o2[s])['to'+ sLowerColorMode ]()
					for(var i=0; i<3; i++ ){
						var s1=o.sColorMode[i]
						oChange[s1]=o2[s][s1]-o1[s][s1]
						}
					break;
				case 'Frameset':
					if(!isset(o1[s])) o1[s]=o.e[s]
					var a=[], a1=o1[s].split(','), a2=m2.split(',')
					for( var i=0, ni=a1.length, n1 ; i<ni; i++ ){
						if( a1[i].indexOf('*')>-1){
							a[i]=a1[i]
							continue
							}
						a[i] = parseInt(a2[i])-parseInt(a1[i])
						}
					o1[s] = a1
					o.oChange[s]= a
					break;
				case 'Scroll':
					if(!isset(o1[s])) o1[s]=o.e[s]
					o.oChange[s]=m2-o1[s]
					break;
				case 'style':
					if(!isset(o1[s])) m1=Style.get(o.e,s)
				default:
					if(isset(m1)) o1[s]=eval( isNaN(m1)? parseInt(m1): m1 ) || 0
					o.oChange[s]=m2-(o1[s]||0)
				}
			o.oChange[s].sType = sType
			o.aAttr.push(s)
			}
		each( o2, fDifference, [Number,String])
		},

	back :function( s, n ){
		var o2 = {}
		each( this.oFrames, function(a,s){o2[s]=a[0]}, [Array])
		return new Fx ( this.e, o2, s||this.fFx, n||this.time, { bPlayNow: false, method:'concat' })
		},
	concat :function( o2, s, n ){
		return new Fx ( this.e, o2, s||this.fFx, n||this.time, { bPlayNow: false, method:'concat' })
		},
	custom :function( oFrames, nFps, oSettings ){
		return Fx.custom( this.e, oFrames, nFps||this.fps, oSettings )
		},
	merge :function( o2, s, n, bPreserve ){
		new Fx ( this.e, o2, s||this.fFx, n||this.time, { bPlayNow: false, method:'merge', bPreserveMergin:bPreserve })
		return this
		},
	push :function( o2, s, n, oSettings ){
		new Fx ( this.e, o2, s||this.fFx, n||this.time, { bPlayNow: false, method:'push' }.extend( oSettings||{} ))
		return this
		},

	blink :function( n ){
		var o = this, b = ! isset( n )
		o.onend = function(){ Fx[ b || (n-=0.5)>0 ? 'playInvert' : 'stop' ]( o.e )}
		o.e.oFx.onstart = function(){ Fx[ b || (n-=0.5)>0 ? 'play' : 'stop' ]( o.e )}
		},
	repeat :function( n ){
		var o = this, b = ! isset( n )
		o.onend = function(){ Fx[ b || --n > 0 ? 'play' : 'stop' ]( o.e )}
		o.onstart = function(){ Fx[ b || --n > 0 ? 'playInvert' : 'stop' ]( o.e )}
		},
	reverse :function(){
		this.blink(1)
		}
	})
Fx.extend({
	effect: 'bounce.out',
	oDefaultSettings:{
		bPlayNow: true,
		bPreserveMergin: true,
		fps: 50,
		method: 'concat',
		sColorMode: 'rgb',
		oncomplete :function(){ return true },
		onframe :function( nId ){ return false },
		onlaunch :function(){}
		},
	time: 500,
	custom :function( e, oFrames, fps, oSettings ){
		var oFx = new Fx ( e, 0, 0, 0, { bPlayNow: false })
		, aAttr = []
		, nFrames = 0
		, o1={}, o2={}
		each( oFrames, function( a, s ){
			aAttr.push( s )
			var n = a.length
			o1[ s ] = a[0]
			o2[ s ] = a[n-1]
			if( n > nFrames ) nFrames = n
			}, [Array])
		oFx.extend({
			aAttr: aAttr,
			time: parseInt( fps*nFrames ),
			fps: fps||oFx.fps,
			nFrames: nFrames,
			oFrames: oFrames,
			o1: o1,
			o2: o2
			})
		Fx.Methods.concat( oFx )
		return oFx
		},
	getEffect :function( m ){
		if(!m)m=Fx.effect
		if(m.constructor==String)for(var a=m.split('.'),m=Fx.Effects;m&&a.length;m=m[a.shift()]);
		if(m&&m.constructor==Function&&m.length==4&&m(0,0,1,1)==0&&m(1,0,1,1)==1)return m
		return Fx.Effects.linear
		},
	pause :function( e ){
		if( e.sPausing ){
			Fx[ e.sPausing ]( e )
			return e.sPausing = undefined
			}
		if( e.sPlaying ){
			e.sPausing = e.sPlaying
			e.sPlaying = undefined
			}
		},
	playing :function( e ){
		return e.sPausing||e.sPlaying
		},
	play :function( e ){
		var oFx = e.oFxPaused||e.oFx
		if( oFx ){
			e.bDesc = 0
			e.sPlaying = 'play'
			e.oFxPaused = undefined
			return oFx.playFrame()
			}
		return null
		},
	playInvert :function( e ){
		var oFx = e.oFxPaused
		if( ! oFx ) oFx = Fx.Last( e )
		if( oFx ){
			e.bDesc = 1
			e.sPlaying = 'playInvert'
			e.oFxPaused = undefined
			return oFx.playFrame()
			}
		return null
		},
	stop :function( e ){
		if( e.oFx ){
			for( var o = e.oFx ; o ; o = o.next ) o.bCanceling = 1
			e.bDesc = e.sPlaying = e.oFx = e.oFxPaused = e.sPausing = undefined
			if( e.onstop ) e.onstop()
			}
		},
	Last:(function(){
		var f = function( e ){
			for( var o = e.oFx ; o && o.next ; o = o.next );
			return o
			}
		f.get_o1 =function( e ){
			var o = e.oFx, o1 = {}
			if( o ) for(; o && o.next ; o = o.next ) o1.extend( o.o2 )
			return o1
			}
		f.get_o2 =function( e ){
			var o = e.oFx, o1 = {}
			if( o ) for(; o ; o = o.next ) o1.extend( o.o2 )
			return o1
			}
		return f
		})(),
	Methods:{
		concat :function( oFx ){
			var e = oFx.e, o = Fx.Last( e )
			if( o ){
				o.next = oFx
				oFx.previous = o
				} else e.oFx = oFx
			return e.oFx
			},
		merge :function( oFx, bPreserve ){
			var e = oFx.e, o = Fx.Last( e )
			if( o ){
				for( s in oFx.oFrames )
					if( oFx.oFrames[s].constructor == Array && ( bPreserve ? ! o.oFrames[s] : true ))
						o.oFrames[s] = oFx.oFrames[s]
				o.aAttr = Array.unique( Array.merge( o.aAttr, oFx.aAttr ))
				o.nFrames = o.nFrames > oFx.nFrames ? o.nFrames : oFx.nFrames
				o.o1.extend( oFx.o1, bPreserve )
				o.o2.extend( oFx.o2, bPreserve )
				} else Fx.Methods.concat( oFx )
			return e.oFx
			},
		push :function( oFx ){
			var e = oFx.e, o = Fx.Last( e )
			if( o ){
				var nMax = o.nFrames, nLength
				for( s in oFx.oFrames )
					if( oFx.oFrames[s].constructor == Array ){
						o.oFrames[s] = Array.merge( o.oFrames[s]||[], oFx.oFrames[s])
						nLength = o.oFrames[s].length
						if( nLength > nMax ) nMax = nLength
						}
				o.aAttr = Array.unique( Array.merge( o.aAttr, oFx.aAttr ))
				o.nFrames = nMax
				o.o1.extend( oFx.o1, true )
				o.o2.extend( oFx.o2 )
				} else Fx.Methods.concat( oFx )
			return e.oFx
			}
		},
	Effects :{
		linear :function(t,b,c,d){return c*t/d+b},
		quad:{
			'in':function(t,b,c,d){return c*(t/=d)*Math.pow(t,1)+b},
			'out':function(t,b,c,d){return -c*(t/=d)*(t-2)+b},
			'inOut':function(t,b,c,d){if((t/=d/2)<1)return c/2*Math.pow(t,2)+b;return -c/2*((--t)*(t-2)-1)+b}
			},
		quint:{
			'in':function(t,b,c,d){return c*(t/=d)*Math.pow(t,4)+b},
			'out':function(t,b,c,d){return c*((t=t/d-1)*Math.pow(t,4)+1)+b},
			'inOut':function(t,b,c,d){
				if((t/=d/2)<1)return c/2*Math.pow(t,5)+b
				return c/2*((t-=2)*Math.pow(t,4)+2)+b
				}
			},
		sine:{
			'in':function(t,b,c,d){return c*(1-Math.cos(t/d*(Math.PI/2)).toFixed(4))+b},
			'out':function(t,b,c,d){return c*Math.sin(t/d*(Math.PI/2))+b},
			'inOut':function(t,b,c,d){return -c/2*(Math.cos(Math.PI*t/d)-1)+b}
			},
		expo:{
			'in':function(t,b,c,d){return (t==0)?b:c*Math.pow(2,10*(t/d-1))+b},
			'out':function(t,b,c,d){return (t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b},
			'inOut':function(t,b,c,d){
				if(t==0) return b
				if(t==d) return b+c
				if((t/=d/2)<1)return c/2*Math.pow(2,10*(t-1))+b
				return c/2*(-Math.pow(2,-10*--t)+2)+b
				}
			},
		circ:{
			'in':function(t,b,c,d){return -c*(Math.sqrt(1-(t/=d)*t)-1)+b},
			'out':function(t,b,c,d){return c*Math.sqrt(1-(t=t/d-1)*t)+b},
			'inOut':function(t,b,c,d){
				if((t/=d/2)<1)return -c/2*(Math.sqrt(1-t*t)-1)+b
				return c/2*(Math.sqrt(1-(t-=2)*t)+1)+b
				}
			},
		elastic:{
			'in':function(t,b,c,d){
				var ts=(t/=d)*t, tc=ts*t
				return b+c*(56*tc*ts + -105*ts*ts + 60*tc + -10*ts)
				},
			'out':function(t,b,c,d){
				var ts=(t/=d)*t, tc=ts*t
				return b+c*(56*tc*ts + -175*ts*ts + 200*tc + -100*ts + 20*t)
				},
			'inOut':function(t,b,c,d){
				var a,p,s
				if(t==0)return b
				if((t/=d/2)==2)return b+c
				a=c*0.1
				p=d*(.3*1.5)
				if(a<Math.abs(c)){a=c;s=p/4;}else var s=p/(2*Math.PI)*Math.asin(c/a)
				if(t<1)return -1.1*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b
				return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p )*1.1+c+b
				}
			},
		back:{
			'in':function(t,b,c,d){
				var ts=(t/=d)*t, tc=ts*t
				return b+c*(4*tc + -3*ts)
				},
			'out':function(t,b,c,d){
				var ts=(t/=d)*t, tc=ts*t
				return b+c*(4*tc + -9*ts + 6*t)
				},
			'inOut':function(t,b,c,d){
				var s=1.70
				if((t/=d/2)<1)return c/2*(t*t*(((s*=(1.53))+1)*t-s))+b
				return c/2*((t-=2)*t*(((s*=(1.53))+1)*t+s)+2)+b
				}
			},
		bounce:{
			'in':function(t,b,c,d){return c-Fx.Effects.bounce['out'](d-t,0,c,d)+b},
			'out':function(t,b,c,d){
				if((t/=d)<(1/2.75))return c*(7.5625*t*t)+b
				else if(t<(2/2.75))return c*(7.5625*(t-=(1.5/2.75))*t+.75)+b
				else if(t<(2.5/2.75))return c*(7.5625*(t-=(2.25/2.75))*t+.9375)+b
				else return c*(7.5625*(t-=(2.625/2.75))*t+.984375)+b
				},
			'inOut':function(t,b,c,d){
				if(t<d/2)return Fx.Effects.bounce['in'](t*2,0,c,d)*.5+b
				return Fx.Effects.bounce['out'](t*2-d,0,c,d)*.5+c*.5+b
				}
			}
		},
	Interval :(function(){
		var _oFPS={}
		, _create=function( nFps ){
			var o=_oFPS[nFps]
			var f = function(){
				var o=_oFPS[nFps], a=o.a.splice(0,o.a.length)
				while(a.length) a.shift()()
				if(o.a.length==0)_remove(nFps)
				}
			return _oFPS[nFps] = o ? o : {
				a:[],
				n: setInterval( f, parseInt(1000/nFps))
				}
			}
		, _remove=function( nFps ){
				var o=_oFPS[nFps]
				if(!o)return false
				clearInterval(o.n)
				delete _oFPS[nFps]
				return true
				}
		return {
			oFPS: _oFPS,
			create: _create,
			push :function( nFps, f ){
				return _create(nFps).a.push(f)
				},
			remove: _remove
			}})()
	})