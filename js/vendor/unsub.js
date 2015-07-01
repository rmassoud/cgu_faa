//---------------------------------
// $Header: /home/erosenb/www/unsub.js,v 1.2 2012/04/24 20:33:40 pmanojdev Exp $
//---------------------------------
/*
 * $Log: unsub.js,v $
 * Revision 1.2  2012/04/24 20:33:40  pmanojdev
 * LH 702#250
 * Fixed: We expect it to go to https://aws.predictiveresponse.net/unsub.js but it goes to www.predictiveresponse.net
 *
 * Revision 1.1  2012/04/24 20:32:25  pmanojdev
 * Initial revision
 *
*/
//---------------------------------
/*    
   unsub.js v.1.0 Dec,28 2006
*/
function Querystring(qs) { // optionally pass a querystring to parse
	this.params = new Object()
	this.get=Querystring_get
	
	if (qs == null)
		qs=location.search.substring(1,location.search.length)

	if (qs.length == 0) return

// Turn <plus> back to <space>
// See: http://aws.w3.org/TR/REC-html40/interact/forms.html#h-17.13.4.1
	qs = qs.replace(/\+/g, ' ')
	var args = qs.split('&') // parse out name/value pairs separated via &
	
// split out each name=value pair
	for (var i=0;i<args.length;i++) {
		var value;
		var pair = args[i].split('=')
		var name = unescape(pair[0])

		if (pair.length == 2)
			value = unescape(pair[1])
		else
			value = name
		
		this.params[name] = value
	}
}

function Querystring_get(key, default_) {
	// This silly looking line changes UNDEFINED to NULL
	if (default_ == null) default_ = '';
	
	var value=this.params[key]
	if (value==null) value=default_;
	
	return value
}

// '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email + '&url=' + redir_url
//*************************************
// unsubscribeFromList
// ** Beta **
//*************************************

function unsubscribeFromList(redir_url)
{
    var url        = "https://aws.predictiveresponse.net/";
    var qs         = new Querystring();
    var org        = qs.get('org');
    var email      = qs.get('email');
    var lea        = qs.get('lea',0);
    var cam        = qs.get('cam',0);
    var lvl        = qs.get('lvl',0);
    var ite        = qs.get('ite',0);
    email          = email.replace("AT", "@");
    var out        
    for (var i=0; i<document.form.campaignId.length; i++) {
       if (document.form.campaignId[i].checked) {
       cam = document.form.campaignId[i].value
       }
    }
    if(cam == 0) { 
       url = url + "utrac2.php";
    }
    else {
       url = url + "utrac3.php";
    }
       out = '<img height=1 width=1 src="' + url + '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email + '"/>';
    //alert(out);
    document.write(out)
    window.location = redir_url;
}
//*************************************
// unsubscribeFromCampaign
//*************************************

function unsubscribeFromCampaing(redir_url)
{
    var url        = "https://aws.predictiveresponse.net/utrac3.php";
    var qs         = new Querystring();
    var org        = qs.get('org');
    var email      = qs.get('email');
    var lea        = qs.get('lea',0);
    var cam        = qs.get('cam',0);
    var lvl        = qs.get('lvl',0);
    var ite        = qs.get('ite',0);
    var out        = "";
    email          = email.replace("AT", "@");
    //
    out            = '<img height=1 width=1 src="' + url + '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email + '&url=' + redir_url + '"/>';
    //alert(out);
    document.write(out)
    window.location = redir_url;
}

function performUnsubscribe()
{
    var url        = "http://aws.predictiveresponse.net/utrac.php";
    var qs         = new Querystring();
    var org        = qs.get('org');
    var email      = qs.get('email');
    var lea        = qs.get('lea',0);
    var cam        = qs.get('cam',0);
    var lvl        = qs.get('lvl',0);
    var ite        = qs.get('ite',0);
    email          = email.replace("AT", "@");
    var out        = '<img height=1 width=1 src="' + url + '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email  + '"/>';
    //alert("An error was encountered, please try again later");
    //alert(out);
    document.write(out);
    alert("You have succesfully been unsubscribed from our list");
}

