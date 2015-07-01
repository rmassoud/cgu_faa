$ = jQuery.noConflict();

var map;
var geocoder;

var adviserArray = [];
var adviserIdArray = [];
var noOfAdvisersInList = 0;
var adviserJSONArray = [];
var markerArray = [];
var infoBoxArray = [];
var mobileGoogleMapsArray = [];

var currentAdviserId;
var currentAdviserLatLng;
var currentAdviserMarker;

var currentLocationLatLng;
var currentLocationMarker;

var currentMarker;
var currentInfoBox;

var adviserFetchQuantity = 0;
var adviserDisplayQuantity = 0;

var googleMapInitialZoomLevel = 0;
var googleMapZoomLevel = 0;
var googleMapMobileZoomLevel = 0;

var image_r = new google.maps.MarkerImage("/img/gmaps-marker-recommended@2x.png", null, null, null, new google.maps.Size(35, 53));
var image_rh = new google.maps.MarkerImage("/img/gmaps-marker-recommended-highlighted@2x.png", null, null, null, new google.maps.Size(35, 53));
var image_n = new google.maps.MarkerImage("/img/gmaps-marker@2x.png", null, null, null, new google.maps.Size(28, 43));
var image_nh = new google.maps.MarkerImage("/img/gmaps-marker-highlighted@2x.png", null, null, null, new google.maps.Size(28, 43));

var currentButton = null;
var geolocationSuccess = false;


$(document).ready(function () {

    if (isCurrentPageFindAnAdviser())
        $('#mmliFindAnAdviser').removeClass('has-megamenu');

    // If the FAA form does not exist on the page, do not execute the code
    if ($('#find_an_adviser_app_form').html() == undefined)
        return false;

    fedDocumentReadyEventsAndFunctions();   

    $('#faa_adviserList_welcome').css('display', 'block');

    geocoder = new google.maps.Geocoder();


    initaliseRequestHandlers();
    initaliseConfigurationSettings();
    initaliseGoogleMap();
    initaliseLocation();
    initalisePrimaryEvents();
    initaliseURLParameters();

    responsiveDocumentReadyEventsAndFunctions();

    if (isCurrentPageFindAnAdviser() == false)
        $('#find-adviser').trigger('mouseleave');
});

// Commented by Remon
function initaliseRequestHandlers() {
    // Sys.WebForms.PageRequestManager.getInstance().add_beginRequest(BeginRequestHandler);
    // Sys.WebForms.PageRequestManager.getInstance().add_endRequest(EndRequestHandler);
}

function BeginRequestHandler(sender, args) {
    currentButton = args.get_postBackElement();
    currentButton.disabled = true;

    if (currentButton.id.indexOf('btnSave') != -1) {
        $('.btnSave').val("Processing...");
    }
}

function EndRequestHandler(sender, args) {
    if (currentButton.id.indexOf('btnRefresh') != -1) {
        refreshAdviserList();
    }

    if (currentButton.id.indexOf('btnSave') != -1) {
        if ($('.raq_validationSummary').html().trim().length == 0)
            showRAQConfirmation();
        else
            populateAdviserDetailsInRAQForm();

        $('.btnSave').val("Submit enquiry");
    }

    currentButton.disabled = false;
    currentButton = null;
}

function initaliseConfigurationSettings() {
    googleMapInitialZoomLevel = $('.htxtGoogleMapInitialZoomLevel').val();
    googleMapInitialZoomLevel = parseInt(googleMapInitialZoomLevel, 10);
    googleMapZoomLevel = $('.htxtGoogleMapZoomLevel').val();
    googleMapZoomLevel = parseInt(googleMapZoomLevel, 10);
    googleMapMobileZoomLevel = $('.htxtGoogleMapMobileZoomLevel').val();
    googleMapMobileZoomLevel = parseInt(googleMapMobileZoomLevel, 10);

    adviserFetchQuantity = $('.htxtAdviserFetchQuantity').val();
    adviserFetchQuantity = parseInt(adviserFetchQuantity, 10);
    adviserDisplayQuantity = $('.htxtAdviserDisplayQuantity').val();
    adviserDisplayQuantity = parseInt(adviserDisplayQuantity, 10);
}

function initaliseGoogleMap() {
    if (map != undefined)
		return false;
	
    var mapOptions = {
        center: new google.maps.LatLng(-26, 133.416667), // Central Australia = -26, 133.416667
        zoom: googleMapInitialZoomLevel
    };

    var mapContainer = $('#faa_googleMap');
    if (mapContainer[0] != undefined) {
        map = new google.maps.Map(mapContainer[0], mapOptions);
    }
}

function initalisePrimaryEvents() {
    $('#btnCurrentLocation').on('click', function () {
        $('#faa_adviserList_welcome').css('display', 'none');
        getAndSetMyLocation();
        return false;
    });

    $('#adviser_location').keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            $('#faa_adviserList_welcome').css('display', 'none');
			setSearchValuesAndLoadAdvisers();
			return false;
        }
    });

    $('#btnLoad').on('click', function () {
        $('#faa_adviserList_welcome').css('display', 'none');
        setSearchValuesAndLoadAdvisers();
        return false;
    });

    $('.btnSave').on('click', function () {
        var eMsg = $('.cvMessage:visible');
        if ($('.cvMessage:visible').length > 0 && getCurrentBootstrapSize() == 'xs') {
            eMsg.each(function (idx) {
                if (eMsg.next().val() === '') {
                    smoothScrollTo($(this), -72);
                    return false;
                }
            });
        }
    });
}

