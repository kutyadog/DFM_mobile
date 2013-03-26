



function addAdToDiv( xSize, xDiv ) {
	//alert( xSize+":"+ xDiv );
	var xString;
	if ( xSize == '300x50') {
		xString = '<img src="ad_300x50.gif" width="300" height="50" style="display:block;margin:auto;" />';
	} else if ( xSize == '300x250') {
		xString = '<img src="ad_300x250.gif" width="300" height="250" style="display:block;margin:auto;" />';
	} else {
		alert( 'wrong ad size: '+ xSize );
		return;
	}
	
	document.getElementById( xDiv ).innerHTML = xString;
}

function clickNewSection( xnum ) {
	//called when a user clicks a new section in the sections window
	var xBackWindow = xInterface.currentWindow.backToWindowObject.id;
	
	//do i need to add a 'whendoneDoThisOnce' option on closeActiveWindow?
	
	
	
	if ( xBackWindow != 'home' ) {
		xInterface.putLoaderInWindow( xBackWindow );
		
		xInterface.closeActiveWindow(  { runOnceWhenDoneClosing: function () {
			//alert('closeActiveWindow: '+ xBackWindow);
			
			
			setTimeout(function() { xInterface.showWindow( 'home' ); xInterface.removeLoaderInWindow( xBackWindow ); }, 200);
			//alert('closeActiveWindow: '+ xBackWindow);
		} } );
		
		//xInterface.showWindow( 'home', {transition: 'fade'} );
		//xInterface.showLoadingScreenFull();
		//setTimeout(function() { xInterface.showWindow( 'home', {transition: 'fade'} ); }, 2000);
		//setTimeout(function() { xInterface.showLoadingScreenFull(); }, 2000);
	} else {
		//alert( 'boom');
		xInterface.putLoaderInWindow( 'home' );
		xInterface.closeActiveWindow();
		
	}
	
	//xInterface.closeActiveWindow();
	//alert( xnum);
	activeSection = xnum;
	setTimeout(function() { loadNewSection(); }, 10);
}

function loadNewSection() {
	xURL = 'denverfeed.php?x='+ xFeedList[activeSection].url;
	//console.debug( 'loadNewSection: '+ xURL);
	request(
		xURL, null,function() {
			if ( this.readyState == 4) {
				var xdata = this.responseText;
				if ( xdata == '' ) {
					//alert( 'Error loading URL!' );
				} else {
					//ok we have loaded the luck data, now we convert they JSON into a javascript array and then do something with it
					//alert( xdata.length );	//before decompression
					xdata = JXG.decompress(xdata);
					//alert( xdata.length );	//after decompression
					//alert( xdata );
					StoryList = eval ("(" + xdata + ")");
					DrawStoryList();
					setTimeout(function() { xInterface.removeLoaderInWindow('home'); }, 500);
				}
			}
		}, 'GET'
	);
}

function getStoryIdFromURL( xURL ) {
	//xURL = 'http://www.elpasotimes.com/newupdated/ci_22867699/border-agents-seize-3-5-tons-marijuana-southern?source=most_viewed';
	var ID = xURL.split('/ci_');
	if ( ID.length > 1 ) {
		ID = ID[1].split('/');ID = ID[0];
	} else {
		ID = 0;
	}
	return ID;
}

function clickStory( xnum ) {
	viewStory(xnum);
}

function DrawStoryList() {
	//console.debug( 'DrawStoryList: ');
	var xString = '';//<div class="scroller">';
	xString +=	'<div class="list_header " style="">'+ xFeedList[activeSection].title +'</div>';
	xString +=	'<ul class="list Xul">';
	for (var i=0; i<StoryList.length;i++) {
		xString +=	'	<li class="Xli" onclick="clickStory('+ i +');" style="">';
		xString +=	'		<div class="story_title">'+ StoryList[i].title +'</div>';
		xString +=	'		<div class="" style="font: bold 12px/12px Helvetica, Sans-serif;color:#464646;margin-top:-4px;width:100%;">'+ StoryList[i].pubDate +'</div>';
		xString +=	'	</li>';
	}
	
	xString +=	'</ul>';
	//xString +=	'</div>';
	xString +=	'	<div style="background-color:none;"><img src="dfm_logo.png" style="max-width:100px;display:block;margin:auto;margin-top:12px;margin-bottom:5px;" />';
	
	var d = new Date().getUTCFullYear();
	xString +=	'		<div style="display: block;margin: 0px auto;width:90%;color:white;font-family:Arial;font-size:10px;color:#FFF;text-align:center;line-height:100%;padding-bottom:20px;">';
	xString +=	'		All contents © '+ d +' Digital First Media or other copyright holders. All rights reserved. This material may not be published, broadcast, rewritten or redistributed for any commercial purpose.</div>';
	
	xString +=	'</div>';
	
	document.getElementById( 'home_section_list' ).innerHTML = xString;
	
	if ( xInterface.doesWindowExist( 'home' ) ) {
		console.debug( 'it exists!: ');
		setTimeout(function() { xInterface.resizeScrollers(); }, 10);
		//setTimeout(function() { xInterface.refreshWindow('home'); }, 10);
	} else {
		console.debug( 'create new: ');
		setTimeout(function() { xInterface.showWindow( 'home', {transition: 'fade'} ); }, 1000);
	}
	
	//need to scroll to the top just in case user has already scrolled down on a previous story list
	//xInterface.WindowScrollerArray[0].scrollTo(0,0,0);
}



