
//--------------------------------------------
//				Section Functions
//--------------------------------------------

function DrawSectionFromJson( xjson ) {
	console.debug( 'DrawSectionFromJson: ' );
	
	var xString = '';
	StoryList = new Array();
	
	//  -----------------------------------------------------------------------------
	//			there are two ways JSON Section info can be pulled 
	//			in determined by var fetchJsonLocally set in index.html
	//  -----------------------------------------------------------------------------
	
	if ( fetchJsonLocally ) {
		//--------------------------------------------------------local convergence tool
		(function() {
			//----------------------------processing the convergencePublisher response
			//StoryList.item.length
			//StoryList.title['#cdata-section']
			//StoryList.lastBuildDate
			//------article data
			//StoryList.item[0].pubDate
			//StoryList.item[0].title['#cdata-section']
			//StoryList.item[0].link['#cdata-section']
			//------media
			//StoryList.item[1]['media:content']['@url']
			//StoryList.item[1]['media:content']['@fileSize']
		});
		
		xjson = xjson.rss.channel;
		for (var i=0; i<xjson.item.length;i++) {
			StoryList[i] = new Array();
			StoryList[i].id = xjson.item[i].meta[0]['#cdata-section'];
			StoryList[i].headline = xjson.item[i].title['#cdata-section'];
			StoryList[i].launchDate = xjson.item[i].pubDate;
			StoryList[i].image = 0;
			if ( xjson.item[i].meta.length > 5 ) {
				//meta data is inconsistent on length, but if an images exists, it is above 5 (verify?)
				xjson.item[i].meta.filter(function( obj ) {
					if ( obj['@id'] === "original-image" ) {
						StoryList[i].image = getSmallerNgpsImage( obj['url'], 100 );
					}
				});
			}
		}
		
	} else {
		//--------------------------------------------------------yahoo yql
		(function() {
			//----------------------------JSON RESULTS FROM YAHOO YQL
			//StoryList.query.count
			//StoryList.query.results.feed.feedInformation.totalArticles
			//StoryList.query.results.feed.feedInformation.title
			//StoryList.query.results.feed.feedInformation.id
			//StoryList.query.results.feed.siteInformation.siteName
			//StoryList.query.results.feed.siteInformation.siteId
			//StoryList.query.results.feed.articles.article.length
			//StoryList.query.results.feed.articles.article[0].id
			//StoryList.query.results.feed.articles.article[0].byline
			//StoryList.query.results.feed.articles.article[0].launchDate
			//StoryList.query.results.feed.articles.article[0].updateDate
			//StoryList.query.results.feed.articles.article[0].headlineEncoded
			//StoryList.query.results.feed.articles.article[0].bodyEncoded
			//StoryList.query.results.feed.articles.article[0].overline
			//StoryList.query.results.feed.articles.article[0].headline, subHead, blurb, body
			//StoryList.query.results.feed.articles.article[0].images == null (no images)
			//StoryList.query.results.feed.articles.article[1].images.image.length
			//StoryList.query.results.feed.articles.article[1].images.image[0].caption , credit, id (several objects in array), url
			//StoryList.query.results.feed.articles.article[1].images.image[0].url[0].content
			//StoryList.query.results.feed.articles.article[1].images.image[0].width[0].content
			//StoryList.query.results.feed.articles.article[1].images.image[0].height[0].content
			//StoryList.query.results.feed.articles.article[1].images.image[0].filesize[0].content
		});
		
		xjson = xjson.query.results.feed.articles;
		//using yahoo YQL to process JSON so getting to content is different
		for (var i=0; i<xjson.article.length;i++) {
			StoryList[i] = new Array();
			StoryList[i].id = xjson.article[i].id;
			StoryList[i].headline = xjson.article[i].headline;
			StoryList[i].launchDate = xjson.article[i].launchDate;
			StoryList[i].image = 0;
			if ( xjson.article[i].images !== null ) {
				//-----there are two different result structures for images, 
				//		so I need to find out which one it is and return the appropriate format
				if ( xjson.article[i].images.image.length === undefined ) {
					StoryList[i].image = getSmallerNgpsImage( xjson.article[i].images.image.url[0].content, 100 );
				} else {
					StoryList[i].image = getSmallerNgpsImage( xjson.article[i].images.image[0].url[0].content, 100 );
				}
			}
		}
	}
	
	/*
	//one suggested way (from MMC) to render out list items with image on left
	xString = xString + '	<div class="scroller_li_mid" style="position:relative;background-image:url(' + indexArray.photos[i].url +');">';
	xString = xString + '			<div class="list_image_title_container">';
	xString = xString + '				<div class="list_image_title">'+ processTitle( indexArray.photos[i].title ) +'</div>';
	xString = xString + '				<div class="list_image_date">'+ indexArray.photos[i].date.toUpperCase() +' | PHOTO</div>';
	xString = xString + '			</div>';
	xString = xString + '	</div>';
	*/
	
	//--------------------------------------------------------------------------------------------
	//now we have a standardized data set for the article lists --- draw them
	xString +=	'<div class="list_header " style="">'+ xFeedList[activeSection].title +'</div>';
	xString +=	'<ul class="list Xul">';
	
	for (var i=0; i<StoryList.length;i++) {
		xString +=	'	<li class="Xli" onclick="clickStory('+ StoryList[i].id +');" style="overflow:hidden;">';
		if ( StoryList[i].image ) {
			xString +=	'		<div class="list_story_image" style="background-image:url('+ StoryList[i].image +');background-size: cover;" ></div>';
		}
		xString +=	'		<div class="list_story_title">'+ StoryList[i].headline +'</div>';
		xString +=	'		<div class="list_story_time">'+ StoryList[i].launchDate +'</div>';
		xString +=	'	</li>';
	}
	
	xString +=	'</ul>';
	xString +=	'	<footer><img class="dfm-logo" src="assets/dfm_logo.png" />';
	
	var d = new Date().getUTCFullYear();
	xString +=	'		<div style="display: block;margin: 0px auto;width:90%;color:white;font-family:Arial;font-size:10px;color:#FFF;text-align:center;line-height:100%;padding-bottom:20px;">';
	xString +=	'		All contents © '+ d +' Digital First Media or other copyright holders. All rights reserved. This material may not be published, broadcast, rewritten or redistributed for any commercial purpose.</div>';
	xString +=	'		</div>';
	
	document.getElementById( 'home_section_list' ).innerHTML = xString;
	//-------------------------------------------------------------------------------------------- (end of drawing)
	
	if ( xInterface.doesWindowExist( 'home' ) ) {
		//console.debug( 'it exists!: ');
		setTimeout(function() { xInterface.resizeScrollers(); }, 10);
		setTimeout(function() { xInterface.removeLoaderInWindow('home'); }, 500);
		xInterface.currentWindow.WindowScrollerArray[0].scrollTo(0,0,0);
		//setTimeout(function() { xInterface.refreshWindow('home'); }, 10);
	} else {
		//console.debug( 'create new: ');
		setTimeout(function() { xInterface.showWindow( 'home', {transition: 'fade'} ); }, 1000);
	}
	
	setTimeout(function() { xInterface.removeLoaderInWindow('home'); }, 500);
	//need to scroll to the top just in case user has already scrolled down on a previous story list
	//xInterface.WindowScrollerArray[0].scrollTo(0,0,0);
}