function initaliseLocation() {
    var locationInput = $('#adviser_location');
    var autocomplete = new google.maps.places.Autocomplete(locationInput[0]);
    google.maps.event.addListener(autocomplete, 'adviser_location_changed');
}

function initaliseURLParameters() {
    console.log('initaliseURLParameters started...');
    var insuranceType = $('.htxtInsuranceType').val();
	if (insuranceType == undefined)
        insuranceType = "";
		
    var product = checkProductValue($('.htxtProduct').val());
    var location = checkLocationValue($('.htxtLocation').val());

    if (insuranceType == "") {
        if (window.location.href.indexOf('/Personal') != -1)
            insuranceType = 'Personal';
        if (window.location.href.indexOf('/Business') != -1)
            insuranceType = 'Commercial';
    }

    if (isCurrentPageFindAnAdviser() && insuranceType == "" && document.referrer != "") {
        if (document.referrer.indexOf('/Personal') != -1)
            insuranceType = 'Personal';
        if (document.referrer.indexOf('/Business') != -1)
            insuranceType = 'Commercial';
    }

    if (insuranceType != "") {
        $('#rb_' + insuranceType.toLowerCase()).prop('checked', true);
        $('#rb_' + insuranceType.toLowerCase()).trigger('click');
        $('#product_col').removeClass('disabled');
    }

    if (product != "") {
        $('#product_col').removeClass('disabled');
        $('.adviser-product-dropdown li[data-value="' + product + '"]').trigger('click');
        $('#location_col').removeClass('disabled');
    }

    if (location != "") {
        $('#location_col').removeClass('disabled');
        $('#adviser_location').val(location);
    }

    insuranceType = $('input[name=adviser-type]:checked', '#find_an_adviser_app_form').val();
    product = checkProductValue($('#adviser_product').val());
    location = checkLocationValue($('#adviser_location').val());

    if (insuranceType != "" && product != "" && location != "")
        setSearchValuesAndLoadAdvisers();

}

// The following two functions are required to handle placeholder issues with Internet Explorer
// jQuery uses the data-audero-unp-text attribute to get around the placeholder issue with IE8
function checkProductValue(value){
	if (value != undefined)
		value = value.trim();
	
	if (value == undefined || value == $('#adviser_product').attr('placeholder') || value == $('#adviser_product').attr('data-audero-unp-text'))
        return "";
	else
		return value;
}

function checkLocationValue(value){
	if (value != undefined)
		value = value.trim();
	
	if (value == undefined || value == $('#adviser_location').attr('placeholder') || value == $('#adviser_location').attr('data-audero-unp-text'))
        return "";
	else
		return value;
}

function setSearchValuesAndLoadAdvisers() {
    console.log('setSearchValuesAndLoadAdvisers started....');
    $('.adviser-product-dropdown').removeClass('open');
    $('.find-an-adviser-app-panels').removeClass('hidden');

    var insuranceType = $('input[name=adviser-type]:checked', '#find_an_adviser_app_form').val();
    var product = checkProductValue($('#adviser_product').val());
    var location = checkLocationValue($('#adviser_location').val());

    console.log(insuranceType);
    console.log(product);
    console.log(location);


    // if (isCurrentPageFindAnAdviser() == false && insuranceType != "" && product != "" && location != "")
    //     navigateToFindAnAdviser();

    if (insuranceType == "" || product == "" || location == "") {
        clearAdvisers();
        $('#faa_adviserList_incompleteCriteria').css("display", "block");
        $('#faa_loadingPanel').css("display", "none");
        return false;
    }

    $('#faa_adviserList_incompleteCriteria').css("display", "none");
    $('#faa_loadingPanel').css("display", "inline-block");
    
    $('.htxtInsuranceType').val(insuranceType);
    $('.htxtProduct').val(product);
    $('.htxtLocation').val(location);

    $(".btnRefresh").click();
    // refreshAdviserList();
}

//Determines if the current page is the Find An Adviser page
function isCurrentPageFindAnAdviser() {
    var FAAPageName = $('.htxtFAAPageName').val();
    // var currentURI = window.location.href;
    var currentURI = "http://www.cgu.com.au/insurance/Personal/Find-an-insurance-adviser";
    return (currentURI.indexOf(FAAPageName) != -1);
}

function navigateToFindAnAdviser() {

    console.log('navigateToFindAnAdviser started .....');


    var faaurl = $('.htxtFAAURL').val();
    var insuranceType = $('input[name=adviser-type]:checked', '#find_an_adviser_app_form').val();
    var product = $('#adviser_product').val();
    var location = $('#adviser_location').val().trim();
    // navigate to personal or business depending on selection
    if (insuranceType == "commercial")
        faaurl = faaurl.replace('/Personal', '/Business');
    var navurl = faaurl + '?it=' + encodeURIComponent(insuranceType) + '&p=' + encodeURIComponent(product) + '&l=' + encodeURIComponent(location);
    window.location.href = navurl;
}

