



function addAdToDiv( xSize, xDiv ) {
	//alert( xSize+":"+ xDiv );
	var xString;
	if ( xSize == '300x50') {
		xString = '<img src="assets/ad_300x50.gif" width="300" height="50" style="display:block;margin:auto;" />';
	} else if ( xSize == '300x250') {
		xString = '<img src="assets/ad_300x250.gif" width="300" height="250" style="display:block;margin:auto;" />';
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
	xURL = 'temp/feed.php?x='+ xFeedList[activeSection].url;
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


function loadNgpsStoryContentByID( xID ) {
	console.debug( "loading NGPS story with id: "+ xID );
	//var xURL = 'jsonServLet.php?x=http://www.'+ topDomain + '/mngi/servletDispatch/JsonArticleServlet.dyn?ci=' + xID +'&includeBody=true;
	var xURL = 'temp/jsonServLet.php?x=' + xID;
	//http://www.denverpost.com/mngi/servletDispatch/JsonArticleServlet.dyn?ci=22872574
	//return xURL;
	//console.debug( xURL );
	
	//console.debug( 'loadNewSection: '+ xURL);
	request(
		xURL, null,function() {
			if ( this.readyState == 4) {
				var xdata = this.responseText;
				//console.debug( 'data loaded' );
				if ( xdata == '' ) {
					alert( 'Error loading URL!' );
				} else {
					//ok we have loaded the luck data, now we convert they JSON into a javascript array and then do something with it
					//alert( xdata );	//before decompression
					
					StoryContent = eval ("(" + xdata + ")");
					StoryContent = StoryContent['article'][0];
					viewStory();
					//console.debug( "item: "+ StoryList['article'][0]);
					
					/*
					xdata = JXG.decompress(xdata);
					//alert( xdata.length );	//after decompression
					//alert( xdata );
					StoryList = eval ("(" + xdata + ")");
					DrawStoryList();
					setTimeout(function() { xInterface.removeLoaderInWindow('home'); }, 500);
					*/
				}
			}
		}, 'GET'
	);
	
	//http://www.denverpost.com/mngi/servletDispatch/JsonArticleServlet.dyn?ci=22872574
	/*
	
	console.debug( "item: "+ StoryList['article'][0]['abstract']);
	
	{"article":[
		{"startDate":"Thu Mar 28 05:34:05 MDT 2013",
		"isExportable":true,"
		articleAssociations":{
			"articleAssociation":[
				{
					"type":"image",
					"data":{
						"associationCaption":"Latoya Nelson, 29, was arrested on suspicion of vehicular homicide/reckless driving and leaving the scene of an accident involving death.",
						"associationCredit":"Provided by the Denver Police Department",
						"associationURL":"http://extras.mnginteractive.com/live/media/site36/2013/0328/20130328__latoya-nelson~p1.jpg"
						},
						"priority":1,
						"id":"22890319"
						},
					{
					"type":"freeform",
					"data":{},
					"priority":2,
					"id":"22889184"
				}
				]
			},
		"previousRevision":50,
		"title":"Denver police name suspect, victim in fatal hit-and-run",
		"keepIndefinitely":"false",
		"byline":"<b>By Kieran Nicholson<\/b><br><i>The Denver Post<\/i>",
		"bodyEncoded":"<\/apxh:p>\n<apxh:p>&#160;Denver   police announced Thursday  they have arrested a woman suspected to be the driver in a fatal hit&#45;and&#45;run crash Wednesday at West 13th Avenue and Kalamath Street&#46; <\/apxh:p>\n<apxh:p>Latoya Nelson&#44; 29&#44; is scheduled to make an appearance in Denver Court on Thursday morning on suspicion of vehicular homicide&#47;reckless driving and leaving the scene of an accident involving death&#46; Members of her family gathered in the courtroom in advance of the hearing&#46; <\/apxh:p>\n<apxh:p>Police spokesman   Sonny Jackson previously said    a female driver  in a red Pontiac Grand Am was traveling south on Kalamath about 4&#58;30 p&#46;m&#46; Wednesday when she ran a red light and T&#45;boned a white sedan&#44; killing its elderly male driver&#46; A passenger stayed in the Grand Am&#44; but the driver got out and ran away from the scene&#46; <\/apxh:p>\n<apxh:p>Shortly before the crash Wednesday&#44; Jackson said&#44; the same female driver had backed into a parked car in the parking lot of the Burger King two blocks north at Kalamath and West Colfax Avenue&#46; When a security guard tried to stop her&#44; she almost ran him down&#44; then she sped south on Kalamath&#46; <\/apxh:p>\n<apxh:p>The deceased driver has been identified as Charlie Herrera&#44; 85&#44; of Denver&#46; <\/apxh:p>\n<apxh:p>Denver police traffic investigator Sgt&#46; Mike Farr said Nelson was taken into custody at 11 p&#46;m&#46; after a routine traffic stop&#46; A car was pulled over at 31st   and California streets&#44; and Nelson &#8212; who was in the car with someone else &#8212;  was identified as a wanted person&#46; <\/apxh:p>\n<apxh:p>Nelson has an  arrest history  in Colorado dating  to 2001&#44; according to Colorado Bureau of Investigation records&#46;   <\/apxh:p>\n<apxh:p>Most recently&#44; in February&#44; a failure to appear warrant was issued for Nelson in a misdemeanor police interference case from November 2012&#46;  <\/apxh:p>\n<apxh:p>In April 2012&#44; Nelson was arrested in Denver on a felony weapons offense and in October of 2011 she was arrested on suspicion of aggravated vehicle theft&#46;  ",
		"originatingSite":"36",
		"keyword":"Reference=82399390-979a-11e2-a9c2-7a75088f0193",
		"endDateISO8601":"2023-03-28T10:54:23-06:00",
		"slug":"BNCD28KALAMATH",
		"isShareable":true,
		"seoDescriptiveText":"http://www.denverpost.com/ci_22889442/denver-police-arrest-woman-who-fled-fatal-crash",
		"launchDateISO8601":"20130328T113635-0600",
		"body":"<p>&nbsp;Denver  <a href=\"https://twitter.com/DenverPolice/status/317232012941471744\" target=\"_top\">police announced Thursday<\/a> they have arrested a woman suspected to be the driver in a fatal hit-and-run crash Wednesday at West 13th Avenue and Kalamath Street.<\/p><p>Latoya Nelson, 29, is scheduled to make an appearance in Denver Court on Thursday morning on suspicion of vehicular homicide/reckless driving and leaving the scene of an accident involving death. Members of her family gathered in the courtroom in advance of the hearing.<\/p><p>Police spokesman  <a href=\"http://www.denverpost.com/breakingnews/ci_22885286/fatal-hit-and-run-reported-near-13th-and\" title=\"Driver flees after crash that kills man in Denver\" target=\"_blank\">Sonny Jackson previously said <\/a>  a female driver  in a red Pontiac Grand Am was traveling south on Kalamath about 4:30 p.m. Wednesday when she ran a red light and T-boned a white sedan, killing its elderly male driver. A passenger stayed in the Grand Am, but the driver got out and ran away from the scene.<\/p><p>Shortly before the crash Wednesday, Jackson said, the same female driver had backed into a parked car in the parking lot of the Burger King two blocks north at Kalamath and West Colfax Avenue. When a security guard tried to stop her, she almost ran him down, then she sped south on Kalamath.<\/p><p>The deceased driver has been identified as Charlie Herrera, 85, of Denver.<\/p><p>Denver police traffic investigator Sgt. Mike Farr said Nelson was taken into custody at 11 p.m. after a routine traffic stop. A car was pulled over at 31st   and California streets, and Nelson &mdash; who was in the car with someone else &mdash;  was identified as a wanted person.<\/p><p>Nelson has an  arrest history  in Colorado dating  to 2001, according to Colorado Bureau of Investigation records.  <\/p><p>Most recently, in February, a failure to appear warrant was issued for Nelson in a misdemeanor police interference case from November 2012. <\/p><p>In April 2012, Nelson was arrested in Denver on a felony weapons offense and in October of 2011 she was arrested on suspicion of aggravated vehicle theft. <\/p>",
		"blurb":"&nbsp;Denver  police announced Thursday they have arrested a woman suspected to be the driver in a fatal hit-and-run crash Wednesday at West 13th Avenue and Kalamath Street.",
		"headline":"Denver police name suspect, victim in fatal hit-and-run",
		"images":{
			"mediaCount":"3",
			"image":[
				{
					"width":"600",
					"height":"349",
					"credit":"Provided by The Denver Police Department",
					"url":"http://extras.mnginteractive.com/live/media/site36/2013/0328/20130328__kalamath-hit-run~p1.jpg",
					"caption":"An elderly man was killed in a wreck at W. 13th Avenue and Kalamath Street on Wednesday, March 27, 2013.",
					"filesize":"38405",
					"id":"30636745"
				},{
					"width":"600",
					"height":"349",
					"credit":"Provided by The Denver Police Department",
					"url":"http://extras.mnginteractive.com/live/media/site36/2013/0328/20130328__kalamath~p1.jpg",
					"caption":"Denver police made an arrest in a fatal crash on W. 13th Avenue and Kalamath Street that occurred Wednesday, March 27, 2013.",
					"filesize":"30358",
					"id":"30636637"
				},{
					"width":"480",
					"height":"600",
					"credit":"Provided by the Denver Police Department",
					"url":"http://extras.mnginteractive.com/live/media/site36/2013/0328/20130328__latoya-nelson~p1.jpg",
					"caption":"Latoya Nelson, 29, was arrested on suspicion of vehicular homicide/reckless driving and leaving the scene of an accident involving death.",
					"filesize":"26098",
					"id":"30638054"
				}
			]
		},
		"contentItemVersion":51,
		"dateLine":"03/28/2013",
		"dateId":"20130328",
		"firstPubDateISO8601":"2013-03-28T05:34:34-06:00",
		"isUpdate":"Y",
		"siteInformation":{
			"siteUrl":"http://www.denverpost.com",
			"logoURL":"",
			"siteId":"36",
			"siteProductionUrl":"www.denverpost.com",
			"siteProductionRssUrl":"rss.denverpost.com",
			"siteName":"The Denver Post"
		},
		"headlineEncoded":"Denver Police Name Suspect&#44; Victim in Fatal Hit&#45;and&#45;run","updateDate":"2013-03-28 11:36:00.696",
		"revision":51,
		"updateDateISO8601":"20130328T113600-0600",
		"createDateISO8601":"2013-03-28T05:34:04-06:00",
		"launchDate":"2013-03-28 11:36:35.515",
		"abstract":"&nbsp;Denver  police announced Thursday they have arrested a woman suspected to be the driver in a fatal hit-and-run crash Wednesday at West 13th Avenue and Kalamath Street.",
		"bylineEncoded":" By Kieran Nicholson   The Denver Post ",
		"sectionAnchor":"http://www.denverpost.com/breakingnews/ci_22889442",
		"daysToLive":"3651",
		"endDate":"Tue, 28 Mar 2023 10:54:23 MDT",
		"createDate":"Thu Mar 28 05:34:04 MDT 2013",
		"authorEmail":"knicholson@denverpost.com",
		"cId":"22889442"
		}
	]}
	
	*/
	

	
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


//---------------Eventually all code below should be moved to property specific prop.js in each props folder

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
	propertySplashImage = 'splash.gif';
	backgroundsplash = '0079c2';				//el paso 'f2f8fe'
	
	AppleAppID = "375264133";
	topDomain = get_top_domain();
	if (topDomain == 'localhost') topDomain = 'denverpost.com';	//added only for dev, delete before live
	
	/*
	//http://feeds.cal-one.net/rss_content/bayarea-ipad-columnists.xml
	//http://feeds.cal-one.net/rss_content/mercurynews-most-viewed.xml
	'feeds.cal-one.net/rss_content/ap-nation-world.xml',
	'feeds.cal-one.net/rss_content/ap-california.xml'
	$mercSections = array( 
		'feeds.cal-one.net/rss_content/mercurynews-breaking-news.xml', 
		'feeds.cal-one.net/rss_content/mercurynews-local-news.xml',
		'feeds.cal-one.net/rss_content/mercurynews-entertainment.xml',
		'feeds.cal-one.net/rss_content/mercurynews-sports.xml',
		'feeds.cal-one.net/rss_content/mercurynews-business.xml',
		'feeds.cal-one.net/rss_content/mercurynews-living.xml',
		'feeds.cal-one.net/rss_content/mercurynews-opinion.xml',
		'feeds.cal-one.net/rss_content/mercurynews-travel.xml'
		);
	
	/$xSource = 'http://iPhoneApp:!phon#c0ntNt@feeds.cal-one.net/rss_content/mercurynews-breaking-news.xml';
			$xSource = 'http://iPhoneApp:!phon#c0ntNt@' . $xURL;
			
	*/
		
}

//---------------Eventually all code below should be moved to property specific prop.js in each props folder (end)


function clickStory( xnum ) {
	//viewStory(xnum);
	//console.debug( "clicked story with id: "+ xnum + ', '+ getStoryIdFromURL( StoryList[xnum].link[0]) );
	
	/*
	var xString = '';
	//------------------------------------------------------toolbar created so that something is there while the page loads
	//-------NOTE THAT THE CODE BELOW IS NOT SET FOR THIS STYLE AND WILL CAUSE A RED FLASH!!!!!!!! FIX IT BEFORE MAKING IT LIVE AGAIN
	xString += '<div class="toolbar movable white">';
	xString += '	<div class="sm_but_icon section_sm_w left" onclick="showSectionsWindow();"></div>';
	xString += '	<div class="sm_but_icon closeb "  onclick="xInterface.closeActiveWindow();"></div>';
	xString += '<h1><img src="props/'+ topDomain +'/logo_b.png" width="200" alt="Logo" style="margin-top:5px;margin-left:-5px;"/></h1></div>';
	document.getElementById( 'story_container' ).innerHTML = xString;
	*/
	
	document.getElementById( 'story_container' ).innerHTML = '';
	
	//xInterface.putLoaderInWindow( 'story_window' );
	
	loadNgpsStoryContentByID( getStoryIdFromURL( StoryList[xnum].link[0]) );
	
	setTimeout(function() { xInterface.showWindow( 'story_window' ); }, 100);
	
	
	//calling xtory url works these two ways
	//var xStoryURL = StoryList[xnum].link;
	//console.debug( "story URL: "+ xStoryURL[0] );
	//or
	//console.debug( "story URL: "+ StoryList[xnum].link[0] );
	
	
}

function viewStory() {
	//if ( xInterface.allowUserEvent() ) {

		//dumpProps( StoryContent );
		
		//----------------------------------------------build story view div string
		var xString = '';
		var xURL = 0;
		
		/*
		if ( StoryList[ activeStory ].media['@attributes'] ) {
			xURL = StoryList[ activeStory ].media['@attributes'].url;
		}
		*/
		
		
		xString += '<div class="toolbar lightGray">';
		
		//xString += '<h1><img src="props/'+ topDomain +'/logo_b.png" width="200" alt="Logo" style="margin-top:5px;margin-left:-5px;"/></h1></div>';
		//.flag.dark {
		//	background: url('../assets/flag_dark.svg') no-repeat 50%;
		//}
		
		//xString += '	<div class="sm_but_icon section_sm_w left" onclick="xInterface.showWindow( \'sections_window\', { transition: \'slideRight\', overlay:1 });"></div>';
		// xString += '<a class="btn-navbar" onclick="xInterface.showWindow( \'sections_window\', { transition: \'slideRight\', overlay:1 });"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></a>';
		//xString += '	<div class="sm_but_icon closeb "  onclick="xInterface.closeActiveWindow();"></div>';
		xString += '<div class="sm_but_icon close" onclick="xInterface.closeActiveWindow();">×</div>'
		// xString += '<h4>Section Here</h4>';
		xString += '<h4><img src="props/'+ topDomain +'/logo_b.png" width="180" alt="Logo" style="margin-top:12px;margin-left:-2px;"/></h4>'
		xString += '<div class="sm_but_icon share right"></div>'
		xString += '</div>';
		//http://blog.stevenlevithan.com/archives/faster-than-innerhtml
		//http://ejohn.org/blog/javascript-micro-templating/
		//xString += '<div id="story_content">';
		
		//xString += '<div class="story_breadCrumbs side_margin" onclick="xInterface.closeActiveWindow();">View Section Front</div>';
		
		xString += '<div id="story_ad_top"></div>';
		xString += '<ul class="breadcrumb">';
		xString += '<li><a href="#" onclick="clickNewSection(1);">Home</a></li><li><a href="#" onclick="clickNewSection(1);">News</a></li><li class="active">Story</li>';
		xString += '</ul>';

		xString += '<div class="story_wrapper"><h1 class="story_headline">' + StoryContent['headline'] + '</h1>';
		xString += '<p class="meta">';
		xString += '<span class="story_author">'+ StoryContent['bylineEncoded'] +'</span>';
		xString += '<span class="story_pubdate">Published: ' + StoryContent['startDate'] + '</span>';
		if(StoryContent['updateDate'] != '') {
			xString += '<span class="story_update">Updated: '+ StoryContent['updateDate'] +'</span>';
		}
		xString += '</p><!-- .meta -->';
		//if ( xURL ) xString += '<div class="main_image"><img src="'+ xURL +'" /></div><!-- .main-image -->';
		
		xString += '<div class="story_content">' + StoryContent['body'] + '</div><!-- #story_content -->';
		
		xString += '<div id="story_related_content">';
		xString += '<h3 class="page-header">Related stories</h3>';
		
		//xString += '<ul class="link-list">';
		//for (var i=0; i<3;i++) {
		//	xString += '<li onclick="openStoryFromStory('+i+');">'+ StoryList[ i ].title +'</li>';
		//}
		//xString += '</ul>';
		xString += '</div><!-- #story_related_content -->';
		xString += '</div> <!-- story_wrapper -->';
		
		xString += '<div id="story_ad_bottom" style="height:50px;"></div>';
		xString += '<div class="ng-recommender" id="ng-recommender" style="height:350px;width:100%;display:block;padding:0px;margin-top:10px;"></div>';
		
		document.getElementById( 'story_container' ).innerHTML = xString;
		
		/*
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
		*/
		
		//xInterface.removeLoaderInWindow('story_window');
		//setTimeout(function() { xInterface.removeLoaderInWindow( 'story_window' ); }, 200);
		//---now that the divs are there, we need to dynamically add the ads
		setTimeout(function() { 
			addAdToDiv( '300x50', 'story_ad_top' );
			addAdToDiv( '300x50', 'story_ad_bottom' );
			//will need to add a 320x50 ad size here!!!
			//addAdToDiv( '300x250', 'story_ad_bottom' );
			newsToGram();
		}, 1000);
		/*
		if ( xURL ) {
			//-------there is an image, so create listener to resize 'story_window' after image is loaded (since we dont know its size ahead of time)
			xInterface.putLoaderInWindow( 'story_window' );
			preloadimages([ xURL ]).done(function(images){
				console.debug('story image loaded' );
				//when images are done loading:
				xInterface.removeLoaderInWindow('story_window');
				setTimeout(function() { xInterface.resizeScrollers(); }, 100);
			})

		} else {
			//-------no images, just a story
			setTimeout(function() { xInterface.resizeScrollers(); }, 10);

		}
		*/
		setTimeout(function() { xInterface.resizeScrollers(); }, 10);

		
	//} else {
	//	alert( 'error 292342 in universal.js');
	//}
}



function DrawStoryList() {
	//console.debug( 'DrawStoryList: ');
	var xString = '';//<div class="scroller">';
	xString +=	'<div class="list_header " style="">'+ xFeedList[activeSection].title +'</div>';
	xString +=	'<ul class="list Xul">';
	for (var i=0; i<StoryList.length;i++) {
		xString +=	'	<li class="Xli" onclick="clickStory('+ i +');" style="">';
		xString +=	'		<div class="story_title">'+ StoryList[i].title +'</div>';
		xString +=	'		<div class="story_time">'+ StoryList[i].pubDate +'</div>';
		xString +=	'	</li>';
	}
	
	xString +=	'</ul>';
	//xString +=	'</div>';
	xString +=	'	<footer><img class="dfm-logo" src="assets/dfm_logo.png" />';
	
	var d = new Date().getUTCFullYear();
	xString +=	'		<p class="credits">All contents © '+ d +' Digital First Media or other copyright holders. All rights reserved. This material may not be published, broadcast, rewritten or redistributed for any commercial purpose.</p>';
	
	xString +=	'</footer>';
	
	/*
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
	*/
	
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

