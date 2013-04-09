//function customPropertyData() {
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
	//topDomain = get_top_domain();
	//if (topDomain == 'localhost') topDomain = 'denverpost.com';	//added only for dev, delete before live
	
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
		
//}