function clearAdvisers() {
    console.log('clearAdvisers started ...');

    $('#faa_adviserList_ResultsInfo').css('display', 'none');
    $('#faa_ShowMoreResults_container').css("display", "none");
    $('.faa_adviserList_message').css("display", "none"); // hides multiple divs
    $('#faa_adviserList_multipleLocations').css("display", "none");

    $('#faa_adviserList').html(null);

    // loop marker array and clear each from the map
    if (adviserIdArray.length > 0)
        map.clearOverlays();

    if (map != undefined)
        map.getStreetView().setVisible(false);

    adviserArray = [];
    adviserIdArray = [];
    noOfAdvisersInList = 0;
    adviserJSONArray = [];
    markerArray = [];
    infoBoxArray = [];
    mobileGoogleMapsArray = [];
    currentAdviserId = null;
    currentMarker = null;

    if (currentInfoBox != undefined)
        currentInfoBox.close();
    currentInfoBox = null;

    currentAdviserLatLng = null;
    currentAdviserMarker = null;

    currentLocationLatLng = null;
    if (currentLocationMarker != undefined)
        currentLocationMarker.setMap(null);
    currentLocationMarker = null;

    $('a.faa-get-my-location').removeClass('loading')
}

function refreshAdviserList() {
    console.log('refreshAdviserList started ...');
    clearAdvisers();

    $('#faa_loadingPanel').css("display", "none");

    var geocodeResponse = $('.htxtGeocodeResults').val();
    if (geocodeResponse != "") {
        var geocodeResponseArray = jQuery.parseJSON(geocodeResponse);
        if (geocodeResponseArray.results.length > 1) {
            populateMultipleLocations(geocodeResponseArray.results);
            $('#faa_adviserList_multipleLocations').css("display", "block");
            return false;
        }
    }

    if ($('.htxtAustralianLocation').val() == "False") {
        $('#faa_adviserList_locationNotFound').css("display", "block");
        return false;
    }

    populateAdvisers();
    $('#faa_adviserList').css("display", "initial");

    $('#adviser_location').val($(".htxtFormattedAddress").val());
    setCurrentPosition($(".htxtLatitude").val(), $(".htxtLongitude").val());

    $(".htxtAustralianLocation").val(null);
    $(".htxtLatitude").val(null);
    $(".htxtLongitude").val(null);
    $(".htxtFormattedAddress").val(null);
    $(".htxtGeocodeResults").val(null);
}

function populateMultipleLocations(geocodeResultsArray) {
    var addressLinks = "";
    $.each(geocodeResultsArray, function (index, value) {
        addressLinks += '<li><a href="#" onclick="setLocationAndRefresh(\'' + value.formatted_address + '\')" class="addressResult">' + value.formatted_address + '</a></li>';
    });
    $('#faa_adviserList_multipleLocations').html('<h4>Did you mean:</h4><ul>' + addressLinks + '</ul>');
}

function setLocationAndRefresh(address) {
    $('#adviser_location').val(address);
    useFirstGeocodeResult = true;
    setSearchValuesAndLoadAdvisers();
}

google.maps.Map.prototype.clearOverlays = function () {
    var id = 0;
    for (var i = 0; i < adviserIdArray.length; i++) {
        id = adviserIdArray[i];
        markerArray[id].setMap(null);
    }
    markerArray.length = 0;
}

function populateAdvisers() {
    var json = $('.htxtAdviserListJSON').val();

    if (json.length != 0)
        adviserJSONArray = jQuery.parseJSON(json);

    if (adviserJSONArray == null || adviserJSONArray.length == 0) {
        $('#faa_ShowMoreResults_container').css("display", "none");
        $('#faa_adviserList_noResults').css("display", "block");
        return false;
    }
    else
        $('#faa_adviserList_noResults').css("display", "none");

    var advisersToAppend = getAdvisersToAppend();

    populateAdviserList(advisersToAppend);
    populateMarkers(advisersToAppend);

    if (noOfAdvisersInList >= adviserJSONArray.length)
        $('#faa_ShowMoreResults_container').css("display", "none");
    else
        $('#faa_ShowMoreResults_container').css("display", "block");

    if (noOfAdvisersInList > 0) {
        var resultsInfo = 'Displaying 1 to ' + noOfAdvisersInList + ' of ' + adviserJSONArray.length + ' results';
        $('#faa_adviserList_ResultsInfo').html(resultsInfo);
        $('#faa_adviserList_ResultsInfo').css('display', 'block');
    }

    registerSecondaryEvents();
    hideLoadingAnimation();
}

function registerSecondaryEvents() {
    $('.ali').on('click', function (e) {
        var id = e.delegateTarget.id;
        id = id.substring(4, id.length);
        ali_click(id);
    });

    $('.ali').on('mouseover', function (e) {
        e.preventDefault();
        var id = $(this).attr('id');
        id = id.substring(4, id.length);
        switchMarkerImage(markerArray[id], 'mouseover', false);
    });
    $('.ali').on('mouseout', function (e) {
        e.preventDefault();
        var id = $(this).attr('id');
        id = id.substring(4, id.length);
        switchMarkerImage(markerArray[id], 'mouseout', false);
    });
}