function getSubmitButton(redir_url)
{
    var url        = "https://aws.predictiveresponse.net/utrac2.php";
    var qs         = new Querystring();
    var org        = qs.get('org');
    var email      = qs.get('email');
    var lea        = qs.get('lea',0);
    var cam        = qs.get('cam',0);
    var lvl        = qs.get('lvl',0);
    var ite        = qs.get('ite',0);
    email          = email.replace("AT", "@");
    var out = '<FORM action="' + url + '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email + '&url=' + redir_url + '" method=\"post\"> <input type=\"submit\" value=\"Submit\" /> <br> </FORM>';
    //alert(out);
    document.write(out);
}

function getUnsubscribeLink(redir_url)
{
    var url        = "https://aws.predictiveresponse.net/utrac2.php";
    var qs         = new Querystring();
    var org        = qs.get('org');
    var email      = qs.get('email');
    var lea        = qs.get('lea',0);
    var cam        = qs.get('cam',0);
    var lvl        = qs.get('lvl',0);
    var ite        = qs.get('ite',0);
    email          = email.replace("AT", "@");
    //var out = '<a href="' + url + '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email + '&url=' + redir_url + '" class="call-to-action">Unsubscribe</a>';
    //alert(out);
    var out = url + '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email + '&url=' + redir_url;
    window.location = out;
    //document.write(out);
}

function getSubmitButtonAll(redir_url)
{
    var url        = "https://aws.predictiveresponse.net/utrac2.php";
    var qs         = new Querystring();
    var org        = qs.get('org');
    var email      = qs.get('email');
    var lea        = qs.get('lea',0);
    var cam        = qs.get('cam',0);
    var lvl        = qs.get('lvl',0);
    var ite        = qs.get('ite',0);
    email          = email.replace("AT", "@");
    var out = '<FORM action="' + url + '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email + '&url=' + redir_url + '" method=\"post\"> <input type=\"submit\" value=\"All Lists\" /> <br> </FORM>';
    document.write(out);
}

function getSubmitButtonCampaign(redir_url)
{
    var url        = "https://aws.predictiveresponse.net/utrac3.php";
    var qs         = new Querystring();
    var org        = qs.get('org');
    var email      = qs.get('email');
    var lea        = qs.get('lea',0);
    var cam        = qs.get('cam',0);
    var lvl        = qs.get('lvl',0);
    var ite        = qs.get('ite',0);
    email          = email.replace("AT", "@");
    var out = '<FORM action="' + url + '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email + '&url=' + redir_url + '" method=\"post\"> <input type=\"submit\" value=\"This List Only\" /> <br> </FORM>';
    //alert(out);
    document.write(out);
}

function getGlobalUnsubscribeButton(redir_url)
{
    var url        = "https://aws.predictiveresponse.net/utrac2.php";
    var qs         = new Querystring();
    var org        = qs.get('org');
    var lea        = qs.get('lea',0);
    var cam        = qs.get('cam',0);
    var lvl        = qs.get('lvl',0);
    var ite        = qs.get('ite',0);
    var email      = qs.get('email');
    email          = email.replace("AT", "@");
    var out = '<FORM action="' + url + '?org=' + org + '&cam=' + cam + '&lea=' + lea + '&lvl=' + lvl + '&ite=' + ite +'&email=' + email + '&url=' + redir_url + '" method=\"post\"> <input type=\"submit\" value=\"Submit\" /> <br> </FORM>';
    document.write(out);
}

function printFirstName()
{
    var qs         = new Querystring();
    var first_name = qs.get('first_name');
    document.write(first_name);
}

function printLastName()
{
    var qs         = new Querystring();
    var last_name = qs.get('last_name');
    document.write(last_name);
}

function printEmail()
{
    var qs         = new Querystring();
    var email      = qs.get('email');
    email          = email.replace("AT", "@");
    document.write(email);
}