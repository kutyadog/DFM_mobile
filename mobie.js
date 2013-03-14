//builds a window object the first time an existing html window is created. These are permanent windows.
//	dynamically created windows are not permanent unless the window object options.permanentPage is set to 1 (default)

/* ******NOTES:


TODO:
* Add close window and open DIFFERENT window besides what is in history
* Add ability to clear out history and create new 'home' window
* when interface is built, we need to be able to set a transition for that window
* add big buttons for content (not toolbar)

* need to find a way for users to add scrollEnd / ScrollStart functions to their carousels
* allow user to also set beforeOpen function on window

* create a window option 'alwaysCloseToWindow' pointing to a window_id, that way when that window is open, it will always close to the set window (started it, its in options now on window class)

* finalize orientation change so that it will watch the size of the browser window and will see that it is changing in size 
		and once the size has stopped changing and settled into place, we will know for sure that it is done!!! Especially for android

* photo gallery, flip view: So image fills screen, when you want to go to the next image, you can swipe right or left to go forward/backward. 
		The image will flip revealing next photo in series. Will use smart load to watch array of images and start loading images 1 or 2 out


DONE:
8-28: loading screen: Its a bit complex
	* DONE** Change scroll so that the scroller is created after a window is created and done animating on the screen!!! (smart)
	* DONE** Need to keep track of scroll objects, delete them when the window they live in is killed. Possibly add their object as a property of the parent window
	
8-29: change toolbar setup, removed 'table' setup, added buttons, added popup window with X close button,
		* add popup menu listing (with scrolling) DONE****
		* create alternative to current scrolling style, so that it fills screen with scroller (minus toolbars) similar to my jqtouch demo DONE****
		
8-30: fixed bug, kept rerendering scrolls when window opens... caused issues obviously after u open a windowa  few times
		* create carousel DONE****
		* after doNext, if its empty, always TURN ON content. Remove it from the doNextArray DONE****

8-31: 
		* add a window class that is like 'overlay' so that you can actually see the window behind it. this can be used on settings window popup and for custom menus (smaller width windows)
		* sections button at top left of window_1, make it open a modified window with adjusted width. Style window 'Full scroller dark'. Use 'overlay' class if you have built it yet (mentioned above)

9-1: added blockerdiv and love it. Much easier to deal with then other options

9-4: added 
		* Expected behavior for load from URL. If there is HTML passed for toolbar then.
		* no_action no scroller list li

9-7: added
		*putLoaderInWindow & removeLoaderInWindow
*/

