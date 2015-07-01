$ = jQuery.noConflict();

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
  m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

var GAWebPropertyID = $('.htxtGAWebPropertyID').val();
var htxtGADomain = $('.htxtGADomain').val();

ga('create', GAWebPropertyID, htxtGADomain);
ga('send', 'pageview');

$(document).ready(function () {
    initaliseGoogleAnalyticsEvents();
});

var clickObject = {
    flag: false,
    isAlreadyClicked: function () {
        var wasClicked = clickObject.flag;
        clickObject.flag = true;
        setTimeout(function () { clickObject.flag = false; }, 100);
        return wasClicked;
    }
};

function initaliseGoogleAnalyticsEvents() {
    $('a.ga-event').on('click touchstart', function (event) {
        var currentURL = document.URL.substring(document.URL.lastIndexOf("/")).toLowerCase();
        if (currentURL.indexOf("/personal") != -1)
            sendEventToGoogleAnalytics($(this), "personal");
        if (currentURL.indexOf("/business") != -1)
            sendEventToGoogleAnalytics($(this), "business");
    });

    $('a.ga-cta-event').on('click touchstart', function (event) {
       sendCTAEventToGoogleAnalytics($(this));
   });

   $('button.ga-event').on('click touchstart', function (event) {
       sendCTAEventToGoogleAnalytics($(this));
   });
}

function sendEventToGoogleAnalytics(currentLink, currentSection) {
    if (!clickObject.isAlreadyClicked()) {
        var category = currentLink.attr("data-ga-category");
        var action = currentLink.attr("data-ga-action");
        var label = currentLink.attr("data-ga-label");

        category = currentSection + "-home-" + category;

        if (category != "" && action != "" && label != "") {
            ga('send', 'event', category, action, label);
            outputEventDetailsToConsole(category, action, label);
        }
    }
}

function sendCTAEventToGoogleAnalytics(currentLink) {
    if (!clickObject.isAlreadyClicked()) {
        var category = currentLink.attr("data-ga-category");
        var action = currentLink.attr("data-ga-action");
        var label = currentLink.attr("data-ga-label");

        if (category != "" && action != "" && label != "") {
            ga('send', 'event', category, action, label);
            outputEventDetailsToConsole(category, action, label);
        }
    }
}

function outputEventDetailsToConsole(category, action, label) {
    console.log("Google Analytics Event [Category: " + category + ", Action: " + action + ", Label: " + label + "]");
}