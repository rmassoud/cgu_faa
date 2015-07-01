$ = jQuery.noConflict();

$(document).ready(function () {
    var cookieName = "CyclingBanner[" + window.location.pathname + "]";
    var cookieBannerNumber = readCookie(cookieName);
    var bannerNumber = "1";

    if (cookieBannerNumber == null)
        createCookie(cookieName, "1", 90);
    else
        bannerNumber = cookieBannerNumber;

    if (bannerNumber == "1") {
        $(".pnlBannerContainer2").attr("style", "");
        createCookie(cookieName, "2", 90);
    } else {
        $(".pnlBannerContainer1").attr("style", "");
        createCookie(cookieName, "1", 90);
    }
});


function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}