function Interface (main, options) {
	var xObject = this;		//so i can reference 'this' in timers
	this.xOrientation = 0;
	this.hideURLbar = 1;	//by default hide it, later we will check to see if this browser lets us do that
	this.DoNextArray = new Array();	//an array of strings that will be run
	this.WindowArray = new Array();	//an array holds history of window objects. Current window is always last in array, oldest first. Delete object when window is closed.
	
	this.scrollerArray = new Array();	//an array that holds all active scrollers
	
	//this.KeeperWindowsString = '';		//string of div ids that we will always keep separated by commas (dynamic ones will be deleted)
	this.currentWindow = 0;
	
	this.busy = 0;							//keeps track of whether or not the interface is busy
	
	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
	//document.addEventListener('touchstart', function (e) { e.preventDefault(); }, false);	//NOTE: Uncomment this, but before you do, change out all the onclicks to ontouchends!
	
	this.windowHeight = 0;					//keeps track of height of window so we can tell when size has changed
	this.xInterval = 0;
	
	//---trying to dynamically pull css values for length of transitions - so we dont have to have the number in sooo many spots
	//this.transitionTime = window.getComputedStyle(element).style.getPropertyValue('top');
	//alert( window.getComputedStyle('div.animated').style.getPropertyValue('transition-duration') );
	//var element = document.getElementById('story_container'),
	//    style = window.getComputedStyle(element),
	//    top = style.getPropertyValue('margin');
	
	//----------------add external js
	//<script src="js/iscroll.js" type="text/javascript"></script>
	var xURL = "iscroll.js";
	//if ( ( xHTML == undefined ) || ( xHTML == '' ) ) {
		//no html was given, so put LOADING SCREEN over the whole interface
		//this.showLoadingScreenFull();
		request(
			xURL, null,function() {
				if ( this.readyState == 4) {
					//alert( 'done');
					var xdata = this.responseText;
					if ( xdata == '' ) {
						//alert( 'Error loading URL!' );
					} else {
						//OK now we have the html (data) to put into it, use createNewWindowFromHTML to do the rest
						//xObject.createNewWindowFromHTML( xID, xdata, options );
						//xObject.busy = 0;
						//alert( xdata );
						window.eval(xdata);
						xObject.init();
					}
				}
			}, 'GET'
		);
	//}
	//----------------add external js to dom (end)
	
	/*
	document.addEventListener('click', function (e) {
		console.debug('**click!!**');
		e.preventDefault();
		}, false);
	*/
	
	//---orientation change support
	//								function below will need to be redone. It is called at least twice, duplicating the functions in DoNextArray, make it only do this once
	setTimeout(function() {  
		var supportsOrientationChange = "onorientationchange" in window, orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
		window.addEventListener(orientationEvent,function(){ xObject.changeOrientation(); },true);
	}, 1000);		//give this a bit of time before running. Again, Firefox Android is causing timing issues
	

	this.init = function() {
		console.debug('------mobie: Interface object created------');
		//document.get;
		//Rules on DoNextArray. Best to use function(). When We dont call functions, make sure you ALWAYS add xObject.runDoNext(); at end to possibly catch anything else
		//			qued in the list
		//this.renderParts( document );
		this.DoNextArray = new Array( 
				function() { 
					xObject.hideAddressBar();
				},
				function() {
					xObject.determineOrientation();
				},
				function() { 
					xObject.setSizes();
				},
				function() {
					if (main!='') xObject.showWindow( main, {transition: 'fade'} );
					this.xInterval = setInterval(function(){ xObject.xChecker(); },2000);
					setTimeout(function() {  xObject.runDoNext(); }, 10);		//do we need this?
				});
		
		//---dont need to set runDoNext here, as it will call it from showWindow();
		//setTimeout(function() {  xObject.runDoNext(); }, 10);
		
		this.createBlockerDiv();
	}
	
	this.createBlockerDiv = function() {
		//blockerdiv is an invisible fullscreen div placed directly behind the active window layer
		//		sole purpose is to block touch/click events with inactive layers. NOTE that when touched/clicked it will close top window
		var blockerdiv = document.createElement('div');
		blockerdiv.className = 'blockerdiv';
		blockerdiv.onclick = function() {
			xObject.closeActiveWindow();		//closes top window when user clicks it (can only be clicked if top window is not full width (menu) or alert box, etc.)
		};
		document.getElementById('mobie').appendChild( blockerdiv );
		
		
	}
	
	this.initScrollers = function( xElement ) {
		//so we do this everytime a window is created... could be multiples so i return an array
		
		//----------------------------------------------------------------------------------------vertical scrollers
		var scrollers = xElement.getElementsByClassName("scroller");
		var xTempArray = new Array();	//temporarily keep track of any scroller objects
		if ( scrollers.length > 0 ) {
			for (var i = 0, len = scrollers.length; i < len; i++) {
				//-------------------------------------FIRST WE wrap scroller div inside of a 'wrapper' div
				var wrap = document.createElement('div'); wrap.appendChild(scrollers[i].cloneNode(true));
				var xHTML = '<div class="wrapper">' + wrap.innerHTML +'</div>';
				var xParent = scrollers[i].parentNode;xParent.removeChild( scrollers[i] );
				xParent.innerHTML = xHTML + xParent.innerHTML;
			}

			//-----------------------------------------THEN WE now filter through wrappers and make them scrollable	
			var wrappers = xElement.getElementsByClassName("wrapper");
			for (var i = 0, len = wrappers.length; i < len; i++) {
				//-----lets give them id's if they dont have one
				console.debug('------mobie: Scroller created------:' );
				if ( wrappers[i].id == '' ) {
					wrappers[i].id = 'wrapper_id_'+ Math.floor((Math.random()*1000000)+1);
				}
				var scroller = new iScroll( wrappers[i].id, {
					snap: false, momentum: true, hScrollbar: false
				});
				this.scrollerArray.push( scroller );
				xTempArray.push( scroller );
			}
		} else {
			//there arent any scrollers in here
		}
		
		
		
		//----------------------------------------------------------------------------------------carousels
		var scrollers = xElement.getElementsByClassName("carousel");
		if ( scrollers.length > 0 ) {
			for (var i = 0, len = scrollers.length; i < len; i++) {
				//-------------------------------------FIRST, lets set the size of the carousel width
				var FrameCount = scrollers[i].getElementsByClassName("Xli").length;
				var xwidth = window.innerWidth;
				scrollers[i].style.width = (FrameCount * xwidth) +'px';
				
				//-------------------------------------FIRST WE wrap scroller div inside of a 'wrapper' div
				if ( scrollers[i].id == '' ) {
					//give the carousel an id. Important because in next filter through wrappers, we will need to reference this to resize
					scrollers[i].setAttribute("id", 'carousel_id_'+ Math.floor((Math.random()*1000000)+1));
				}
				
				//-------------------------------------SECOND we wrap scroller div inside of a 'wrapper' div
				var wrap = document.createElement('div'); wrap.appendChild(scrollers[i].cloneNode(true));
				var xHTML = '<div class="carousel_wrapper">' + wrap.innerHTML +'</div>';
				var xParent = scrollers[i].parentNode;xParent.removeChild( scrollers[i] );
				xParent.innerHTML = xHTML + xParent.innerHTML;
				/*	
					<div id="car_wrapper_id_2345872" class="carousel_wrapper ">
						<div class="carousel "><!-- /scroller width will have to be set by javascript-->
							<ul class="framelist"><!-- /thelist -->
								<li>
				*/
			}

			//-----------------------------------------LAST we filter through wrappers and make them scrollable	
			var wrappers = xElement.getElementsByClassName("carousel_wrapper");
			for (var i = 0, len = wrappers.length; i < len; i++) {
				console.debug('------mobie: Carousel created------:' );
				//-----lets give them id's if they dont have one
				if ( wrappers[i].id == '' ) {
					wrappers[i].id = 'car_wrapper_id_'+ Math.floor((Math.random()*1000000)+1);
				}
				var scroller = new iScroll( wrappers[i].id, {
					snap: true,
					momentum: false,
					hScrollbar: false,
					onScrollEnd: function () {
						//document.querySelector('#indicator > li.active').className = '';
						//document.querySelector('#indicator > li:nth-child(' + (this.currPageX+1) + ')').className = 'active';
					}
				});
				
				this.scrollerArray.push( scroller );
				xTempArray.push( scroller );
			}
			
			//alert( this.scrollerArray[0].wrapper.parentNode.parentNode.id );
		} else {
			//there arent any carousels in here
		}
		
		setTimeout(function() {  xObject.runDoNext(); }, 10);
		return xTempArray;
	}
	
	this.resizeScrollers = function() {
		console.debug('------mobie: resizeScrollers------' );
		console.debug('------mobie: DoNextArray.length: '+ this.DoNextArray.length );
		console.debug('------mobie: this.currentWindow.object.id: '+ this.currentWindow.object.id );
		console.debug('------mobie: this.busy: '+ this.busy );
		
		for (var i=0; i<this.scrollerArray.length;i++) {
			var xScrollerObject = this.scrollerArray[i];
			//-------so I need to find the carousel scrollers. In function initScrollers i set option.snap = true only for carousels
			//						for now, that will work, but it is NOT ideal
			if ( this.scrollerArray[i].options.snap ) {
				//alert( this.scrollerArray[i].wrapper.firstChild.id );
				var carDiv = this.scrollerArray[i].wrapper.firstChild;
				var FrameCount = carDiv.getElementsByClassName("Xli").length;
				var xwidth = window.innerWidth;
				carDiv.style.width = (FrameCount * xwidth) +'px';
				
				/*
				setTimeout(function() {
					console.debug('------mobie: jump to page------: '+ xScrollerObject.currPageX );
					xScrollerObject.scrollToPage(xScrollerObject.currPageX, 0);
				}, 700);
				*/
				
				
				//only need to jump to another page if its a carousel
				var x = function() {
					console.debug('------mobie: jump to page------: '+ xScrollerObject.currPageX );
					setTimeout(function() {  
						xScrollerObject.scrollToPage(xScrollerObject.currPageX, 0);
						setTimeout(function() {  xObject.runDoNext(); }, 10);
					}, 300);
					
					
				};
				this.DoNextArray.push( x );
				
			}
			
			xScrollerObject._resize();
			
			//setTimeout("xGallery.myGalleryScroll.scrollToPage(xGallery.myGalleryScroll.currPageX, 0);", 200);
			//alert( this.DoNextArray.length );
			
			
			
			//setTimeout(function() {
				
			//	xScrollerObject.scrollToPage(xScrollerObject.currPageX, 0);
			//	}, 100);
			
		}
		setTimeout(function() {  xObject.runDoNext(); }, 10);
	}
	
	this.deleteScrollers = function( xArray ) {
		//alert( 'deletescrollers: '+ xArray.length );
		//alert( "pooooo:"+ xArray[0].wrapper.parentNode.parentNode.id );
		for (var i=0; i<xArray.length;i++) {
			var tempObject = xArray[i];
			for (var z=0; z<this.scrollerArray.length;z++) {
				if ( this.scrollerArray[z] == tempObject ) {
					this.scrollerArray.splice(z,1);
					console.debug('------mobie: Scroller deleted------:' );
				}
			}
		}
	}
	
	this.changeOrientation = function() {
		console.debug('------mobie: changeOrientation------------------------------------------------');
		document.getElementById('mobie').style.opacity = '0.0';
		
		if ( this.DoNextArray.length == 0 ) {
			this.DoNextArray = new Array( 
				function() { 
					xObject.hideAddressBar();
				},
				function() { 
					xObject.determineOrientation();
				},
				function() { 
					xObject.setSizes();
				},
				function() { 
					xObject.resizeScrollers();
				}
			);
			setTimeout(function() {  xObject.runDoNext(); }, 10 );
		} else {
			this.DoNextArray.push( 
				function() { 
					xObject.hideAddressBar();
				},
				function() { 
					xObject.determineOrientation();
				},
				function() { 
					xObject.setSizes();
				},
				function() { 
					xObject.resizeScrollers();
				}
			);
			
		}
		
	}
	
	this.setSizes = function() {
		console.debug('------mobie: setSizes------: '+ window.innerHeight);
		var xwidth = window.innerWidth;var xheight = window.innerHeight;
		document.getElementById('mobie').style.width = xwidth +"px";
		document.getElementById('mobie').style.height = xheight +"px";
		
		//{background-color:green;position:relative;width:inherit;height:inherit;visibility:hidden;z-index:1;}
		ChangeStyleSheet('#mobie > div', 'width', xwidth+'px', 0);
		ChangeStyleSheet('#mobie > div', 'height', xheight+'px', 0);
		ChangeStyleSheet('#mobie > div', 'left', xwidth+'px', 0);
		
		ChangeStyleSheet('.carousel .Xli', 'width', xwidth+'px', 0);		//sets carousel width to full screen
		
		setTimeout(function() {  xObject.runDoNext(); }, 10);
	}
	
	this.xChecker = function() {
		//runs every half second or so to check various things
		//console.debug('------mobie: xChecker------: '+ this.windowHeight +', '+ window.innerHeight);
		//first check to see if we hide URL bar
		
		//return 0;	//TURN THIS OFF
		
		//setTimeout( function() { xObject.xChecker();}, 1000);
		if ( this.windowHeight != window.innerHeight ) {
			console.debug('------mobie: xChecker------: size has changed');
			
			if ( this.DoNextArray.length == 0 ) {
				this.DoNextArray = new Array( 
					function() { 
						xObject.hideAddressBar();
					},
					function() { 
						xObject.determineOrientation();
					},
					function() { 
						xObject.setSizes();
					},
					function() { 
						xObject.resizeScrollers();
					}
				);
				setTimeout(function() {  xObject.runDoNext(); }, 10 );
			} else {
				//wait till next time because interface might still be actively building
			}
		}
	};
	
	this.getInfo = function( xString ) {
		alert( xString );
	};
	
	this.determineOrientation = function() {
		//primary purpose is to set xOrientation to "portrait" or "landscape", afterwards we call callback
		console.debug('------determineOrientation------');
		setTimeout(function() {
			// calculate the orientation based on aspect ratio 
			var aspectRatio = 1;
			if (window.innerHeight !== 0) {
				aspectRatio = window.innerWidth / window.innerHeight;
			}
			// determine the orientation based on aspect ratio 
			xObject.xOrientation = aspectRatio <= 1 ? "portrait" : "landscape";
			//console.debug('orientation set to: '+ xObject.xOrientation);
			
			setTimeout(function() {  xObject.runDoNext(); }, 10);
		}, 500);
	}
	
	this.runDoNext = function() {
		//looks at function this.DoNextArray, if its not empty, then it will do the first thing in the array
		//console.debug('------mobie: runDoNext------: '+ this.DoNextArray[0]);
		var xLength = this.DoNextArray.length;
		if ( xLength > 0 ) {
			//alert( '------mobie: runDoNext------: run: '+ this.DoNextArray[0] );
			//console.debug('------mobie: runDoNext------: run: '+ this.DoNextArray[0] );
			setTimeout( this.DoNextArray.shift(), 10);
			//setTimeout( function () { xObject.DoNextArray.shift() }, 10);
			
			//nothing else to do, so lets turn mobie visible just in case it is not!
			if ( xLength == 1 ) {
				setTimeout(function() { document.getElementById('mobie').style.opacity = '1.0'; }, 20);
			}
		}
	}
	
	this.hideAddressBar = function() {
		//console.debug('first: '+ window.body.scrollTop);
		//this.runDoNext();
		//return;
		if ( this.hideURLbar ) {
			console.debug('------mobie: hideAddressBar------ ');
			if (navigator.userAgent.indexOf("iPhone") != -1) {
				//-----------iphone
				//console.debug('------mobie: hideAddressBar iphone------');
				if(!window.location.hash) {
					if(document.height <= window.outerHeight + 10) {
						document.body.style.height = (window.outerHeight + 60) +'px';
						setTimeout( function(){ window.scrollTo(0, 1); }, 50 );
					} else {
						document.body.style.height = (window.outerHeight + 60) +'px';
						setTimeout( function(){ window.scrollTo(0, 1); }, 0 );
					}
				}
			} else if (navigator.userAgent.match(/Android/i)) {
				if ( (navigator.userAgent.indexOf("Firefox") != -1) || (navigator.userAgent.indexOf("Chrome") != -1) ) {
					//we do not hide the URL bar for firefox or Chrome (later feature possibly)
					this.hideURLbar = 0;
				} else {
					if(document.documentElement.scrollHeight<window.outerHeight/window.devicePixelRatio) {
						//console.debug( document.documentElement.scrollHeight +', '+ window.innerHeight +', '+ (window.outerHeight/window.devicePixelRatio) +', '+ document.height);
						document.documentElement.style.height=((window.outerHeight/window.devicePixelRatio)+1)+'px';	//cj added +1 for loading in landscape (was 1 px too short) hopefully wont cause problems.
					}
					setTimeout('window.scrollTo(1,1);',1);
				}
			} else if (navigator.userAgent.indexOf("iPad") != -1) {
				this.hideURLbar = 0;
			} else {
				this.hideURLbar = 0;
			}
			if ( this.hideURLbar ) {
				this.hideAddressBarDone(0);
			} else {
				this.windowHeight = window.innerHeight;
				console.debug('------mobie: hideAddressBar finished 1------');
				setTimeout(function() {  xObject.runDoNext(); }, 10);
			}
		} else {
			this.windowHeight = window.innerHeight;
			console.debug('------mobie: hideAddressBar finished 2------');
			setTimeout(function() {  xObject.runDoNext(); }, 10);	//we dont hide the URL bar with this, so 
		}
	
	}
	
	this.hideAddressBarDone = function( xnum ) {
		//this is a loop that runs until the address bar is finished hiding
		//console.debug( document.documentElement.scrollHeight +', '+ window.innerHeight +', '+ (window.outerHeight/window.devicePixelRatio) +', '+ document.height);
		if (xnum == undefined) xnum = 0;
		
		//if ( (navigator.userAgent.match(/iPhone/i)) && (document.height <= window.outerHeight + 10) ) {	//fixed this line - works better on iphone
		if ( (navigator.userAgent.match(/iPhone/i)) && (document.documentElement.scrollHeight == window.innerHeight) ) {
			this.windowHeight = window.innerHeight;
			console.debug('------mobie: hideAddressBar finished 3------');
			setTimeout(function() {  xObject.runDoNext(); }, 10);
			//alert( 'boom');
		} else if ( (navigator.userAgent.match(/Android/i)) && (window.innerHeight >= Math.floor( window.outerHeight/window.devicePixelRatio ) ) ) {
			this.windowHeight = window.innerHeight;
			console.debug('------mobie: hideAddressBar finished 4------');
			setTimeout(function() {  xObject.runDoNext(); }, 10);
		} else {
			if ( xnum < 100 ) {
				xnum = xnum + 1;
				setTimeout( function(){ xObject.hideAddressBarDone( xnum ); }, 10 );
			} else {
				console.debug('------mobie: hideAddressBar ERROR 58------'+ document.height );
				//alert("ERROR");
				this.windowHeight = window.innerHeight;
				setTimeout(function() {  xObject.runDoNext(); }, 10);
			}
		}
	}
	
	//------------------------------------------------------------window management
	
	
	/*
	
	*/
	
	this.refreshWindow = function( xID ) {
		console.debug('------mobie: refreshWindow------: '+ xID );
		//refreshes a window, checks scrollers
		
		var zElement = xObject.doesWindowExist( xID );
		if ( zElement ) {
			//alert( zElement.WindowScrollerArray.length);
			
			if ( zElement.WindowScrollerArray.length > 0 )
				this.deleteScrollers( zElement.WindowScrollerArray );
			
			
			this.initScrollers( zElement.object );
			
		} else {
			//doesnt exist, so dont worry about it
		}
	}
	
	this.putLoaderInWindow = function( xID ) {
		//inserts loading screen in a window, must be manually turned off with function removeLoaderInWindow!!! so dont forget you opened it.
		var xString = '<div class="loading_window"><div class="loading_text" >Loading</div><div class="animation_block" ><div id="block_1" class="barlittle"></div><div id="block_2" class="barlittle"></div><div id="block_3" class="barlittle"></div><div id="block_4" class="barlittle"></div><div id="block_5" class="barlittle"></div></div></div>';
		
		var mloader = document.createElement('div');
		mloader.className = 'loading_container';
		mloader.style.zIndex = '8';
		mloader.style.opacity = '1.0';
		mloader.innerHTML = xString;
		
		document.getElementById(xID).appendChild( mloader );
	}
	
	this.removeLoaderInWindow = function( xID ) {
		//removes loader screen in window
		var mloader = document.getElementById(xID).getElementsByClassName("loading_container");
		if (mloader.length > 0 ) {
			var xParent = mloader[0].parentNode;xParent.removeChild( mloader[0] );
		}
	}
	
	this.showLoadingScreenFull = function( xOn ) {
		//turns on or off loading screen on a window object - On: creates a new div in body with the loader, Off: removes that div
		if (xOn == undefined) xOn = 1;	//default is on
		if (xOn) {
			//turn it on!!!
			var xString = '<div class="loading_window"><div class="loading_text" >Loading</div><div class="animation_block" ><div id="block_1" class="barlittle"></div><div id="block_2" class="barlittle"></div><div id="block_3" class="barlittle"></div><div id="block_4" class="barlittle"></div><div id="block_5" class="barlittle"></div></div></div>';
			var div = document.createElement("div");
			div.setAttribute("id", "xloader");
			div.className = "loading_container";
			div.innerHTML = xString;
			document.body.appendChild(div);
			setTimeout(function() {  div.className = "loading_container active"; }, 10);
			
		} else {
			//turn it off baby!
			if ( document.getElementById( 'xloader' ) ) {
				setTimeout(function() {  document.getElementById( 'xloader' ).className = "loading_container"; }, 1);
				document.getElementById( 'xloader' ).addEventListener( whichTransitionEvent(), function(){
					//----------------------------------------------------------------------animation done
					console.debug('------mobie: loading screen TRANSITION DONE' );
					this.removeEventListener( whichTransitionEvent(),arguments.callee,false);	//stops event listenter from being called multiple times
					document.body.removeChild( document.getElementById( 'xloader' ) );	//removes it from page
				}, false);
				
				
			} else {
				//not an error, we call this to close loader anytime a window opens to just make sure it is closed!
			}
		}
	}
	
	this.createNewWindowFromURL = function( xID, xURL, xHTML, options ) {
		//----------DYNAMICALLY creates a new window from an external URL
		console.debug('------mobie: createNewWindowFromURL------: '+ xID );
		if ( this.busy ) return;
		if (options == undefined ) options = {};		//just in case user does not define options
		
		if ( this.doesWindowExist.id != xID ) {
			//xHTML can be left empty or not listed at all (if there are no options)
			// 		should also only be html for toolbar and EMPTY content div
			if ( ( xHTML == undefined ) || ( xHTML == '' ) ) {
				//no html was given, so put LOADING SCREEN over the whole interface
				this.showLoadingScreenFull();
				request(
					xURL, null,function() {
						if ( this.readyState == 4) {
							var xdata = this.responseText;
							if ( xdata == '' ) {
								//alert( 'Error loading URL!' );
							} else {
								//OK now we have the html (data) to put into it, use createNewWindowFromHTML to do the rest
								xObject.createNewWindowFromHTML( xID, xdata, options );
								xObject.busy = 0;
							}
						}
					}, 'GET'
				);
			} else {
				//html WAS given, so create the toolbar and content window with it and put loading screen below toolbar, but above content
				
				//create new window with the toolbar & content windows. Add a loading container into the window.
				var xString = xHTML + '<div class="loading_container" style="z-index:8;opacity:1.0;"><div class="loading_window"><div class="loading_text" >Loading</div><div class="animation_block" ><div id="block_1" class="barlittle"></div><div id="block_2" class="barlittle"></div><div id="block_3" class="barlittle"></div><div id="block_4" class="barlittle"></div><div id="block_5" class="barlittle"></div></div></div></div>';
				xObject.createNewWindowFromHTML( xID, xString, options );
				
				request(
					xURL, null,function() {
						if ( this.readyState == 4) {
							var xdata = this.responseText;
							if ( xdata == '' ) {
								//alert( 'Error loading URL!' );
							} else {
								//data is now loaded
								//first check to make sure currentWindow is the one we were loading data for (user might have closed it)
								if ( xObject.currentWindow.id == xID ) {
									//-----------------------------put loaded html into content div
									setTimeout(function() {
										//add a small delay just to make sure that the div has been created
										var xcontent = document.getElementById( xID ).getElementsByClassName("content");
										if ( xcontent.length < 1 ) { alert('error, there is no content div in window: '+ xID ); } else {
											xcontent = xcontent[0];	//gets the content div
										}
										xcontent.innerHTML = xdata;

										var newElement = xObject.doesWindowExist( xID );
										if (newElement.WindowScrollerArray == 0 ) {
											newElement.WindowScrollerArray = xObject.initScrollers( newElement.object );	//any scrollers in this div?
										}
									}, 10);

									//-----------------------------delete the loading screen
									var xloader = document.getElementById( xID ).getElementsByClassName("loading_container");
									if ( xloader.length < 1 ) { alert('error, there is no loader div in window: '+ xID ); } else {
										xloader = xloader[0];	//gets the content div
									}
									setTimeout(function() { document.getElementById( xID ).removeChild( xloader ); }, 500);
									
									
								} else {
									console.debug('------mobie: loaded data was for old window!!!------: '+ xID );
								}
								
							}
						}
					}, 'GET'
				);
			}
			/*
			* Expected behavior for load from URL. 
				---- If there is HTML passed for toolbar then:
				1. call function passing URL and HTML for toolbar
				2. put html in div and LOADING SCREEN above content inside of window
				3. open page with active toolbar (from html)
				4. load content from server
				5. When content arrives, if loaded content is for active window, put content in content window (user could close it while data is loading)
				6. remove LOADING SCREEN

				---- If there is NOT HTML passed for toolbar then:
				1. call function passing URL
				2. open top level LOADING SCREEN
				3. load content.
				4. When content has loaded, put content inside of window.
				5. show window
				6. remove LOADING SCREEN
			*/
			
			
			
			
			
			
			
		} else {
			alert( 'window with that name already exists');
			//eventually i should make this smarter and check to see if html is same, if it is, simply show the window
		}
		
		
		
		
		
		
		
	}
	
	this.createNewWindowFromHTML = function( xID, xhtml, options ) {
		//----------DYNAMICALLY creates a new htmlcode for a window and inserts it into page code (will still need to be made visible with function showWindow)
		console.debug('------mobie: createNewWindowFromHTML------: '+ xID );
		if ( this.busy ) return;
		
		if ( this.DoNextArray.length == 0 ) {
			if ( this.doesWindowExist.id != xID ) {
				//this.busy = 1;
				var newdiv = document.createElement('div');
				newdiv.id = xID;
				newdiv.innerHTML = xhtml;
				//this.renderParts( newdiv );
				//setTimeout(function() {  xObject.initScrollers( newdiv ); }, 100);	//leave this at least 100 due to firefox
				
				//-----set some options
				if (options == undefined ) options = {};		//just in case user does not define options
				if (options.permanentPage == undefined) options.permanentPage = 0;

				setTimeout(function() {  
					document.getElementById( 'mobie' ).appendChild(newdiv);
					if ( xtrans != undefined ) {
						setTimeout(function() {  xInterface.showWindow( xID, options ); }, 1);
					}
				}, 10);
				return newdiv;
			} else {
				alert( 'window with that name already exists');
				//eventually i should make this smarter and check to see if html is same, if it is, simply show the window
			}
		} else {
			//------------we are busy doing something, so do it after everything is done
			console.debug('------mobie: createNewWindowFromHTML------: BUSY *** adding to queue'+ id  );
			var x = function() {
				xObject.createNewWindowFromHTML( xID, xhtml, options );
				setTimeout(function() {  xObject.runDoNext(); }, 10);
			};
			this.DoNextArray.push( x );
		}
			
		
	}
	
	this.allowUserEvent = function() {
		//this function looks at the user event (touch, click, etc) and determines if it is acceptable 
		//		(is app busy doing something else, do we ignore, is touch/click in active window?)
		//			returns true or false
		
		if ( this.busy ) return false;		//user just clicked something else
		
		
		return true;
	}
	
	this.showWindow = function( id, options ) {
		//finds an existing div in the html and makes it visible and active
		console.debug('------mobie: showWindow------: '+ id);
		if ( !this.allowUserEvent() ) return;
		
		if (options == undefined ) options = {};		//just in case user does not define options
		
		if ( this.DoNextArray.length == 0 ) {
			//------------now we actually start the transition to show the new page
			this.busy = 1;
			//------------------create the layer object assigning any functions attached or passed to layer
			var backWindow = 0;
			if ( this.WindowArray.length > 0 ) {
				backWindow = this.currentWindow;
			}
			
			var newElement = this.doesWindowExist( id );	//does it exist? If so return that window object otherwise return false
			if ( !newElement ) {
				//--------------------------------window does not exist so create window object
				var newElement = new Window( id, backWindow, options );
				xtrans = newElement.options.transition;
				this.WindowArray.push(newElement);
			} else {
				//--------------------------------window already exists, but user has sent options, 
				//		so lets make sure they get into the existing window, just in case they have changed
				for (i in options) newElement.options[i] = options[i];
			}
			
			if (options.onOpenStart) {
				newElement.options.onOpenStart.call(newElement, newElement.options.onOpenStart);
			}
			//-------deal with overlay vars here
			var background_overlay = '';
			var newElement_overlay = '';
			if ( newElement.options.overlay ) {
				//top window is an overlay so we will not fully hide back window
				background_overlay = ' behindoverlay';							//hides the back window
				newElement_overlay = ' overlay';
			} else {
				//hide back window
				background_overlay = ' hidden';							//hides the back window
			}
			
			if ( backWindow ) {
				backWindow.object.className = 'active';		//sets appropriate class (z-index) for backwindow
			}
			
			
			
			
			//---------------------------------------------------------------------- WhenTransitionIsDone
			var WhenTransitionIsDone = function() {
				//declare this as a var function simply so i can call it easly from the two places below
				//console.debug('WhenTransitionIsDone' );
				//---------prep back window
				//if ( newElement.options.overlay ) {
					//top window is an overlay so we will not fully hide back window
					//if ( backWindow ) backWindow.object.className = 'active behindoverlay';							//hides the back window
					//var overlay = 'overlay';
				//} else {
					//hide back window
					//if ( backWindow ) backWindow.object.className = 'active hidden';							//hides the back window
					//var overlay = '';
				//}
				if ( backWindow ) backWindow.object.className = 'active'+ background_overlay;
				
				newElement.object.className = 'active front '+ newElement_overlay;										//main window is front and ready
				//---------prep back window (end)
				if (newElement.options.onOpenDone) newElement.options.onOpenDone.call(newElement, newElement.options.onOpenDone);	//check to see if there is a function to run
				xObject.currentWindow = newElement;
				xObject.busy = 0;
				xObject.showLoadingScreenFull(0);
				if (newElement.WindowScrollerArray == 0 ) {
					newElement.WindowScrollerArray = xObject.initScrollers( newElement.object );	//any scrollers in this div?
				}
			}
			//---------------------------------------------------------------------- WhenTransitionIsDone (end)
			
			
			//----------------------------------------------------------------------start the transition
			if ( xtrans == 'instant' ) {
				WhenTransitionIsDone();
			} else {
				//---------first get div ready for transition, put it in its starting location
				newElement.object.className = newElement.options.transition; //xtrans;
				
				//---------give it time to get to its starting location, then start transition and move it to front
				//			longer (100) due to android Firefox :(
				//newElement.object.className = 'active front '+ newElement_overlay;	
				setTimeout(function() {
					newElement.object.className = 'active animated front'+ newElement_overlay; 
				}, 100);	//we have to let the previous class take affect before we change it again
				
				setTimeout(function() {
						WhenTransitionIsDone();
					}, 450);
				
				/*
				//KILLED THIS BECAUSE webkitTransitionEnd DOES NOT ALWAYS FIRE!!!!!!!!!
				//	http://www.cuppadev.co.uk/the-trouble-with-css-transitions/
				
				var xTransitionEvent = whichTransitionEvent();
				console.debug('------mobie: xTransitionEvent: '+ xTransitionEvent );
				newElement.object.addEventListener( xTransitionEvent, function(){
					//----------------------------------------------------------------------animation done
					console.debug('------mobie: showWindow TRANSITION DONE (its now visible)' );
					this.removeEventListener( whichTransitionEvent(),arguments.callee,false);	//stops event listenter from being called multiple times
					WhenTransitionIsDone();
				}, false);
				*/
			}
		} else {
			
			
			//------------we are busy doing something else right now, so do it after everything is done by adding it to the DoNextArray
			console.debug('------mobie: show------: BUSY *** adding to queue'+ id  );
			var x = function() {
				xObject.showWindow( id, options );
				setTimeout(function() {  xObject.runDoNext(); }, 10);
			};
			this.DoNextArray.push( x );
		}
		
		setTimeout(function() {  xObject.runDoNext(); }, 10);
	}
	
	this.closeActiveWindow = function() {
		console.debug('------mobie: closeActiveWindow------: '+ this.currentWindow.id );
		if ( this.busy ) return;
		this.busy = 1; setTimeout(function() {  xObject.busy = 0; }, 500);
		
		//closes the active window (unless of course there is none in history)
		
		if (this.currentWindow.backToWindowObject) {
			var closingWindow = this.currentWindow;	//this.WindowArray[ (this.WindowArray.length - 1) ];
			var xtrans = closingWindow.options.transition;
			
			//first turn the back window visible and get it ready to show
			var backWindow = closingWindow.backToWindowObject;
			backWindow.object.className = 'active';
			
			if (backWindow.options.onOpenStart) backWindow.options.onOpenStart.call(backWindow, backWindow.options.onOpenStart);	//call any functions onOpenStart
			
			var WhenTransitionIsDone = function() {
				//alert( '454');
				//declare this as a var function simply so i can call it easly from the two places below
				console.debug('------mobie: closeActiveWindow------: DONE' );
				closingWindow.object.className = '';
				xObject.possiblyDeleteWindow( closingWindow );
				
				backWindow.object.className = 'active front';
				
				if (closingWindow.options.onCloseDone) closingWindow.options.onCloseDone.call(closingWindow, closingWindow.options.onCloseDone);
				if (closingWindow.options.onActiveAgain) closingWindow.options.onActiveAgain.call(closingWindow, closingWindow.options.onActiveAgain);
				
				xObject.currentWindow = backWindow;
				
				
				//alert( xObject.scrollerArray.length );
				//setTimeout(function() {
					//xObject.scrollerArray[xObject.scrollerArray.length - 1]._resize();
					//alert( xObject.scrollerArray[xObject.scrollerArray.length - 1].wrapper.id );
					//alert( xObject.scrollerArray[xObject.scrollerArray.length - 1].wrapper.parentNode.parentNode.id );
				//	}, 100);
			}
			
			if ( xtrans == 'instant' ) {
				WhenTransitionIsDone();
				
			} else {
				//---------first get div ready for transition, put it in its starting location
				//closingWindow.object.className = 'active animated front '+ xtrans;
				//closingWindow.object.className = closingWindow.options.transition; //xtrans;
				
				//---------give it time to get to its starting location, then start transition and move it to front
				//			longer (100) due to android Firefox :(
				setTimeout(function() {
					console.debug( 'active animated front '+ xtrans );
					closingWindow.object.className = 'active animated front '+ xtrans;
					}, 100);	//we have to let the previous class take affect before we change it again
				
				setTimeout(function() {
						console.debug('------mobie: closeActiveWindow ANIMATION DONE' );
						WhenTransitionIsDone();
					}, 450);
				
				/*
				//KILLED THIS BECAUSE webkitTransitionEnd DOES NOT ALWAYS FIRE!!!!!!!!!
				//	http://www.cuppadev.co.uk/the-trouble-with-css-transitions/
				
				//------------do the transition!
				closingWindow.object.className = 'active animated front '+ xtrans;
				closingWindow.object.addEventListener( whichTransitionEvent(), function(){
					//---------------------closing transition done
					console.debug('------mobie: closeActiveWindow ANIMATION DONE' );
					this.removeEventListener( whichTransitionEvent(),arguments.callee,false);	//stops this from being called multiple times
					WhenTransitionIsDone();
				}, false);
				*/
				
			}
			
			
		} else {
			alert( 'there arent any more windows open, so you cant close this one');
		}
	}
	
	this.possiblyDeleteWindow = function ( tempWindowObject ) {
		//if window is not set as permanent (hard coded into the html or labeled as a keeper when dynamically ccreated) it will be deleted for good...dead
		if ( ! tempWindowObject.options.permanentPage ) {
			//this is NOT a permanent (hard coded) window, so delete
			document.getElementById( "mobie" ).removeChild( tempWindowObject.object );	//removes it from page
			for (var i=0; i<this.WindowArray.length;i++) {
				if ( this.WindowArray[i] == tempWindowObject ) {
					this.WindowArray.splice(i,1);
					console.debug('------mobie: Window deleted------:' );
				}
			}
			
			if ( tempWindowObject.WindowScrollerArray.length > 0 )
				this.deleteScrollers( tempWindowObject.WindowScrollerArray );
		}
	}
	
	this.doesWindowExist = function(xID) {
		//---------checks to see if a window with a specific id exists already (specifically, the permanent ones), if it does, return the window object
		for (var i=0; i<this.WindowArray.length;i++) {
			if ( this.WindowArray[i].id == xID ) {
				return this.WindowArray[i];
			}
		}
		return 0;
	}
	
	//------------------------------------------------------------window management (end)
	
	//---------------dead functions
	this.renderParts = function( xElement ) {
		//this converts certain css class tags to actual html, such as back button for toolbars
		alert( 'this is a dead functino right now');
		return;
		alert('boom');
		//----add table into toolbar
		var toolbarElements = xElement.getElementsByClassName('toolbar');
		for (var i=0; i<toolbarElements.length;i++) {
			xString = '';
			xString = xString+ '<div class="toolbar_table">';
			xString = xString+ '	<div style="display: table-row;">';
			if ( (" " + toolbarElements[i].className + " ").replace(/[\n\t]/g, " ").indexOf(" back ") > -1 ) {
				xString = xString+ '		<div class="toolbar_table_td" style="width:165px;" id="'+ toolbarElements[i].parentNode.id +'_toolbar_left">';
				xString = xString+ '			<div class="gallery_toolbar_xBackButton" ontouchend="xInterface.closeActiveWindow();">BACK</div>';
				xString = xString+ '		</div>';
			} else {
				xString = xString+ '		<div class="toolbar_table_td" style="width:165px;" id="'+ toolbarElements[i].parentNode.id +'_toolbar_left"></div>';
			}
			
			xString = xString+ '		<div class="toolbar_title" style="" >'+ toolbarElements[i].innerHTML +'</div>';
			xString = xString+ '		<div class="toolbar_table_td" style="width:165px;" id="'+ toolbarElements[i].parentNode.id +'_toolbar_right"><div class="sm_but_icon settingsw "></div></div>';
			xString = xString+ '	</div>';
			xString = xString+ '</div>';
			
			toolbarElements[i].innerHTML = xString;
		}
	}
	
	this.SetKeeperWindows = function() {
		alert( 'function SetKeeperWindows is no longer in usage');
		
		/*
		//creates the string of window names that we will never fully delete (usually because they are hardcoded onto the HTML)
		var divs = document.getElementById( 'mobie' );	//.getElementsByTagName("div")
		//alert( divs.childNodes.length );
		for (var i = 0, len = divs.childNodes.length; i < len; i++) {
			if ( divs.childNodes[i].tagName == 'DIV') {
				//alert(divs.childNodes[i].id);
				this.KeeperWindowsString = this.KeeperWindowsString+ divs.childNodes[i].id  +', ';
			}
		}
		//alert( 'KeeperWindowsString set: '+ this.KeeperWindowsString);
		*/
	}
	
	this.backwindow = function() {
		alert( 'function backwindow is no longer in usage!');
		//simply returns the 2nd to last window in windowArray. This is the backwindow after all.
		//return this.currentWindow;
		/*
		if ( xObject.WindowArray.length > 1 ) {
			//return document.getElementById( this.WindowArray[ (this.WindowArray.length - 2) ].id );
			return this.WindowArray[ (this.WindowArray.length - 2) ].object;
		} else {
			return 0;
		}
		*/
	}
	
	this.drawtoolbars = function() {
		alert( 'drawtoolbars not used');
		xString = '<div class="toolbar_top" ></div>';
		var toolbarElements = document.getElementsByClassName('toolbar');
		for (var i=0; i<toolbarElements.length;i++) {
			toolbarElements[i].innerHTML = xString + toolbarElements[i].innerHTML;
			//new touchableObject( toolbarElements[i] );
			//alert( toolbarElements[i].id );
		}
		
		xString = '<div class="toolbar_back_top" ><div class="gallery_toolbar_xBackButton" onclick="xInterface.closeActiveWindow();">BACK</div></div>';
		var toolbarElements = document.getElementsByClassName('toolbarback');
		for (var i=0; i<toolbarElements.length;i++) {
			toolbarElements[i].innerHTML = xString + toolbarElements[i].innerHTML;
			//new touchableObject( toolbarElements[i] );
			//alert( toolbarElements[i].id );
		}
	}
	//---------------dead functions (end)
	
	//this.init();
	return this;
}

