
a5.Package('a5.cl.ui.core')
	.Static('Keyboard', function(Keyboard){
		Keyboard.BACKSPACE = 8;
		Keyboard.TAB = 9;
		Keyboard.ENTER = 13;
		Keyboard.PAUSE = 19;
		Keyboard.ESCAPE = 27;
		Keyboard.SPACE = 32;
		Keyboard.PAGE_UP = 33;
		Keyboard.PAGE_DOWN = 34;
		Keyboard.END = 35;
		Keyboard.HOME = 36;
		Keyboard.LEFT_ARROW = 37;
		Keyboard.UP_ARROW = 38;
		Keyboard.RIGHT_ARROW = 39;
		Keyboard.DOWN_ARROW = 40;
		Keyboard.INSERT = 45;
		Keyboard.DELETE = 46;
		Keyboard.F1 = 112;
		Keyboard.F2 = 113;
		Keyboard.F3 = 114;
		Keyboard.F4 = 115;
		Keyboard.F5 = 116;
		Keyboard.F6 = 117;
		Keyboard.F7 = 118;
		Keyboard.F8 = 119;
		Keyboard.F9 = 120;
		Keyboard.F10 = 121;
		Keyboard.F11 = 122;
		Keyboard.F12 = 123;
		
		Keyboard.isVisibleCharacter = function(keyCode){
			if(typeof keyCode !== 'number')
				return false;
			else
				return keyCode === 32 || (keyCode >= 48 && keyCode <= 90) || (keyCode >= 96 && keyCode <= 111) || (keyCode >= 186 && keyCode <= 222);
		}
});