function getAdvisersToAppend() {
    var advisersToAppend = [];
    var adviserCount = 0;

    if (noOfAdvisersInList == adviserJSONArray.length)
        return advisersToAppend;

    $.each(adviserJSONArray, function (index, value) {
        if (adviserCount >= adviserDisplayQuantity)
            return false;

        if (adviserArray[value["AccountId"]] != undefined)
            return;

        advisersToAppend[adviserCount] = value;
        adviserCount += 1;
    });

    return advisersToAppend;
}

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function populateAdviserList(advisers) {
    $.each(advisers, function (index, value) {
        var accountid = value["AccountId"];
        adviserArray[accountid] = value;
        adviserIdArray.push(accountid);
        var html = buildAdviserInformation(value, 'ali');
        $('#faa_adviserList').append(html);
        noOfAdvisersInList += 1;
    });
}

function populateMarkers(advisers) {
    jQuery.each(advisers, function (index, value) {
        var infoBox = buildInfoBox(value, "gmib");
        addMarkerToMap(value, infoBox);
    });
}

function buildAdviserInformation(adviser, type) {
    var html = '<div id="' + type + '_' + adviser["AccountId"] + '" class="' + type;
    if (adviser["Sponsored"])
        html += ' ' + type + '-recommended';
    if (adviser["Logo"] == undefined)
        html += ' no-broker-image';
    html += '">';

    html += '<div id="mgm_' + adviser["AccountId"] + '" class="ai-map">[Mobile Google Map]</div>';

    if (adviser["Logo"] != undefined) {
        html += '<div class="ai-logo-container"><img class="ai-logo-image" src="img/Logos/' + adviser["Logo"] + '" alt="Adviser Logo" /></div>';
    }

    html += '<div class="ai-recommended">Featured</div>';
    html += '<div class="ai-name">' + adviser["Name"] + '</div>';

    var address = "";
    if (adviser["Street"] != null)
        address += adviser["Street"] + ', ';
    if (adviser["City"] != null)
        address += adviser["City"] + ', ';
    if (adviser["State"] != null)
        address += adviser["State"] + ', ';
    if (adviser["PostalCode"] != null)
        address += adviser["PostalCode"];
    if (adviser["PostalCode"] == null && address.length > 0)
        address = address.substring(0, address.length - 2);
    html += '<div class="ai-address">' + address + '</div>';

    html += '<div class="ai-details">';
    //html += 'Phone: <span class="ai-phone">' + adviser["Phone"] + '</span><br />';
    if (adviser["ContactEmail"] != undefined)
        html += 'Email: <a class="ai-emailLink" href="mailto:' + adviser["ContactEmail"] + '">' + adviser["ContactEmail"] + '</a><br />';
    if (adviser["Website"] != null && adviser["Website"] != 'N/A') {
        if (adviser["Website"].indexOf("http") != -1)
            html += 'Website: <a class="ai-websiteLink" href="' + adviser["Website"] + '" target="_blank">' + adviser["Website"] + '</a>';
        else
            html += 'Website: <a class="ai-websiteLink" href="http://' + adviser["Website"] + '" target="_blank">' + adviser["Website"] + '</a>';
    }
    html += '</div>';

    html += '<div class="ai-social" style="display:none;">';
    html += '<a href="https://twitter.com/" target="_blank"><i class="icon-social-twitter colour-twitter"></i></a>';
    html += '<a href="http://www.facebook.com/" target="_blank"><i class="icon-social-facebook colour-facebook"></i></a>';
    html += '<a href="https://plus.google.com/" target="_blank"><i class="icon-social-google-plus colour-google"></i></a>';
    html += '<a href="http://www.linkedin.com/" target="_blank"><i class="icon-social-linkedin colour-linkedin"></i></a>';
    html += '</div>';

    if (adviser["CompanySynopsis"] != undefined)
        html += '<p class="ai-synopsis">' + adviser["CompanySynopsis"] + '</p>';

    html += '<a class="ai-raqLink" href="#" onclick="requestAQuoteForm(\'' + adviser["AccountId"] + '\')">Request a quote</a>';

    html += '</div>';
    return html;
}

function buildInfoBox(adviser, type) {
    var html = buildAdviserInformation(adviser, type);

    var infoBox = new InfoBox({
        id: adviser["AccountId"],
        content: html,
        disableAutoPan: false,
        maxWidth: 500,
        zIndex: null,
        closeBoxMargin: "20px 20px 0 0",
        closeBoxURL: "/cgu.com.au/img/gmaps-close.png",
        infoBoxClearance: new google.maps.Size(1, 1),
        isHidden: false,
        pane: "floatPane",
        enableEventPropagation: false,
        alignBottom: true
    });

    google.maps.event.addListener(infoBox, 'closeclick', function () {
        clearCurrentAdviser();
    });

    return infoBox;
}

function clearCurrentAdviser() {
    $('#ali_' + currentAdviserId).removeClass('ali-selected');

    switchMarkerImage(currentMarker, 'mouseout', true);

    currentAdviserId = null;
    currentInfoBox = null;
    currentMarker = null;
}