function Window ( id, xback, options ) {
	console.debug('------mobie: Window Object created------: '+ id );
	this.id = id;
	if ( !document.getElementById( id ) ) { alert( 'error creating window for div: '+ id ); } else {
		this.object = document.getElementById( id );
	}
	this.backToWindowObject = xback;
	this.WindowScrollerArray = 0;
	this.options = {
		transition: 'slide',
		permanentPage: 1,
		onOpenStart: null,
		onOpenDone: null,
		onCloseDone:null,
		onActiveAgain:null,
		url:null,
		alwaysRefreshURL:0,
		overlay:0,
		alwaysCloseToWindow:0
	}
	// User defined options
	for (i in options) this.options[i] = options[i];
	
	
	if ( this.options.overlay ) {
		console.debug('			--creating overlay holder div' );
		//alert( this.object.innerHTML );
		//var xString = '<div class="" style="position:absolute;left:0px;top:0px;height:100%;width:300px;">'+ this.object.innerHTML +'</div>';
		//this.object.innerHTML = xString;
		
		
		
		//var xbackground = document.createElement('div');
		//xbackground.appendChild( this.object.cloneNode(true) );
		
		//alert( xbackground.innerHTML );
		/*
		//-------------------------------------FIRST WE wrap scroller div inside of a 'wrapper' div
		var xbackground = document.createElement('div');
		xbackground.appendChild( this.object.cloneNode(true) );
		var xHTML = '<div class="content backshadow">' + xbackground.innerHTML +'</div>';
		//var xParent = scrollers[i].parentNode;
		this.object.removeChild( scrollers[i] );
		this.object.innerHTML = xHTML + this.object.innerHTML;
		*/
		
		//var xbackground = document.createElement('div');
		//xbackground.className = "content backshadow";
		//this.object.appendChild(xbackground);
	}
	
	
	//this.zindex = 1;
	//this.id = id;
	//this.transType = xtrans;
	return this;
}