function dumpProps(obj, parent) {
   // Go through all the properties of the passed-in object
   for (var i in obj) {
      // if a parent (2nd parameter) was passed in, then use that to
      // build the message. Message includes i (the object's property name)
      // then the object's property value on a new line
      if (parent) { var msg = parent + "." + i + "\n" + obj[i]; } else { var msg = i + "\n" + obj[i]; }
      // Display the message. If the user clicks "OK", then continue. If they
      // click "CANCEL" then quit this level of recursion
      //if (!confirm(msg)) { return; }
		console.debug( msg );
      // If this property (i) is an object, then recursively process the object
      if (typeof obj[i] == "object") {
         if (parent) { dumpProps(obj[i], parent + "." + i); } else { dumpProps(obj[i], i); }
      }
   }
}

function showSectionsWindow() {
	xInterface.showWindow( 'sections_window', { transition: 'slideRight', overlay:1,
	onSwipeLeft: function () {
		xInterface.closeActiveWindow();
	}
	 });
}

function viewStory(xnum) {
	if ( xInterface.allowUserEvent() ) {
		activeStory = xnum;

		//document.getElementById( 'story_title' ).innerHTML = xFeedList[activeSection].title;

		//----------------create story page!!!
		/*
		denver.html:135@attributes.url
		denver.html:135@attributes.fileSize
		denver.html:135@attributes.type
		*/

		//dumpProps( StoryList[ activeStory ].media );
		
		//----------------------------------------------build story view div string
		var xString = '';
		var xURL = 0;
		if ( StoryList[ activeStory ].media['@attributes'] ) {
			xURL = StoryList[ activeStory ].media['@attributes'].url;
		}
		
		//xString += '<img src="ad_300x50.gif" width="300" height="50" style="display:block;margin:auto;" />';
		//xString += '<div class="story_top_ad"><script> alert(1); <\/script></div>';	//did not work
		
		/*
		xString += '<div class="toolbar movable">';
		xString += '	<div class="sm_but_icon leftarrowb left"  onclick="xInterface.closeActiveWindow();"></div>';
		xString += '	<div class="sm_but_icon shareb " onclick="xInterface.showWindow( \'sections_window\', { transition: \'slideRight\', overlay:1 });"></div>';
		xString += '</div>';
		*/
		
		//------------------------------------------------------toolbar
		xString += '<div class="toolbar movable white">';
		xString += '	<div class="sm_but_icon section_sm_w left" onclick="showSectionsWindow();"></div>';
		xString += '	<div class="sm_but_icon closeb "  onclick="xInterface.closeActiveWindow();"></div>';
		xString += '<h1><img src="images/denverpost/denver_logo_b.png" width="200" alt="Denver Logo" style="margin-top:5px;margin-left:-5px;"/></h1></div>';
		
		//http://blog.stevenlevithan.com/archives/faster-than-innerhtml
		//http://ejohn.org/blog/javascript-micro-templating/
		
		//xString += '<div id="story_content" style="margin:0px 0px 0px 0px;">';
		
		//xString += '<div class="story_breadCrumbs side_margin"  style="" onclick="xInterface.closeActiveWindow();"> View Section Front</div>';
		
		xString += '<div id="story_ad_top" style="height:50px;margin-top:20px;"></div>';
		xString += '<div class="story_breadCrumbs side_margin"><span class="fakelink" onclick="clickNewSection(1);">Home</span> / <span class="fakelink" onclick="clickNewSection(1);">News</span> / Story</div>';
		
		xString += '<div class="story_headline side_margin">'+StoryList[ activeStory ].title +'</div>';
		
		if ( xURL ) xString += '<div class="side_margin"><img src="'+ xURL +'" style="width:100%;display:block;margin:auto;" /></div>';
        
		if ( xURL ) console.debug(xURL );
		xString += '<div class="story_pubdate side_margin">PUBLISHED '+ StoryList[ activeStory ].pubDate.toUpperCase() +'</div>';
		xString += '<div class="story_update side_margin">UPDATED '+StoryList[ activeStory ].lastUpdate[0].toUpperCase() +'</div>';
		xString += '<div class="story_author side_margin">By Kirk Mitchell, The Denver Post</div>';
		xString += '<div class="story_content side_margin">'+StoryList[ activeStory ].description +'</div>';
		
		xString += '<div id="story_related_content side_margin" style="margin-bottom:40px;">';
			xString += '<div class="story_author">Related stories:</div>';
		
			for (var i=0; i<3;i++) {
				xString += '<li onclick="openStoryFromStory('+i+');">'+ StoryList[ i ].title +'</li>';
			}
		xString += '</div>';
		
		xString += '<div id="story_ad_bottom" style="height:50px;"></div>';
		
		xString += '<div class="ng-recommender" id="ng-recommender" style="height:350px;width:100%;display:block;padding:0px;margin-top:10px;"></div>';
		
		//xString += '</div>';
		//----------------------------------------------build story view div string (end)
		
		document.getElementById( 'story_container' ).innerHTML = xString;
		
		//---now that the divs are there, we need to dynamically add the ads
		setTimeout(function() { 
			addAdToDiv( '300x50', 'story_ad_top' );
			addAdToDiv( '300x50', 'story_ad_bottom' );
			newsToGram();
		}, 1000);
		
		if ( xURL ) {
			//-------there is an image, so create listener to resize 'story_window' after image is loaded (since we dont know its size ahead of time)
			xInterface.putLoaderInWindow( 'story_window' );
			preloadimages([ xURL ]).done(function(images){
				console.debug('story image loaded' );
				//when images are done loading:
				xInterface.removeLoaderInWindow('story_window');
				setTimeout(function() { xInterface.resizeScrollers(); }, 100);
				//xInterface.resizeScrollers();
				/*
				setTimeout(function() { 
					xInterface.removeLoaderInWindow('story_window');
					xInterface.resizeScrollers();
				}, 100);
				*/
			})

		} else {
			//-------no images, just a story
			setTimeout(function() { xInterface.resizeScrollers(); }, 10);

		}


		xInterface.showWindow( 'story_window', {
			onCloseDone: function () {
				//alert('onCloseDone function called!');
				console.debug('------dfm_mobile: onCloseDone for story_window' );
				this.WindowScrollerArray[0].scrollTo(0,0,0);
			},
			onSwipeLeft: function () {
				//alert('onSwipeLeft');
				console.log( 'onSwipeLeft' );
			},
			onTouchTap: function () {
				//alert('onTouchTap');
				console.log( 'onTouchTap' );
			}
		} );
		
		////
		//setTimeout(function() { xInterface.resizeScrollers(); }, 10);

		/*
		if ( xInterface.doesWindowExist( 'story_window' ) ) {
			console.debug( 'it exists!: ');


		} else {
			console.debug( 'create new: ');

		}
		*/


		/*
		<div class="content belowtoolbar " style="background: url( 'http://ca1media.mobi/content/tools/images/paper_pattern.gif');color:#333;">
			<div id="story_container" class="scroller "></div>
		</div>
		<div id="story_container" class="content belowtoolbar " style="background: url( 'http://ca1media.mobi/content/tools/images/paper_pattern.gif');color:#333;"></div>
		*/
	}
}

