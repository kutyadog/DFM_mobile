//function customPropertyData() {
	//----Eventually I will pull each properties data from the server
	//		So, for example, this property (denver) would call to server passing unique property id
	//		The server would then send back a JSON array with all the properties data,
	//		including property title, activeSection and an array of all the sections and their corresponding feeds (below)
	
	
	
	xFeedList = new Array(
			{ 'title' : 'Business', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/235292.xml' },
			{ 'title' : 'Breaking News', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/235294.xml' },
			{ 'title' : 'Columnists', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/230203.xml' },
			{ 'title' : 'Entertainment', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/235296.xml' },
			{ 'title' : 'Health', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/235299.xml' },
			{ 'title' : 'Living', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/235297.xml' },
			{ 'title' : 'Local News', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/235293.xml' },
			{ 'title' : 'Opinion', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/235290.xml' },
			{ 'title' : 'Sports', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/235291.xml' },
			{ 'title' : 'Preps', 'url' : 'http://feeds.elpasotimes.com/mngi/rss/CustomRssServlet/525/215701.xml' }
		);
	
	//alert( xFeedList[0].title );
	//alert( xFeedList[0].url );
	
	propertyTitle = 'El Paso Times';
	activeSection = 6;		//breaking news
	propertySplashImage = 'splash.gif';
	backgroundsplash = 'f2f8fe';				//el paso 'f2f8fe'
	AppleAppID = "375264133"; 					//dnt have yet for el paso
	//topDomain = get_top_domain();
	//if (topDomain == 'localhost') topDomain = 'elpasotimes.com';	//added only for dev, delete before live
//}