function Layer ( id, xtrans ) {
	console.debug('------mobie: Layer created------: '+ id +', '+ xtrans );
	alert( 'we dont use layer objects any more');
	//this.zindex = 1;
	this.id = id;
	this.transType = xtrans;
	return this;
}


//----------------------------------------------------------functions outside the object

function ChangeStyleSheet( xtitle, xattribute, xvalue, xstylesheet ) {
	//------changes values of a class
	//ChangeStyleSheet('.toolbar_top', 'background', 'red')
	var thecss = new Array();
	thecss = document.styleSheets[ xstylesheet ];
	
	for(var i=0; i<thecss.cssRules.length; i++) {
		//alert( document.styleSheets[i].title );
		var sheet=thecss.cssRules? thecss.cssRules[i]: thecss.rules[i];
		if(sheet.selectorText == xtitle) {
			//alert( 'found: '+ xtitle );
			sheet.style[xattribute]=xvalue;
			return sheet;
		}
	}
	
	alert('please make sure you put styles.css FIRST in your primary webpage calling mobie. Before any other css or any internal css. That should fix this problem: '+ xtitle);
	return false;		//only does this if it does not find the item
}


function whichTransitionEvent(){
	var t;
	var el = document.createElement('fakeelement');
	var transitions = {
		'transition':'transitionEnd',
		'OTransition':'oTransitionEnd',
		'MSTransition':'msTransitionEnd',
		'MozTransition':'transitionend',
		'WebkitTransition':'webkitTransitionEnd'
	}
	for(t in transitions){
		if( el.style[t] !== undefined ){
			return transitions[t];
		}
	}
}