function getSmallerNgpsImage( xURL, xSize ) {
	//lets user give original NGPS image (without any crop on it) and this will return image at width xSize
	//		keep in mind that orig image is max width, so if orig width is 480, there will not be a 500
	//		we could always check the image.width[0].content to see what orig width is
	if ( "100,200,300,400,500,VIEWER,GALLERY".indexOf(xSize) !== -1 ) {
		var toReplace = '.jpg';
		var replaceWith = '_'+ xSize +'.jpg';
		xURL = xURL.replace(toReplace, replaceWith);
		return xURL;
	} else {
		alert('error in size for getSmallerNgpsImage');
		return false;
	}
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
	StoryList = new Array();	//set here so that later we can confirm data was loaded correctly in putExternalJsIntoHeader()
	fetchExternalJSON(xFeedList[activeSection].url, 'DrawSectionFromJson' );
}

function showSectionsWindow() {
	xInterface.showWindow( 'sections_window', { transition: 'slideRight', overlay:1,
	onSwipeLeft: function () {
		xInterface.closeActiveWindow();
	}
	 });
}

function renderSectionsWindow() {
	//renders the window that lists all of the sections
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



//--------------------------------------------
//				Article Functions
//--------------------------------------------

function clickStory( xID ) {
	//when you are viewing a list of stories and click a story to view it
	//setURLBarTo( 'http://www.google.com/', 0 );
	
	
	
	//document.getElementById( 'story_container' ).innerHTML = '';
	//xInterface.putLoaderInWindow( 'story_window' );
	
	
	
	setTimeout(function() { xInterface.showWindow( 'story_window', {
		onOpenDone: function () {
			//loadNgpsStoryContentByID( getStoryIdFromURL( StoryList[xnum].link[0]) );
			loadNgpsStoryContentByID( xID );
		},
		onSwipeRight: function () {
			closeArticleWindow();
		},
		onCloseDone: function () {
			console.debug( "onCloseDone: "+ xInterface.currentWindow.id );
			prepareArticleWindowForLoader();
		}
	}); }, 100);
	
	//calling xtory url works these two ways
	//var xStoryURL = StoryList[xnum].link;
	//console.debug( "story URL: "+ xStoryURL[0] );
	//or
	//console.debug( "story URL: "+ StoryList[xnum].link[0] );
}

function prepareArticleWindowForLoader() {
	//--------this is where we should draw the 'loading' article window
	if ( xInterface.currentWindow.id != 'gallery_window') document.getElementById( 'story_container' ).innerHTML = 'boom!';
}

function loadNgpsStoryContentByID( xID, showLoader ) {
	console.debug( "loading NGPS story with id: "+ xID );
	var xURL = 'temp/jsonServLet.php?x=' + xID +'&p='+ topDomain;
	
	if (showLoader) xInterface.putLoaderInWindow( 'story_window' );	//if we want loader in story_window, set this true
	
	//console.debug( xURL );
	request(
		xURL, null,function() {
			if ( this.readyState == 4) {
				var xdata = this.responseText;
				//console.debug( 'data loaded' );
				if ( xdata == '' ) {
					alert( 'Error loading URL!' );
				} else {
					//ok we have loaded the data, now we convert they JSON into a javascript array and then do something with it
					StoryContent = eval ("(" + xdata + ")");
					StoryContent = StoryContent['article'][0];
					//xInterface.currentWindow.WindowScrollerArray[0].scrollTo(0,0,0);
					if ( xInterface.doesWindowExist('story_window') ) xInterface.doesWindowExist('story_window').WindowScrollerArray[0].scrollTo(0,0,0);
					drawStory();
					setTimeout(function() { xInterface.removeLoaderInWindow('story_window'); }, 10);
					
				}
			}
		}, 'GET'
	);
}

function closeArticleWindow() {
	//use this function anytime you close an article window
	console.debug( "closeArticleWindow: "+ xInterface.currentWindow.backToWindowObject.id );
	if ( xInterface.currentWindow.backToWindowObject.id == 'splash' ) {
		xInterface.putLoaderInWindow( 'story_window' );
		loadNewSection();
	} else {
		xInterface.closeActiveWindow();
	}
	//document.getElementById( 'story_container' ).innerHTML = '';
}

function drawStory() {
		//----------------------------------------------build story view div string
		var xString = '';
		xString += '<div class="toolbar lightGray">';
		xString += '<div class="sm_but_icon close" onclick="closeArticleWindow();">×</div>'
		// xString += '<h4>Section Here</h4>';
		xString += '<h4><img src="props/'+ topDomain +'/logo_b.png" width="180" alt="Logo" style="margin-top:12px;margin-left:-2px;"/></h4>'
		xString += '<div class="sm_but_icon share right"></div>'
		xString += '</div>';
		//http://blog.stevenlevithan.com/archives/faster-than-innerhtml
		//http://ejohn.org/blog/javascript-micro-templating/
		
		xString += '<div id="story_ad_top" class="centered_ad"></div>';
		xString += '<ul class="breadcrumb">';
		xString += '<li><a href="#" onclick="clickNewSection(1);">Home</a></li><li><a href="#" onclick="clickNewSection(1);">News</a></li><li class="active">Story</li>';
		xString += '</ul>';

		xString += '<div id="story_wrapper" class="story_wrapper"><h1 class="story_headline">' + StoryContent['headline'] + '</h1>';
		xString += '<p class="meta">';
		xString += '<span class="story_author">'+ StoryContent['bylineEncoded'] +'</span>';
		xString += '<span class="story_pubdate">Published: ' + StoryContent['startDate'] + '</span>';
		if(StoryContent['updateDate'] != '') {
			xString += '<span class="story_update">Updated: '+ StoryContent['updateDate'] +'</span>';
		}
		xString += '</p><!-- .meta -->';
		
		(function() {
			/*
			"images":{
				"mediaCount":"2",
				"image":[
					{
						"width":"600", "height":"349", "credit":"Provided by The Denver Police Department",
						"url":"http://extras.mnginteractive.com/live/media/site36/2013/0328/20130328__kalamath-hit-run~p1.jpg",
						"caption":"An elderly man was killed in a wreck at W. 13th Avenue and Kalamath Street on Wednesday, March 27, 2013.",
						"filesize":"38405", "id":"30636745"
					},{
						"width":"600", "height":"349", "credit":"Provided by The Denver Police Department",
						"url":"http://extras.mnginteractive.com/live/media/site36/2013/0328/20130328__kalamath~p1.jpg",
						"caption":"Denver police made an arrest in a fatal crash on W. 13th Avenue and Kalamath Street that occurred Wednesday, March 27, 2013.",
						"filesize":"30358", "id":"30636637"
					}
				]
			},
			*/
		});
		
		
		
		if ( StoryContent['images'].mediaCount ) {
			//there are stories with the article
			console.debug('article images: '+ StoryContent['images'].mediaCount );
			xURL = StoryContent['images'].image[0].url;
			xString += '<div class="main_image"><img src="'+ xURL +'" /></div><!-- .main-image -->';
			if ( StoryContent['images'].mediaCount > 1 ) {
				//add show additional images link
				xString += '<div class="more_images" ontouchstart="xActiveTouch = 1;" ontouchmove="xActiveTouch = 0;" ontouchend="if (xActiveTouch) { showArticlePhotoGallery(); }">View additional images</div>';
			}
		}
		
		var xTempTestLink = '<P>Peyton is funny and stuff, <a href="http://www.denverpost.com/broncos/ci_23032711/">See the proof here on denverpost.com</a>';
		xString += '<div class="story_content">' + StoryContent['body'] + xTempTestLink+ ' </div><!-- #story_content -->';
		
		xString += '<div id="story_related_content">';
		xString += '<h3 class="page-header">Related stories</h3>';
		
		xString += '</div><!-- #story_related_content -->';
		xString += '</div> <!-- story_wrapper -->';
		
		xString += '<div id="story_ad_bottom" class="centered_ad"></div>';
		xString += '<div class="ng-recommender" id="ng-recommender" style="height:350px;width:100%;display:block;padding:0px;margin-top:10px;"></div>';
		
		document.getElementById( 'story_container' ).innerHTML = xString;
		
		//----------------------structure for article NGPS Json output in temp/ngps_article.js file **********
		//http://www.denverpost.com/mngi/servletDispatch/JsonArticleServlet.dyn?ci=22872574
		
		setTimeout(function() { xInterface.resizeScrollers(); }, 100);
		
		setTimeout(function() { hijackHref( 'story_wrapper' );  }, 500 );
		
		//---now that the divs are there, we need to dynamically add the ads
		setTimeout(function() { 
			addAdToDiv( 'story_ad_top', '300', '50' );
			addAdToDiv( 'story_ad_bottom', '300', '250' );
			//addAdToDiv( 'story_ad_bottom' );
			//will need to add a 320x50 ad size here!!!
			//addAdToDiv( '300x250', 'story_ad_bottom' );
			//newsToGram();
		}, 1000);
		
		//if ( xInterface.doesWindowExist('story_window') ) 
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


function showArticlePhotoGallery() {
	//render the contents for a gallery and put it in gallery_window div
	
	/*
	//---------testing way
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
		
		if ( xInterface.doesWindowExist( 'gallery_window' ) ) {
			//console.debug( 'it exists!: ');
			setTimeout(function() { xInterface.resizeScrollers(); }, 10);
			//setTimeout(function() { xInterface.refreshWindow('home'); }, 10);
		} else {
			//console.debug( 'create new: ');
			setTimeout(function() { xInterface.showWindow( 'gallery_window', { transition: 'fade', overlay:1 }); }, 100);
		}
		
		
	}
	//---------testing way (end)
	*/
	
	
	
	
	/*
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
	*/
	
	StoryContent['images'].image[0].url
	//StoryContent['images'].mediaCount
	
	if ( xInterface.allowUserEvent() ) {
		//----------------------------------------------build gallery string
		var xString = '';
		xString += '<div class="content " style="background-color:#GGG;">';
		xString += '	<div class="carousel "><!-- /scroller width will have to be set by javascript-->';
		xString += '		<ul class="list" style=""><!-- /thelist -->';
		
		for (var i=0; i<StoryContent['images'].mediaCount;i++) {
			xString += '<li class="Xli" id="photoframe_'+ (i+1) +'" style="position:relative;" ontouchstart="xActiveTouch = 1;" ontouchmove="xActiveTouch = 0;" ontouchend="if (xActiveTouch) { xGallery.toggleTopLayer(); }">		<div class="gallery_bigImage" style="background-image:url('+ StoryContent['images'].image[i].url +');background-size: contain;"></div>	</li>';
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
			console.debug( 'it exists!: ');
			setTimeout(function() { xInterface.refreshWindow('gallery_window'); }, 10);
			setTimeout(function() { xInterface.showWindow( 'gallery_window', { transition: 'fade', overlay:1 }); }, 200);
			//
			//setTimeout(function() { xInterface.resizeScrollers(); }, 10);
			//setTimeout(function() { xInterface.refreshWindow('home'); }, 10);
		} else {
			//console.debug( 'create new: ');
			setTimeout(function() { xInterface.showWindow( 'gallery_window', { transition: 'fade', overlay:1, onSwipeDown: function () {
				//alert('onSwipeLeft');
				console.log( 'onSwipeDown: '+ xInterface.currentWindow.WindowScrollerArray[0].lastPage +', '+ xInterface.currentWindow.WindowScrollerArray[0].currPageX );
				//WindowScrollerArray
				//if ( xInterface.currentWindow.WindowScrollerArray[0].lastPage == 0 ) xInterface.closeActiveWindow();
				xInterface.closeActiveWindow();
				
			}
			 }); }, 100);
		}
		
		
	}
	
	
	
}


function getStoryIdFromURL( xURL ) {
	console.debug( "getStoryIdFromURL: "+ xURL );
	//xURL = 'http://www.elpasotimes.com/newupdated/ci_22867699/border-agents-seize-3-5-tons-marijuana-southern?source=most_viewed';
	//http://www.elpasotimes.com/news/ci_22955267?source=rss
	//sometimes the id is something like this '22955267?source=rss' - need to remove anything after id
	var ID = xURL.split('ci_');
	if ( ID.length > 1 ) {
		ID = ID[1];
		if (ID.indexOf("/") !== -1) {
			ID = ID.split('/');
			if ( ID.length > 1 ) ID = ID[0];
		}
		console.debug( "ID: "+ ID );
		if (ID.indexOf("?") !== -1) {
			ID = ID.split('?');
			if ( ID.length > 1 ) ID = ID[0];
		}
	} else {
		ID = 0;
	}
	console.debug( "ID: "+ ID );
	return ID;
}




//---------------Eventually all code below should be moved to property specific prop.js in each props folder

function loadPropertyData() {
	//----Eventually I will pull each properties data from the server
	//		So, for example, this property (denver) would call to server passing unique property id
	//		The server would then send back a JSON array with all the properties data,
	//		including property title, activeSection and an array of all the sections and their corresponding feeds (below)
	
	
	/*
	xFeedList = new Array(
			{ 'title' : 'Business', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230614.xml' },
			{ 'title' : 'Breaking News', 'url' : 'rss.denverpost.com/mngi/rss/CustomRssServlet/36/230605.xml' },
			{ 'title' : 'Broncos', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230613.xml' },
			{ 'title' : 'Sports', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/247701.xml' },
			{ 'title' : 'Entertainment', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230611.xml' },
			{ 'title' : 'Featured', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/237705.xml' },
			{ 'title' : 'Nuggets', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230616.xml' },
			{ 'title' : 'Nation / World', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230615.xml' },
			{ 'title' : 'Lifestyle', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230610.xml' },
			{ 'title' : 'Opinion', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230609.xml' },
			{ 'title' : 'Politics', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230620.xml' },
			{ 'title' : 'Preps', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/245424.xml' },
			{ 'title' : 'Rockies', 'url' : 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230619.xml' }
		);
	
	
	//alert( xFeedList[0].title );
	//alert( xFeedList[0].url );
	
	propertyTitle = 'The Denver Post';
	activeSection = 1;		//breaking news
	propertySplashImage = 'splash.gif';
	backgroundsplash = '0079c2';				//el paso 'f2f8fe'
	
	AppleAppID = "375264133";
	*/
	
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







function addAdToDiv( xDiv, xWidth, xHeight ) {
	console.debug( 'addAdToDiv: '+ xDiv);
	
	var xRandom = Math.floor((Math.random()*1000000)+1);
	var xString = '<a href="https://pubads.g.doubleclick.net/gampad/jump?iu='+ adunit +'&sz='+ xWidth +'x'+ xHeight+'&mob=js&c='+ xRandom +'" target="_blank">';
	xString += '<img src="https://pubads.g.doubleclick.net/gampad/ad?iu='+ adunit +'&sz='+ xWidth +'x'+ xHeight+'&mob=js&c='+ xRandom +'"></a>';
	if ( document.getElementById( xDiv ) ) document.getElementById( xDiv ).innerHTML = xString;
	//'<img src="http://pubads.g.doubleclick.net/gampad/ad?iu='+ adunit +'&sz='+ xWidth +'x'+ xHeight+'&mob=js&c='+ Math.floor((Math.random()*1000000)+1) +'" alt="Smiley face" height="'+ xHeight+'" width="'+ xWidth+'"> ';
}



//---------------------------Experimenting with loading external js by adding it to header
function putExternalJsIntoHeader(url) {  //quick and dirty, just meant for quick proof of concept, no jquery needed
	console.debug( 'putExternalJsIntoHeader: '+ url );
	
	var xObject = document.getElementById('jsonScript');
	if ( xObject ) {
		xObject.parentNode.removeChild(xObject)
	}
	var script = document.createElement('script');
	script.setAttribute('src', url);
	script.setAttribute('id', 'jsonScript');
	script.setAttribute('type', 'text/javascript');
	
	function headFileHasLoaded() {
		//console.debug( 'External code has loaded, story count: '+ StoryList.length );
		if ( StoryList.length == 0 ) {
			console.debug( '----Error loading content' );
			//error loading content
			
			if ( fetchJsonLocally ) {
				console.debug( '----changing source!' );
				fetchJsonLocally = 0;
			}
			setTimeout(function() { loadNewSection(); }, 100);
		}
	}
	
	script.addEventListener('load',headFileHasLoaded,false);
	
	document.getElementsByTagName('head')[0].appendChild(script);
	//document.getElementById('dynamic_code').setAttribute("src", url);
}

//fetchExternalJSON('http://extras.denverpost.com/media/MRSS/Breaking_News_230605.xml');
function fetchExternalJSON(url, callback){
	console.debug( 'fetchExternalJSON: ' );
	//older way //http://delivery.digitalfirstmedia.com/ConvergencePublisher/?format=json&uri=http://extras.denverpost.com/media/MRSS/Breaking_News_230605.xml&paramname=site&param=Denver+Post
	
	//newest recommended way to call Spreed to Json
	//http://delivery.digitalfirstmedia.com/ConvergencePublisher/?format=genericxml2spreed&uri=http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230605.xml&json=true
	
	//----for testing on yahoos site
	//select * from xml where url= 'http://rss.denverpost.com/mngi/rss/CustomRssServlet/36/230605.xml'
	//http://developer.yahoo.com/yql/console/?q=select%20*%20from%20json%20where%20url%3D%27http%3A%2F%2Fwww.denverpost.com%2Fmngi%2FservletDispatch%2FJsonArticleServlet.dyn%3Fci%3D22872574%27#h=select%20*%20from%20xml%20where%20url%3D%20%27http%3A//rss.denverpost.com/mngi/rss/CustomRssServlet/36/230605.xml%27
	
	if ( fetchJsonLocally ) {
		//get xml using our in-house ConvergencePublisher
		url = 'http://delivery.digitalfirstmedia.com/ConvergencePublisher/?format=genericxml2spreed&uri='+ url +'&json=true&jsoncallback='+ callback;
	} else {
		//get xml using yahoo yql
		url="select * from xml where url='" + url + "'";
		url="http://query.yahooapis.com/v1/public/yql?q=" +
			encodeURIComponent(url) +
			"&format=json" +
			"&callback="+ callback;
	}
	
	//for testing locally!!!
	//url = 'temp/test.json';
	
	putExternalJsIntoHeader( url );
}

function hijackHref( xDiv ) {
    //var links = document.getElementsByTagName('a');
	var links = document.getElementById( xDiv ).getElementsByTagName('a');
	console.debug('found links in article: '+ links.length );
	for (var i = 0; i < links.length; i++) {
		//console.debug(links[i].href );
		//links[i].href = "http://google.com";
		//links[i].onclick = bingdong('hi');
		
	    links[i].onclick = function() {
			if ( basedomain != get_base_domain( this.href ) ) {
				alert( 'not our site');
				this.target = "_blank";
				return true;
			} else {
				//alert( 'Link on our site!!!: '+ this.href);
				
				
				loadNgpsStoryContentByID( getStoryIdFromURL( this.href ), true );
				
				//bingdong('hiw');
				//
		        //this.href = "http://google.com";
				return false;
			}
			
	    };
	}
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

/*
//--------------OMNITURE CODE SUPPLIED BY JOSHUA D
function eventHandler() {
    this.events = [];
    this.calls = [];
    this.params = [];
    this.registerEvent = function registerEvent(eventName) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
            this.params[eventName] = []
        }
    }
    this.raiseEvent = function(eventName) {
        if (this.events[eventName]) {
            for (var ct = 0; ct <= this.events[eventName].length - 1; ct++) {
                this.events[eventName][ct](this.params[eventName][ct]);
            }
        }
    }
    this.attachEvent = function(eventName, funcCall, params) {
        if (!this.events[eventName]) {
            this.registerEvent(eventName)
        }
        this.events[eventName].push(funcCall);
        this.params[eventName].push(params);
    }
    this.removeEvent = function(eventName, funcCall) {
        if (this.events[eventName]) {
            if (this.events[eventName]) {
                var a = [];
                var b = [];
                for (var ct = 0; ct <= this.events[eventName].length - 1; ct++) {
                    if (this.events[eventName][ct] != funcCall) {
                        a.push(this.events[eventName][ct])
                        b.push(this.params[eventName][ct])
                    }
                }
            }
            this.events[eventName] = a;
            this.params[eventName] = b;
        }
    }
}
//var handler = new eventHandler();
*/

/*
Example1: register and trigger an event once all adds are loaded (some pseudocode)
//init
var handler = new eventHandler();
handler.registerEvent(“Ads Loaded”);

//analytics function
function trackAdsLoaded(){
	alert(“hello world!”)
}

//Attach function to event
handler.attachEvent(“Ads Loaded”, trackAdsLoaded, null)

//code for ads triggers event once all are loaded
function finishedLoading(){
	Handler.raiseEvent(“Ads Loaded”)
}
//---Output: hello world!


//-----------Example2: embed emitter in javascript object:

var foo = [];
foo.handler = new eventHandler();
foo.handler.helloWorld = function(){alert(“hello world!”)}
foo.handler.registerEvent(“doSomething called”)
foo.handler.attachEvent(“doSomething called”, foo.helloWorld, null)
foo.doSomething = function(){foo.handler.raiseEvent(“doSomething called”)}
foo.doSomething();

//---Output: hello world!
*/


function DetermineWhatToDoNextFromURL() {
	//called only once after app has loaded
	//	anaylzes URL to see if we now load a section front or story
	
	var TempSectionFront 	= 0;
	var TempStoryID			= 0;	//23062993;
	
	if ( !TempSectionFront && !TempStoryID ) {
		setTimeout(function() { loadNewSection(); }, 1500);
	} else if ( TempStoryID ) {
		setTimeout(function() { clickStory( TempStoryID ); }, 1500);
	}
	
	//23062993
}
