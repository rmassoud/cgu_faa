function Analytics(){
	
	this.asyncInclude = function(url, cB) {
		var h = document.getElementsByTagName('head');
		if (h.length == 0) h[0] = document.body.parentNode.appendChild(document.createElement('head'));
		var n = document.createElement('script');
		n.type = 'text/javascript';
		n.src = url;
		if (cB) {
			if (n.addEventListener) n.addEventListener('load', cB, false);
			else if (n.attachEvent) n.attachEvent('onreadystatechange', function () { if (n.readyState == 'complete' || n.readyState == 'loaded') cB(); });
		}
		h[0].appendChild(n);
		return true;
	}
	
	this.include = function(url){
		var h = document.getElementsByTagName('head');
		if (h.length == 0) h[0] = document.body.parentNode.appendChild(document.createElement('head'));
		var n = document.createElement('script');
		n.type = 'text/javascript';
		n.src = url;
		h[0].appendChild(n);
		return true;
	}
	
	this.top = function(){
		if(typeof superT!="undefined" && typeof superT.t=="function"){superT.t();}
	}
	
	this.bottom = function(){
		if(typeof superT!="undefined" && typeof superT.b=="function"){superT.b();}
		if(typeof superT!="undefined" && typeof superT.b2=="function"){superT.b2();}
	}
}
var _analytics = new Analytics();
document.write("\x3Cscr"+"ipt type=\"text/javascript\" src=\"//c.supert.ag/p/000276/supertag.js\"\x3E\x3C/scr"+"ipt\x3E");