//------------------------functions for loading external files
function XHR() {
    var xhr = false;
    xhr = window.ActiveXObject
        ? new ActiveXObject("Microsoft.XMLHTTP")
        : new XMLHttpRequest();
    return xhr;
}
       
// Build the request and get the reply back, snd is the parameters, with GET this is null, with POST, it is the sent parameters, type is either GET or POST
function request( url, snd, callback, type ) {
    var http = XHR();
    if (http) {
        http.onreadystatechange = callback;
    };
    http.open(type, url, true);
    if (type == "POST") {
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.setRequestHeader("Content-length", snd.length);
        http.setRequestHeader("Connection", "close");
    }      
    http.send(snd);
}
//------------------------functions for loading external files (end)

function preloadimages(arr){
	//load all the images in imageArray then run doneFunction
	//copied from: http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml
	// call back function code could use stuff like: //alert(images.length) //alerts 3//alert(images[0].src+" "+images[0].width) //alerts '1.gif 220'
    var newimages=[], loadedimages=0
    var postaction=function(){}
    var arr=(typeof arr!="object")? [arr] : arr
    function imageloadpost(){
        loadedimages++
        if (loadedimages==arr.length){
            postaction(newimages) //call postaction and pass in newimages array as parameter
        }
    }
    for (var i=0; i<arr.length; i++){
        newimages[i]=new Image()
        newimages[i].src=arr[i]
        newimages[i].onload=function(){
            imageloadpost()
        }
        newimages[i].onerror=function(){
            imageloadpost()
        }
    }
    return { //return blank object with done() method
        done:function(f){
            postaction=f || postaction //remember user defined callback functions to be called when images load
        }
    }
}


function preloadImages( imageArray, doneFunction ) {
	//load all the images in imageArray then run doneFunction
	
}

/*
function testdivheights() {
	var divs = document.getElementsByTagName("div");
	for (var i = 0, len = divs.length; i < len; i++) {
		if ( divs[i].offsetHeight > 800 ) {
			
			alert( divs[i].id +', ' + divs[i].offsetHeight );
		}
	}
}
*/


function countTheKids( parent ){
	alert('dead function countTheKids');
	realKids = 0;
	//parent = document.getElementById("parent");
	kids = parent.childNodes.length;
	while(i < kids){
		if(parent.childNodes[i].nodeType != 3){
			realKids++;
		}
		i++;
	}
	return realKids;
}