<?php 

$con = mysql_connect("localhost","root","root");if (!$con) { die('Could not connect: ' . mysql_error()); }
mysql_select_db("mobile_t", $con) or die(mysql_error());

//processApIDs();

createPropFiles();

//processBigDataFile();

//checkActiveForAllFeeds();

function processBigDataFile() {
	//echo 'hi';
	$xfile= 'dfm_site_data.txt';
	$fileData = file_get_contents($xfile);
	//echo '--------'. $fileData .'<BR>'; 
	$fileData = explode("\n",$fileData);
	
	//Site name|||URL|||Domain|||Company|||Platform|||Geo|||City|||Zip code|||FB Page|||FB App ID|||FB Secret|||yahoo pub id|||yahoo site name|||omniture account|||twitter page|||twitter short name|||Disqus API key|||Disqus User API key|||MyCapture URL|||Media Center URL|||Smug API Key|||Smug Secret|||Smug Token|||Smug URL|||Favicon URL|||NA
	
	foreach ($fileData as $xline) {
		$xline = explode("|||",$xline);
		echo $xline[5] .' ----  '. $xline[0] .'<BR>'; 
		//echo '--------'. $xline[1] .' ----  '. $xline[2] .'<BR>'; 
		
		//$query = 'UPDATE m_properties SET omnitureID = "'. $xline[13] .'" WHERE base_url LIKE "%'. $xline[2] .'.com%" ';	//omniture update
		//$query = 'UPDATE m_properties SET company = "'. $xline[3] .'" WHERE base_url LIKE "%'. $xline[2] .'.com%" ';	//company update
		$query = 'UPDATE m_properties SET geo = "'. $xline[5] .'" WHERE base_url LIKE "%'. $xline[2] .'.com%" ';	//geo update
		
		
		//$query = mysql_query($query) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error());

		//while($row = mysql_fetch_array($query)){
		//	$xTemp = file_get_contents( $row['url'] );
			
	}
	
}

function processApIDs() {
	$xfile= 'apids.csv';
	$fileData = file_get_contents($xfile);
	$fileData = explode("\n",$fileData);
	
	
	
	foreach ($fileData as $xline) {
		$device = 'iphone';
		$jrc 	= 0;
		$xline = explode(",",$xline);
		$title = $xline[0];
		if (strpos($title, 'iPad') !== FALSE) {
			$device = 'ipad';
		}
		if (strpos($title, '(JRC)') !== FALSE) {
			$jrc = 1;
			$title = str_replace("(JRC)","",$title);
		}
		
		$title = str_replace("for","",$title);
		$title = str_replace("iPhone","",$title);
		$title = str_replace("iPad","",$title);
		$title = str_replace("The ","",$title);$title = str_replace("the","",$title);
		$title = ltrim(trim(str_replace("  "," ",$title)));
		//$title = str_replace("-","",$title);
		echo $title .'<BR>';
		
		$query = 'SELECT * FROM m_properties WHERE title LIKE "%'. $title .'%"';
		//$query = 'SELECT * FROM m_properties WHERE title = "'. $title .'"';
		$query = mysql_query($query) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error());
		
		while($row = mysql_fetch_array($query)){
			echo '-------'. $row['title'] .'<BR>';
			if ( $device == 'ipad' ) {
				$xquery = 'UPDATE m_properties SET apID_tablet = "'. $xline[1] .'" WHERE xnum = '. $row['xnum'];
			} else {
				$xquery = 'UPDATE m_properties SET apID = "'. $xline[1] .'" WHERE xnum = '. $row['xnum'];
			}
			
			//$query = 'SELECT * FROM m_properties WHERE title = "'. $title .'"';
			$xquery = mysql_query($xquery) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $xquery . "<br />\nError: (" . mysql_errno() . ") " . mysql_error());
		}
		
		//https://itunes.apple.com/us/app/dropbox/id520232370
		
		//$row = mysql_fetch_array($query);
		//echo $row['xnum'] .'<BR>'; 
	}
	/*
	The Reporter for iPhone (JRC),525105540,,
	The Reporter for iPad (JRC),568473750,,
	The Record for iPhone,520232370,,
	The Record for iPad,571785254,,
	The Times Herald for iPhone (JRC),525130019,,
	Times Herald for iPad (JRC),568465234,,
	*/
}