function addMarkerToMap(adviser, infoBox) {
    var accountid = adviser["AccountId"];
    var lat = adviser["Latitude"];
    var lng = adviser["Longitude"];

    infoBoxArray[accountid] = infoBox;

    var markerPosition = new google.maps.LatLng(lat, lng);

    var image = image_n;
    if (adviser["Sponsored"] == true) {
        image = image_r;
    }

    //Add the marker to the map
    var marker = new google.maps.Marker({
        id: accountid,
        icon: image,
        position: markerPosition,
        title: adviser["Name"],
        animation: google.maps.Animation.DROP,
        map: map
    });

    //set the zoom level
    map.setZoom(googleMapZoomLevel);

    //Add the marker to an array containing all the markers on the map
    markerArray[accountid] = marker;

    //Add a listener to marker for the mouse over event
    google.maps.event.addListener(marker, 'mouseover', function () {
        switchMarkerImage(marker, 'mouseover', false);
        switchListItemBackground(marker, 'mouseover');
    });

    //Add a listener to marker for the mouse out event
    google.maps.event.addListener(marker, 'mouseout', function () {
        switchMarkerImage(marker, 'mouseout', false);
        switchListItemBackground(marker, 'mouseout');
    });

    //Add a listener to marker for the click event
    google.maps.event.addListener(marker, 'click', function () {
        setCurrentAdviser(marker.id, true);
        moveToMarkerLocation(marker);
    });
}

function switchMarkerImage(marker, event, override) {
    var image = null;

    if (override == false && marker == currentMarker)
        return false;

    if (event == 'mouseover') {
        if (adviserArray[marker.id]["Sponsored"])
            image = image_rh;
        else
            image = image_nh
    }

    if (event == 'mouseout') {
        if (adviserArray[marker.id]["Sponsored"])
            image = image_r;
        else
            image = image_n;
    }

    marker.setIcon(image);
}

function switchListItemBackground(marker, event) {
    if (marker == currentMarker)
        return false;

    if (event == 'mouseover')
        $('#ali_' + marker.id).addClass('hover');
    else
        $('#ali_' + marker.id).removeClass('hover');
}

function ali_click(id) {
    setCurrentAdviser(id, false);

    if (getCurrentBootstrapSize() != 'xs') {
        $('#raq_form_modal').attr('class', 'modal fade');
        moveToMarkerLocationByID(id);
    }

    loadMobileGoogleMap(id);

    if (getCurrentBootstrapSize() == 'sm') {
        smoothScrollTo('#faa_googleMap_container', 0);
    }
}

function loadMobileGoogleMap(id) {
    if (mobileGoogleMapsArray[id] != undefined) {
        mobileGoogleMapsArray[id].panTo(currentAdviserLatLng);
        return true;
    }

    var mapOptions = {
        center: currentAdviserLatLng,
        zoom: googleMapMobileZoomLevel,
        disableDefaultUI: true,
        zoomControl: true
    };
    var mapContainer = $('#mgm_' + id);
    var adviserMap = new google.maps.Map(mapContainer[0], mapOptions);

    //Add the marker to the map
    var marker = new google.maps.Marker({
        id: id,
        icon: image_nh,
        position: currentAdviserLatLng,
        title: adviserArray[id]["Name"],
        animation: google.maps.Animation.DROP,
        map: adviserMap
    });

    mobileGoogleMapsArray[id] = adviserMap;
}

function moveToMarkerLocationByID(accountid) {
    moveToMarkerLocation(markerArray[accountid], false);
}

function moveToMarkerLocation(marker) {
    infoBox = infoBoxArray[marker.id];

    var widthOffset = (infoBox.maxWidth_ / 2);
    var markerHeight = marker.icon.size.height;
    var heightOffset = 15 + markerHeight;
    infoBox.pixelOffset_ = new google.maps.Size(-widthOffset, -heightOffset);

    if (currentMarker != null) {
        switchMarkerImage(currentMarker, 'mouseout', true);
    }

    switchMarkerImage(marker, 'mouseover', false);

    if (infoBox != null) {
        if (currentInfoBox != null)
            currentInfoBox.close();

        infoBox.open(map, marker);
        currentInfoBox = infoBox;
    }

    var position = marker.getPosition();
    var lat = position.lat();
    var lng = position.lng();
    currentAdviserLatLng = new google.maps.LatLng(lat, lng);
    // centre the map on the marker
    map.panTo(currentAdviserLatLng);
    // adjust the centre of the map slightly higher than the marker to allow for the infoBox
    map.panBy(0, -100);
    currentMarker = marker;
}

function setCurrentAdviser(id, scrollList) {
    if (currentAdviserId != undefined) {
        $('#ali_' + currentAdviserId).removeClass("ali-selected");
        $('#ali_' + currentAdviserId).removeClass("hover");
    }

    $('#ali_' + id).addClass("ali-selected");

    if (scrollList) {
        var amount = $('#ali_' + id).offset().top - $("#faa_adviserList_container").offset().top;
        $('#faa_adviserList_container').scrollTop(amount);
    }

    currentAdviserId = id;
    currentAdviserMarker = markerArray[id];
    currentAdviserLatLng = currentAdviserMarker.position;
}

function getAndSetMyLocation() {
    if (map != undefined)
        map.getStreetView().setVisible(false);

    $('#adviser_location').val("");
    geolocationSuccess = false;
    $('a.faa-get-my-location').addClass('loading')
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(SetCurrentPostionByGeolocation, GeolocationErrorOrTimeout, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        setTimeout(GeolocationErrorOrTimeout, 11000);
    }
}

function SetCurrentPostionByGeolocation(geolocation) {
    geolocationSuccess = true;
    SetAddressByLatLng(geolocation.coords.latitude, geolocation.coords.longitude);

    var faaPanel = $('.find-an-adviser-app-panels');
    if (faaPanel.attr('class') != undefined && faaPanel.attr('class').indexOf('hidden') == -1)
        setCurrentPosition(geolocation.coords.latitude, geolocation.coords.longitude);

    $('a.faa-get-my-location').removeClass('loading')
}