function newsToGram() {
	//http://sandbox.dailyme.com/rmv2/docs/recommender-3.html
	var ngRec = new Newstogram.recommender({
		adPosition: 'right',
		apiKey: 'dailymedemo',
		source:'dailyme',
		filter:'2',
		headlinesRotation:true,
		customParams:'source=dailyme',
		cssUrl: 'http://sandbox.dailyme.com/rmv2/css/recommender.css',
		limit: 6,
		maxWidth: 400
		});
	ngRec.init();
}

function openStoryFromStory(xnum) {
	//user is reading a story and clicks to view another story
	//console.debug('------dfm_mobile: onCloseDone for story_window' );
	var xBackWindowId = xInterface.currentWindow.backToWindowObject.id;
	
	if ( xBackWindowId ) {
		xInterface.putLoaderInWindow( xBackWindowId );
		xInterface.closeActiveWindow();
		setTimeout(function() { 
			xInterface.currentWindow.WindowScrollerArray[0].scrollTo(0,0,0);
			viewStory(xnum);
			setTimeout(function() {
				xInterface.removeLoaderInWindow(xBackWindowId);		//should this eventually be automatically removed in viewStory ?
			}, 1000);
			
		}, 1000);
	} else {
		
	}
	
	
	
	//xInterface.closeActiveWindow();
	
}