function checkActiveForAllFeeds() {
	$query = 'SELECT xnum, url, active FROM m_feeds WHERE xType = "feed" and xnum >= 2972';
	$query = mysql_query($query) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error());
	
	while($row = mysql_fetch_array($query)){
		$xTemp = file_get_contents( $row['url'] );
		$xActive = 1;
		if ( $xTemp == '' ) {
			$xActive = 0;
		}
		if ( $xActive != $row['active'] ) {
			$xquery = 'UPDATE m_feeds SET active = '. $xActive .' WHERE xnum = '. $row['xnum'];
			$xquery = mysql_query($xquery) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error());
		}
		echo $row['url'].'---------- '. $xActive .'<BR>';
	}
}

function createPropFiles() {
	$query = 'SELECT * FROM m_properties WHERE 1';		// LIMIT 2
	$query = mysql_query($query) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error());
	
	$listHTML = '';
	
	while($row = mysql_fetch_array($query)){
		if ( $row['base_url'] != '' ) {
			//create dir
			$xDirName = '../props/'. $row['base_url'];
			echo 'Creating dir: '. $row['base_url'] . '<BR>';
			mkdir( $xDirName, 0777);	//does not erase content, just creates it if it is not there
			
			$listHTML = $listHTML . '<a href="../?url='. $row['base_url'] .'">'. $row['base_url'] .'</a><BR>';
			
			//-----create JS file
			$xString = "

				//---------------custom property code
				propData.xFeedList = new Array(";

			//query feeds for that property!!!
			$xquery = 'SELECT * FROM m_feeds WHERE prop_num = "'. $row['title'] .'" and xType = "feed" and active = 1';
			$xquery = mysql_query($xquery) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error());
			$x = 0;
			while($xrow = mysql_fetch_array($xquery)){
				$xString = $xString ."
					{ 'title' : '". htmlspecialchars( $xrow['title'] , ENT_QUOTES)."', 'url' : '". $xrow['url']."', 'type' : '". $xrow['conv_format']."' },";
				
				if ( ( $xrow['title'] == 'Breaking News' ) && ($row['active_section'] == 0) ) {
					$row['active_section'] = $x;
				}
				$x= $x + 1;
			}
			$xString = substr($xString, 0, -1);	//remove the last comma

			$xString = $xString ."
				);

				propData.propertyTitle = '". $row['title'] ."';
				propData.activeSection = ". $row['active_section'] .";		//usually breaking news
				propData.htmltitle = '". $row['htmltitle'] ."';
				
				propData.omnitureID = '". $row['omnitureID'] ."';
				propData.geo	    = '". $row['geo'] ."';
				propData.company	= '". $row['company'] ."';
				
				//----------css vars
				propData.backgroundsplash = '". $row['splash_color'] ."';
				propData.bodycolor = '". $row['bodycolor'] ."';
				propData.toolbar1 = '". $row['toolbar1'] ."';
				propData.toolbar2 = '". $row['toolbar2'] ."';
				
				propData.AppleAppID = '". $row['apID'] ."';
				propData.AppleAppIDTablet = '". $row['apID_tablet'] ."';
				propData.ngps = ". $row['ngps'] .";

			";

			CreateFileWithContent( $xDirName .'/prop.js', $xString );

			//-----create CSS file
			$xString = '';
			CreateFileWithContent( $xDirName .'/prop.css', $xString );
		} else {
			echo '--No URL for: '. $row['title'] . '<BR>';
		}
		
		
	}
	
	//create listing file
	CreateFileWithContent( '../props/listing.html', $listHTML );
	
	//update htmltitle in mysql:
	//UPDATE m_properties set htmltitle = CONCAT( htmltitle, " ", title) WHERE 1;
	
}

function CreateFileWithContent( $xURL, $xContent ) {
	//$file = fopen('files/'.$xCount.'.xml', 'x+');
	//$content = str_replace("</timing_results>","<count><data>".$xCount.".xml</data></count></timing_results>",$content);
	//$content = $content . '<a href="http://www.w3schools.com/">Visit W3Schools!</a> ';
	$file = fopen( $xURL , "w");
	fwrite($file, $xContent);
	fclose($file);
}

