function PlaceRefresh(googleMap , googlePlace){
    
    // _places contain all places in present view
    var _places = [];

    // callback function after search places of the view
    var _callbackPlaces;

    // callback function after detial search of a place
    var _callbackDetail;

    var _keywordSearchBox;

    var _callbackCenterControl;

    var _category;
    // set _catagory value
    this.setCategory = function (c) {
      _category = c;
    }
    // _callbackPlaces function will be call whenever view of places are updated
    this.onUpdatePlaces = function (callback) {
      _callbackPlaces = callback;
    }

    this.onCenterControl = function(callback) {
      _callbackCenterControl = callback;
    }

    // _callbackDetial function will be call whenever the detial of place are searched
    this.onAddPlaceDetial = function(place , callback) {
        /*
      if(place.google_id !== undefined) {
        googlePlace.getDetails({"placeId":place.google_id} , function(results , status){
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            console.log(status);
            return;
          }
          var centerControlDiv = document.createElement('div');
          var centerControl = new _callbackCenterControl(centerControlDiv, map, results);
          centerControlDiv.index = 1;
          map.controls[google.maps.ControlPosition.RIGHT_CENTER].clear();
          map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(centerControlDiv);
        });
      }*/
      /*else if(place.yelp_id !== undefined)*/ {
        var auth = {
            //
            // Update with your auth tokens.
            //
            consumerKey : "zcFe3Df0yANPHyQqtEmI3A",
            consumerSecret : "36cVufkE-cV773wtr53r-Rp4M6M",
            accessToken : "jaRJXs3rPFSvTj-Kx9LmxoOH6NpSExx1",
            // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
            // You wouldn't actually want to expose your access token secret like this in a real application.
            accessTokenSecret : "PqjD7maq0L6q22Wqd-jIM-YOzJw",
            serviceProvider : {
                signatureMethod : "HMAC-SHA1"
            }
        };

        var accessor = {
            consumerSecret : auth.consumerSecret,
            tokenSecret : auth.accessTokenSecret
        };
        parameters = [];
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

        var message = {
            'action' : 'http://api.yelp.com/v2/business/' + encodeURIComponent(place.info.id),
            'method' : 'GET',
            'parameters' : parameters
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        //console.log(parameterMap);

        $.ajax({
            'url' : message.action,
            'data' : parameterMap,
            'dataType' : 'jsonp',
            'cache': true,
            'jsonpCallback' : 'cb',
            'success' : function(data, textStats, XMLHttpRequest) {
                console.log(data);
                var centerControlDiv = document.createElement('div');
                var centerControl = new _callbackCenterControl(centerControlDiv, map, data);
                centerControlDiv.index = 1;
                map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
                map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
            }
        });
        
      }
    }

    this.googleNearbySearch = function(tag) {
      var places = [];
      if (tag === undefined)
          tag = ['restaurant'];
      var request = {
        bounds: googleMap.getBounds(),
        types: ['parking']
      };

      if(_keywordSearchBox !== undefined && _keywordSearchBox.value !== "")
          request.keyword = _keywordSearchBox.value;

      googlePlace.nearbySearch(request, function (results) {
          for (var i in results) {
            var newPlace = {
              google_id : results[i].place_id,
              lng : results[i].geometry.location.lng(),
              lat : results[i].geometry.location.lat(),
              rating : results[i].rating,
              info : results[i]
            };
            places.push(newPlace);
          }
          oldPlaceIdx = [];
          _callbackPlaces(oldPlaceIdx , places , _places);
      });
    }

    this.nearbySearch = function (tag) {
        if (this.NEARBY_SEARCH == 'yelp')
            this.yelpNearbySearch(tag);
        else
            this.googleNearbySearch(tag);
    }

    // nearbySearch will search 20 places in the view
    this.yelpNearbySearch = function() {
        var auth = {
            //
            // Update with your auth tokens.
            //
            consumerKey : "zcFe3Df0yANPHyQqtEmI3A",
            consumerSecret : "36cVufkE-cV773wtr53r-Rp4M6M",
            accessToken : "jaRJXs3rPFSvTj-Kx9LmxoOH6NpSExx1",
            // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
            // You wouldn't actually want to expose your access token secret like this in a real application.
            accessTokenSecret : "PqjD7maq0L6q22Wqd-jIM-YOzJw",
            serviceProvider : {
                signatureMethod : "HMAC-SHA1"
            }
        };

        var terms = 'food';
        var bound = googleMap.getBounds();
        var sw = bound.getSouthWest();
        var ne = bound.getNorthEast();
        var bounds = sw.lat() + ',' + sw.lng() + '|' + ne.lat() + ',' + ne.lng();
        //console.log(bounds);

        var accessor = {
            consumerSecret : auth.consumerSecret,
            tokenSecret : auth.accessTokenSecret
        };
        parameters = [];
        parameters.push(['term', terms]);
        parameters.push(['category_filter', _category]);
        parameters.push(['bounds', bounds]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
        //console.log(parameters);
        var message = {
            'action' : 'http://api.yelp.com/v2/search',
            'method' : 'GET',
            'parameters' : parameters
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        //console.log(parameterMap);

        $.ajax({
            'url' : message.action,
            'data' : parameterMap,
            'dataType' : 'jsonp',
            'jsonpCallback' : 'cb',
            'cache': true,
            'success' : function(data, textStats, XMLHttpRequest) {
                //console.log(data);
                yelpUpdatePlace(data , textStats);
                }
        });
      /*
      */
    };

    // radarSearch will search 200 places in the view
    this.radarSearch = function(keyword) {
      var request = {
        bounds: googleMap.getBounds(),
        keyword: keyword
      };
      googlePlace.radarSearch(request, updatePlace);
    };

    this.setKeywordSearchBox = function (textBox) {
        _keywordSearchBox= textBox;
    };

    // after nearby/radarSearch, unpdatePlace will be call to update _places
    var yelpUpdatePlace = function(results , status){

	  var oldPlaceIdx = [];
      // add places
      var newPlaces = [];
      for (var i in results.businesses) {
        var newPlace = {
          yelp_id : results.businesses[i].id,
          lng : results.businesses[i].location.coordinate.latitude,
          lat : results.businesses[i].location.coordinate.longitude,
          rating : results.businesses[i].rating,
          info : results.businesses[i]
        };
        newPlaces.push(newPlace);
      }

      // callback function to update places
      _callbackPlaces(oldPlaceIdx , newPlaces , _places);
    };

    var detailSearch = function(place) {

      // search a place in queue
      googlePlace.getDetails({"placeId":place.place_id} , function(results , status){
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          console.log(status);
          return;
        }
        _callbackDetail(results);
      });
    };

    var findPlaceID = function(array , placeID){
      for(var i in array)
        if (array[i].place_id == placeID)
          return i;
      return -1;
    };
};
