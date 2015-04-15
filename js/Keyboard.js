Keyboard ={
	id:{
		8:'BACKSPACE',
		9:'TAB',
		13:'ENTER',
		16:'SHIFT',17:'CTRL',18:'ALT',
		19:'PAUSE',
		20:'CAPS_LOCK',
		27:'ESCAPE',
		33:'PAGE_UP',34:'PAGE_DOWN',
		35:'END',
		36:'HOME',
		37:'LEFT',38:'UP',39:'RIGHT',40:'DOWN',
		44:'PRINT_SCREEN',
		45:'INSERT',46:'DELETE',
		111:'DIVIDE',109:'MINUS',107:'PLUS',
		112:'F1',113:'F2',114:'F3',115:'F4',116:'F5',117:'F6',118:'F7',119:'F8',120:'F9',121:'F10',	122:'F11',123:'F12',
		144:'NUM_LOCK',145:'SCROLL_LOCK'
		},
	code :function(e){
		if(e){
			var n = e.charCode||e.keyCode||0
			// if( ! in_array( e.type, [ 'keypress','keyup' ])) // Pourquoi ? 
			// Mis en commentaire pour le module rename du treeview
			Keyboard.union({
				alt:Keyboard.Alt(e),
				ctrl:Keyboard.Ctrl(e),
				meta:e.metaKey||false,
				shift:Keyboard.Shift(e),
				charcode: n,
				key:String.fromCharCode(n)
				})
			return n
			}
		return null
		},
	shortcut :function(evt){
		var n=Keyboard.code(evt),a=[]
		if(Keyboard.ctrl)a.push('CTRL')
		if(Keyboard.alt)a.push('ALT')
		if(Keyboard.shift)a.push('SHIFT')
		if(Keyboard.meta)a.push('META')
		a.push((Keyboard.id[n]||Keyboard.key).toUpperCase())
		return a.join('+')
		},
	Alt :function(e){
		return e.modifiers?(e.modifiers%2):e.altKey
		},
	Ctrl :function(e){
		return e.modifiers?((e.modifiers==2)||(e.modifiers==3)||(e.modifiers>5)):e.ctrlKey
		},
	Shift :function(e){
		return e.modifiers?(e.modifiers>3):e.shiftKey
		}
	}