function loadPropertyData() {
	//----Eventually I will pull each properties data from the server
	//		So, for example, this property (denver) would call to server passing unique property id
	//		The server would then send back a JSON array with all the properties data,
	//		including property title, activeSection and an array of all the sections and their corresponding feeds (below)
	
	
	
	xFeedList = new Array(
			{ 'title' : 'Business', 'url' : 'http://extras.denverpost.com/media/MRSS/Business_230614.xml' },
			{ 'title' : 'Breaking News', 'url' : 'http://extras.denverpost.com/media/MRSS/Breaking_News_230605.xml' },
			{ 'title' : 'Broncos', 'url' : 'http://extras.denverpost.com/media/MRSS/Broncos_230613.xml' },
			{ 'title' : 'Sports', 'url' : 'http://extras.denverpost.com/media/MRSS/Breaking_Sports_247701.xml' },
			{ 'title' : 'Entertainment', 'url' : 'http://extras.denverpost.com/media/MRSS/Entertainment_230611.xml' },
			{ 'title' : 'Featured', 'url' : 'http://extras.denverpost.com/media/mRSS/Featured_237705.xml' },
			{ 'title' : 'Nuggets', 'url' : 'http://extras.denverpost.com/media/MRSS/Nuggets_230616.xml' },
			{ 'title' : 'Nation / World', 'url' : 'http://extras.denverpost.com/media/MRSS/Nation_World_230615.xml' },
			{ 'title' : 'Lifestyle', 'url' : 'http://extras.denverpost.com/media/MRSS/Lifestyle_230610.xml' },
			{ 'title' : 'Opinion', 'url' : 'http://extras.denverpost.com/media/MRSS/Opinion_230609.xml' },
			{ 'title' : 'Politics', 'url' : 'http://extras.denverpost.com/media/MRSS/Politics_230620.xml' },
			{ 'title' : 'Preps', 'url' : 'http://extras.denverpost.com/media/MRSS/Prep_Main_245424.xml' },
			{ 'title' : 'Rockies', 'url' : 'http://extras.denverpost.com/media/MRSS/Rockies_230619.xml' }
		);
	
	//alert( xFeedList[0].title );
	//alert( xFeedList[0].url );
	
	propertyTitle = 'The Denver Post';
	activeSection = 1;		//breaking news
	propertyImage = 'denverpostsplash.gif';
	backgroundsplash = '0079c2';				//el paso 'f2f8fe'
	
	AppleAppID = "375264133";
	topDomain = get_top_domain();
	if (topDomain == 'localhost') topDomain = 'denverpost.com';	//added only for dev, delete before live
}

function renderSectionsWindow() {
	console.debug( 'renderSectionsWindow: ');
	var xString = '<div class="list_header ">'+ propertyTitle +':</div>';
	xString += '<ul class="list " >';
	for (var i=0; i<xFeedList.length;i++) {
		xString += '<li  class="Xli" onclick="clickNewSection('+i+');">'+ xFeedList[i].title +'</li>';
	}
	xString +=	'</ul>';
	xString +=	'</div>';
	
	document.getElementById( 'sections_container' ).innerHTML = xString;
}


//showPhotoGallery();