function GeolocationErrorOrTimeout() {
    if (geolocationSuccess == false) {
        var location = $('#adviser_location').val();

        if (location == $('#adviser_location').attr('placeholder'))
            location = "";

        if (location == "") {
            $('a.faa-get-my-location').removeClass('loading');
            $('#faa_adviserList_myLocationFailed').css("display", "block");
        }
    }
}

function SetAddressByLatLng(latitude, longitude) {
    var latlng = new google.maps.LatLng(latitude, longitude);
    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            $('#adviser_location').val(results[0].formatted_address);
            $('.htxtLocation').val(results[0].formatted_address);
        }
    }
    );
}

// Geocodes the location and loads it within the map
// Note: this is no longer required, but kept for possible future use
function getAndSetLocationPosition() {
    var location = $('#adviser_location').val().trim();
    if (location == "") return false;

    geocoder.geocode({ 'address': location, 'region': 'AU' }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results.length > 1) {
                populateMultipleLocations(results);
            }
            else {
                var position = results[0].geometry.location;
                $('#adviser_location').val(results[0].formatted_address);
                setCurrentPosition(position.lat(), position.lng());
            }
        }
    });
}

// Add a marker to the map and centre the map at the marker position
function setCurrentPosition(lat, lng) {
    if (map == undefined)
        return false;

    if (CheckLocationWithinAustralia(lat, lng) == false) {
        $('#faa_adviserList_welcome').css('display', 'none');
        $('#faa_adviserList_locationNotFound').css("display", "block");
        return false;
    }

    var position = new google.maps.LatLng(lat, lng);

    var div = document.createElement('DIV');
    div.innerHTML = '<div class="pulse"></div>';

    if (currentLocationMarker != undefined) {
        currentLocationMarker.setMap(null);
        currentLocationMarker = null;
    }

    var marker = new RichMarker({
        position: position,
        map: map,
        draggable: false,
        content: div
    });

    currentLocationLatLng = position;
    currentLocationMarker = marker;

    map.setZoom(googleMapZoomLevel);
    map.setCenter(position);
}

function CheckLocationWithinAustralia(latitude, longitude)
{
    // returns true if location is within bounds of Australia's extremities
    return latitude < -10 && latitude > -44 && longitude > 113 && longitude < 154;
}

function existsInAdviserCollection(adviser) {
    var result = $.grep(adviserCollection, function (e) { return e.AccountId === adviser['AccountId'] });
    return (result.length != 0)
}

function showMoreResults() {
    showLoadingAnimation();
    populateAdvisers();
    registerSecondaryEvents();
}

function showLoadingAnimation() {
    $('#ShowMoreResultsText').css("display", "none");
    $('#faa_loadingPanel').css("display", "inline-block");
}

function hideLoadingAnimation() {
    $('#faa_loadingPanel').css("display", "none");
    $('#ShowMoreResultsText').css("display", "initial");
}


// REQUEST A QUOTE

function requestAQuoteForm(id) {
    $(".htxtAccountId").val(id);
    populateAdviserDetailsInRAQForm();
    showRAQForm();
    setTimeout(function () { $(".txtFirstName").focus(); }, 500);
}

function populateAdviserDetailsInRAQForm() {
    var id = $(".htxtAccountId").val();
    var adviserDetails = buildAdviserInformation(adviserArray[id], "raq");
    $("#raq_box").html(adviserDetails);
    $("#disclaimer_adviser_name").html(adviserArray[id]["Name"]);
}

// SMOOTH SCROLL TO ELEMENT taken from main.js duped because not revealed to this scope, bw 20140328
function smoothScrollTo(selector,additional) {

	var offset = typeof(selector) === 'object' ? selector.offset() : $(selector+':first').offset();
	$('body').addClass('smoothScrolling');
	$('html,body').animate({
		scrollTop: offset.top+additional
		}, 1000);
	//$(window).trigger('scroll');
	$('body').removeClass('smoothScrolling');
}
	

function showRAQForm() {
    if (getCurrentBootstrapSize() == 'xs') {
        $('#raq_form_modal').addClass('raq-form-show');
        $('#raq_form_modal').css('display', 'block');
		smoothScrollTo('.raq-form-show',0);
	}
    else {
        $('#raq_form_modal').modal({
            show: false,
            backdrop: true,
            keyboard: true
        });
        $('#raq_form_modal').modal('show');
    }
}

function closeRAQForm() {
    if (getCurrentBootstrapSize() == 'xs') {
        $('#raq_form_modal').removeClass('raq-form-show');
    }
    else { $('#raq_form_modal').modal('hide'); }
}

function showRAQConfirmation() {
    closeRAQForm();

    var id = $('.htxtAccountId').val();
    var json = $('.htxtQuoteRequestJSON').val();
    var quoteResponse = jQuery.parseJSON(json);
    var submissionStatus = $('.htxtQuoteRequestStatus').val();

    if (submissionStatus == "True")
        $('#raq_confirmation_text').html('Thanks for your enquiry, <span class="adviser_name">' + adviserArray[id]["Name"] + '</span> will be in contact soon.');
    else
        $('#raq_confirmation_text').html('The quote request could not be submitted. Please try again later.');

    $('.htxtQuoteRequestStatus').val(null);

    if (getCurrentBootstrapSize() == 'xs') {
        $('#raq_confirmation_modal').addClass('raq-confirmation-show');
    }
    else { $('#raq_confirmation_modal').modal('show'); }
}