function processFile( $xfile ) {
	//preparing the data
	// csv, find replace all commas with * (first make sure there are no astericks)
	$fileData = file_get_contents($xfile);
	$fileData = explode("\n",$fileData);
	$x = 0;
	$prop = '';
	
	foreach ($fileData as $xline) {
		$xline = explode(",",$xline);
		
		if ( $xline[0] ) {
			//--------------------this line tells us what property it is
			$prop = $xline[0];
			echo '--------'. $prop .'<BR>';
			
			$ID = explode("/",$xURL);
			$ID = $ID[count($ID) - 2];
			//if (ctype_digit($ID)) {
				$query = 'INSERT INTO m_properties (title, id) VALUES ( "'. $prop .'", "0")';
				mysql_query($query) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error());
				//echo "ID = ". $ID. '<BR>';
			//}
			
			
			
		} else if ( ( $xline[2] ) && ( $xline[3] ) ) {
			$title = $xline[2];
			$xURL = str_replace("*",",",$xline[3]);
			$good = $xline[4];
			$convergenceURL = '';
			$conv_format = 0;
			$xType = 'feed';
			$d_id = $xline[1];
			//echo $xURL .'<BR>';
			
			if ( $good == 1 ) {
				//echo $title .'<BR>';
				if (strpos($xURL, 'http://photos.') !== FALSE) {
					//ssp gallery
					$xType = 'ssp';
					
				} else if (strpos($xURL, 'dropbox.com') !== FALSE) {
					$xType = 'db';
				} else if (strpos($xURL, 'http://api.eventful') !== FALSE) {
					$xType = 'event';
				} else if (strpos($xURL, 'fyidriving.com') !== FALSE) {
					$xType = 'fyid';
				} else if (strpos($xURL, 'mycapture.com') !== FALSE) {
					$xType = 'fyid';
				} else {
					
				}
				
				if (strpos($xURL, '&uri=') !== FALSE) {
					//its convergence URL
					$convergenceURL = $xURL;
					$xURL = explode("&uri=",$xURL);
					$xURL = $xURL[1];

					$conv_format = explode("ormat=",$convergenceURL);
					$conv_format = explode("&",$conv_format[1]);
					$conv_format = $conv_format[0];
				}
				
				//echo $prop .", ". $title. '<BR>';
				$query = 'INSERT INTO m_feeds (prop_num, title, url, conv_url, xType, datasourceID, conv_format) VALUES ( "'. $prop .'", "'. $title .'", "'. $xURL .'", "'. $convergenceURL .'", "'. $xType .'", "'. $d_id .'", "'. $conv_format .'")';
				mysql_query($query) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error()); 

				
			} else {
				echo 'error<BR>';
			}
			
			/*


			

			if ( 1 ) {
				$xTemp = file_get_contents($xline[2]);
				//echo $xTemp.'----------<BR><BR><BR>';
				if ( $xTemp == '' ) {
					echo 'empty!'. '<BR>';
				} else {
					echo $prop .", ". $title. '<BR>';
					$query = 'INSERT INTO m_feeds (prop_num, title, url, conv_url, xType) VALUES ( "'. $prop .'", "'. $title .'", "'. $xURL .'", "'. $convergenceURL .'", "'. $xType .'")';
					mysql_query($query) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error()); 

					if ( $o_prop_name != $prop ) {
						$ID = explode("/",$xURL);
						$ID = $ID[count($ID) - 2];
						if (ctype_digit($ID)) {
							$query = 'INSERT INTO m_properties (title, id) VALUES ( "'. $prop .'", "'. $ID .'")';
							mysql_query($query) or die("<b>A fatal MySQL error occured</b>.\n<br />Query: " . $query . "<br />\nError: (" . mysql_errno() . ") " . mysql_error());
							$o_prop_name = $prop;
							$o_prop_num = $ID;
							//echo "ID = ". $ID. '<BR>';
						}

					}
				}


			}
			*/
			$x=$x+1;
		}
		
	}
	
	
}



?>