function showPhotoGallery() {
	//render the contents for a gallery and put it in gallery_window div
	var xHeadline = 'Celebrations marking Nowruz the Persian new year';
	var xDescription = 'Photos of Nowruz festivals celebrating the Persian new year in Turkey, Central Asian republics, Iraq, Iran, Azerbaijan and war-torn Afghanistan coinciding with the astronomical vernal equinox. Nowruz is calculated according to a solar calendar, this year marking 1392.';
	var photoArray = new Array( 'http://mediacenter.smugmug.com/photos/i-VBJ7cBb/1/480x480/i-VBJ7cBb-480x480.jpg','http://mediacenter.smugmug.com/photos/i-bDnNStp/1/480x480/i-bDnNStp-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-5b7kskC/1/480x480/i-5b7kskC-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-PKHmZkh/1/480x480/i-PKHmZkh-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-3VkCthh/1/480x480/i-3VkCthh-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-mFMJBws/1/480x480/i-mFMJBws-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-s6XKRZk/1/480x480/i-s6XKRZk-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-4dZ8KpS/1/480x480/i-4dZ8KpS-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-wn5BrMx/1/480x480/i-wn5BrMx-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-s2wJXtx/1/480x480/i-s2wJXtx-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-k8DSbVx/1/480x480/i-k8DSbVx-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-rLdWf9G/1/480x480/i-rLdWf9G-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-G68BMQx/1/480x480/i-G68BMQx-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-J2KSmDh/1/480x480/i-J2KSmDh-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-7sHXcfq/1/480x480/i-7sHXcfq-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-c9TK8Tc/1/480x480/i-c9TK8Tc-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-8Lm5bwB/1/480x480/i-8Lm5bwB-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-rNQ9LDv/1/480x480/i-rNQ9LDv-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-PbSB6Wc/1/480x480/i-PbSB6Wc-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-9BRnxWT/1/480x480/i-9BRnxWT-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-Rpxd5BT/1/480x480/i-Rpxd5BT-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-LDhLXKH/1/480x480/i-LDhLXKH-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-Gk3kG9n/1/480x480/i-Gk3kG9n-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-6hmXdDq/1/480x480/i-6hmXdDq-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-VNBxgLs/1/480x480/i-VNBxgLs-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-6PC5JQ2/1/480x480/i-6PC5JQ2-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-BMpqcBC/1/480x480/i-BMpqcBC-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-bbBwb3C/1/480x480/i-bbBwb3C-480x480.jpg', 'http://mediacenter.smugmug.com/photos/i-CJJ54kx/1/480x480/i-CJJ54kx-480x480.jpg' );
	var captionArray = new Array( 'caption_1', 'caption_2', 'caption_3', 'caption_4', 'caption_5', 'caption_6', 'caption_7', 'caption_8' );
	
	if ( xInterface.allowUserEvent() ) {
		//----------------------------------------------build gallery string
		var xString = '';
		xString += '<div class="content " style="background-color:#GGG;">';
		xString += '	<div class="carousel "><!-- /scroller width will have to be set by javascript-->';
		xString += '		<ul class="list" style=""><!-- /thelist -->';
		
		for (var i=0; i<photoArray.length;i++) {
			xString += '<li class="Xli" id="photoframe_'+ (i+1) +'" style="position:relative;" ontouchstart="xActiveTouch = 1;" ontouchmove="xActiveTouch = 0;" ontouchend="if (xActiveTouch) { xGallery.toggleTopLayer(); }">		<div class="gallery_bigImage" style="background-image:url('+ photoArray[i] +');background-size: contain;"></div>	</li>';
		}
		xString += '</ul></div></div>';
		//----------------------------------------------build gallery string (end)
		
		document.getElementById( 'gallery_window' ).innerHTML = xString;
		
		/*
		// eventually here i will add ads to the galleries
		//---now that the divs are there, we need to dynamically add the ads
		setTimeout(function() { 
			addAdToDiv( '300x50', 'story_ad_top' );
			addAdToDiv( '300x50', 'story_ad_bottom' );
			newsToGram();
		}, 1000);
		*/
		
		//setTimeout(function() { xInterface.resizeScrollers(); }, 10);
		
		/*
		xInterface.showWindow( 'gallery_window', {
			onCloseDone: function () {
				//alert('onCloseDone function called!');
				console.debug('------dfm_mobile: onCloseDone for gallery_window from showPhotoGallery' );
				this.WindowScrollerArray[0].scrollTo(0,0,0);
			}
		} );
		*/
		
		if ( xInterface.doesWindowExist( 'gallery_window' ) ) {
			//console.debug( 'it exists!: ');
			setTimeout(function() { xInterface.resizeScrollers(); }, 10);
			//setTimeout(function() { xInterface.refreshWindow('home'); }, 10);
		} else {
			//console.debug( 'create new: ');
			setTimeout(function() { xInterface.showWindow( 'gallery_window', { transition: 'fade', overlay:1 }); }, 100);
		}
		
		
	}
}

function loadArticleWithID( xID ) {
	var xURL = topDomain + '/mngi/servletDispatch/JsonArticleServlet.dyn?ci=' + xID;
	//http://www.denverpost.com/mngi/servletDispatch/JsonArticleServlet.dyn?ci=22872574
	return xURL;
	//alert( xURL );
}

function get_top_domain(){
	var i,h,
	weird_cookie='weird_get_top_level_domain=cookie',
	hostname = document.location.hostname.split('.');
	for(i=hostname.length-1; i>=0; i--) {
		h = hostname.slice(i).join('.');
		document.cookie = weird_cookie + ';domain=.' + h + ';';
		if(document.cookie.indexOf(weird_cookie)>-1){
			document.cookie = weird_cookie.split('=')[0] + '=;domain=.' + h + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			return h;
		}
	}
}