function closeRAQConfirmation() {
    if (getCurrentBootstrapSize() == 'xs') {
        $('#raq_confirmation_modal').removeClass('raq-confirmation-show');
        clearCurrentAdviser();
    }
    else {
        $('#raq_confirmation_modal').modal('hide');
        if (currentInfoBox != null)
            currentInfoBox.close();
        clearCurrentAdviser();
    }
}


function validateRequiredText(source, args) {
    var control = $("#" + source.controltovalidate);
    var is_valid = true;
    var reqText = control.val().trim();
    var maxLength = control.attr("maxlength");

    if (reqText == "")
        is_valid = false;

    if (maxLength != undefined && reqText.length > maxLength)
        is_valid = false;

    if (is_valid) {
        control.addClass("txtInput");
        control.removeClass("txtInputInvalid");
    }
    else {
        control.addClass("txtInputInvalid");
        control.removeClass("txtInput");
    }
    args.IsValid = is_valid;
}

function validateEmailAddress(source, args) {
    var control = $("#" + source.controltovalidate);
    var is_valid = true;
    var email = control.val().trim();
    var maxLength = control.attr("maxlength");

    if (email == "")
        is_valid = false;

    if (maxLength != undefined && email.length > maxLength)
        is_valid = false;

    if (is_valid == true) {
        //var regularExpression = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        var regularExpression = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
        is_valid = regularExpression.test(email);
    }

    if (is_valid) {
        control.addClass("txtInput");
        control.removeClass("txtInputInvalid");
    }
    else {
        control.addClass("txtInputInvalid");
        control.removeClass("txtInput");
    }

    args.IsValid = is_valid;
}


// FED Javascript for FAA

var adviserTypeSelected = false;

function fedDocumentReadyEventsAndFunctions() {

    /* Close product question dropdown when clicking outside it */
    $('body').on('click', function (e) {
        if (!$('.find-an-adviser-app-form .adviser-product-dropdown').hasClass('open')) return;
        if ($(this).hasClass('.adviser-product-dropdown') || $(this).closest('.adviser-product-dropdown').length) return false;
        if (adviserTypeSelected == true)
            adviserTypeSelected = false;
        else
            $('.adviser-product-dropdown').removeClass('open');
    });

    // Update the adviser-type (Insurance Type) active class
    $('label.adviser-type input').on('click change', function () {
        adviserTypeSelected = true;
        var $formUsed = $(this).closest('.find-an-adviser-form');
        $('label.adviser-type').removeClass('active');
        $(this).closest('label.adviser-type').addClass('active');
        $('body').trigger('faa_insurance_type_selected');

        // Update the class on the Product Type
        $('input.adviser-product').val('');
        $('.adviser-product-dropdown').removeClass('personal').removeClass('commercial').removeClass('rural').addClass($(this).val());

        // Open the Product Type dropdown
        $('.adviser-product-dropdown', $formUsed).addClass('open');
    });

    if ($('.find-an-adviser-landing, .find-an-adviser-container').length > 0) {
        // Size the .find-an-adviser-landing panel to fill browser window
        if (getCurrentBootstrapSize() != 'xs') {
            var contentViewportHeight = $(window).height();
            if (contentViewportHeight < 800) contentViewportHeight = 800;
            $('header.find-an-adviser-landing').css('minHeight', contentViewportHeight);
            $('header.find-an-adviser-container').css('minHeight', contentViewportHeight);
        }

    }

    // Open the product type options
    $('.adviser-product-open-options, input.adviser-product').on('click', function (e) {
        var $dropdown = $('.adviser-product-dropdown');
        if ($dropdown.hasClass('open')) {
            $('.adviser-product-dropdown').removeClass('open');
            e.stopImmediatePropagation();
        } else {
            $('.adviser-product-dropdown').addClass('open');
            e.stopImmediatePropagation();
        }
    });

    // Add a div to capture clicks on disabled fields
    $('.find-an-adviser-form .disabled').append('<div class="disable-capture"></div>');

    // Change the field upon selection of a product type in the dropdown
    $('.adviser-product-dropdown li').on('click', function () {
        var clickedValue = $(this).data('value');
        $(this).closest('ul').find('li').removeClass('selected');
        $(this).addClass('selected');
        $('input.adviser-product').val(clickedValue);
        $('.adviser-product-dropdown').removeClass('open');
        $('body').trigger('faa_product_type_selected');
    });

    $('body').on('faa_insurance_type_selected', function (e) {
        if ($('.adviser-product').parents('.disabled').length > 0) {
            $('.adviser-product').parents('.disabled').removeClass('disabled');
            if (getCurrentBootstrapSize() == 'sm') {
                smoothScrollTo('.find-an-adviser-landing-form-row', -80);
            }
        }

        var $formParent = $('.find-an-adviser-form');
        populateWithAllProductsOption($formParent);
    });

    $('body').on('faa_product_type_selected', function () {

        if (getCurrentBootstrapSize() == 'xs') {
            console.log('product_type_selected');
            smoothScrollTo('#location_col', -45);
        }

        if ($('.adviser-location').parent().hasClass('disabled')) {
            var $al = $('.adviser-location')
            $al.parent('.disabled').removeClass('disabled');
            $al.focus();
        }

        var insuranceType = $('input[name=adviser-type]:checked', '#find_an_adviser_app_form').val();
        var product = $('#adviser_product').val();
        var location = $('#adviser_location').val().trim();

        // Required because Internet Explorer handles the placeholder text as a value
        if (product == $('#adviser_product').attr('placeholder'))
            product = "";

        if (location == $('#adviser_location').attr('placeholder'))
            location = "";

        if (insuranceType != "" && product != "" && location != "") {
            $('#btnLoad').trigger('click');
        }

        $('.site-nav #find-adviser').parent().addClass('pinned');
        setTimeout(function () {
            $('.site-nav #find-adviser').css('display', 'block');
            $('.site-nav #find-adviser').parent().removeClass('pinned');
        }, 250);
    });

    $('body').on('click', '.revise-search-location', function () {
        $('.adviser-location').focus();
    });

    // If insurance type already provided (via query string),
    // populate "Which products?" field with the right options
    if ($('input[type=radio][name=adviser-type]:checked').val()) {
        var preselected_product = $('input#adviser_product').val(); 
        $('.adviser-product-dropdown li').each(function () {
            if ($(this).data('value') == preselected_product) {
                if ($(this).closest('ul').hasClass('personal-products')) $(this).closest('.adviser-product-dropdown').addClass('personal');
                if ($(this).closest('ul').hasClass('commercial-products')) $(this).closest('.adviser-product-dropdown').addClass('commercial');
                if ($(this).closest('ul').hasClass('rural-products')) $(this).closest('.adviser-product-dropdown').addClass('rural');
                return;
            }
        });
    }

    // On Submit, if Product field is empty, populate with "All ... products"
    $('.find-an-adviser-form button.submit').on('click', function () {
        var $formParent = $(this).closest('.find-an-adviser-form');
        populateWithAllProductsOption($formParent);
    });

    function populateWithAllProductsOption($formParent) {
        if ($('input.adviser-product', $formParent).val() == '') {
            var kindOfInsurance = $('input[type=radio][name=adviser-type]:checked').val();
            kindOfInsuranceFormatted = kindOfInsurance.charAt(0).toUpperCase() + kindOfInsurance.substr(1).toLowerCase();
            var allProductsString = "All " + kindOfInsuranceFormatted + " Products";
            // Update the input
            $('input.adviser-product').val(allProductsString);
            // Update the li to selected
            $('.adviser-product-dropdown li').removeClass('selected');
            $('.adviser-product-dropdown li.all-' + kindOfInsurance + '-products').addClass('selected');
        }
    }

    var setFindAnAdviserAppHeight = function setFindAnAdviserAppHeight() {
        if ($('.find-an-adviser-app-panels').length > 0) {
            var screenSize = getCurrentBootstrapSize();
            if (screenSize != 'xs' && screenSize != 'sm') {
                var contentViewportHeight = $(window).height() - 295;
                $('.find-an-adviser-app-panels').css('height', contentViewportHeight);
            } else {
                $('.find-an-adviser-app-panels').css('height', 'auto');
            }
        }
    }

    $(window).on('resize', setFindAnAdviserAppHeight);
    setFindAnAdviserAppHeight();

    // Dynamically add "Use My Location"-style button
    if ($('html').hasClass('geolocation') && $('.find-an-adviser-app-form').length > 0) {
        $('.find-an-adviser-app-form .adviser-location').addClass('has-location-detection').after('<a href="#" class="faa-get-my-location" title="Use My Location" id="btnCurrentLocation"></a>');
    }
}






// FAA RESPONSIVE FUNCTIONS

function responsiveDocumentReadyEventsAndFunctions() {
    getCurrentBootstrapSize();
    addBootstrapSize();
    handleResize();
    $('body').on('bsResize', function () { handleResize(); });
}


// TRIGGER AN EVENT WHEN SHIFTING BETWEEN BREAKPOINTS
$(window).on('resize', function () {
    var previousSize = $('html').attr('data-bs-size');
    var newSize = getCurrentBootstrapSize();
    var triggerName = '';
    if (previousSize != newSize) {
        var triggerName = 'bsResizeTo' + newSize;
        $('body').trigger('bsResize').trigger(triggerName);
    }
    addBootstrapSize();
});

function getCurrentBootstrapSize() {
    var wwidth = $(window).width();
    if (wwidth >= 1200) {
        return 'lg';
    } else if (wwidth >= 992) {
        return 'md';
    } else if (wwidth >= 768) {
        return 'sm';
    } else {
        return 'xs';
    }
}

// ADD BOOTSTRAP SIZE TO HTML ELEMENT
function addBootstrapSize() {
    var bootstrapSize = getCurrentBootstrapSize();
    $('html').attr('data-bs-size', bootstrapSize);
}


function handleResize() {
    if (getCurrentBootstrapSize() == 'xs') {
        $('#raq_form_modal').addClass('raq-form-mobile');
        $('#raq_confirmation_modal').addClass('raq-confirmation-mobile');
    }
    else {
        $('#raq_form_modal').removeClass('raq-form-mobile');
        $('#raq_form_modal').css('display', 'none');
        $('#raq_confirmation_modal').removeClass('raq-confirmation-mobile');
    }
}