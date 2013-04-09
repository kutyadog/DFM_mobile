<?php
//jsonServLet.php
//sleep(3);
//$xURL = 'http://extras.denverpost.com/media/MRSS/Breaking_News_230605.xml'
$xURL = 'http://www.'. $_GET["p"] .'/mngi/servletDispatch/JsonArticleServlet.dyn?ci='. $_GET["x"] .'&includeBody=true';
//$xURL = 'denvertest.xml';
$xsourcefile = file_get_contents( $xURL );

//var xURL = 'jsonServLet.php?x=http://www.'+ topDomain + '/mngi/servletDispatch/JsonArticleServlet.dyn?ci=' + xID +'&includeBody=true;


echo $xsourcefile;
/*
$xsourcefile = str_replace(":encoded",'',$xsourcefile);$xsourcefile = str_replace(":creator",'',$xsourcefile);$xsourcefile = str_replace(":content",'',$xsourcefile);$xsourcefile = str_replace(":source",'',$xsourcefile);
$xml = simplexml_load_string($xsourcefile,'SimpleXMLElement', LIBXML_NOCDATA);
//$xml = simplexml_load_string($xsourcefile);

//$propertyID  = explode(".xml",$xml->channel->dc);//568;//$xml->channel->title;
//$propertyID  = explode("/",$propertyID[0]);
//$sectionID = $propertyID[ count( $propertyID ) - 1];
//$propertyID = $propertyID[ count( $propertyID ) - 2 ];

//-----------------
$sectionTitle = $xml->channel->title;

$articleArray = array();
foreach ($xml->channel->item as $article) {
	$storyArray = array();
	//echo $article->title . '<BR>';
	//echo $article->description . '<BR>';
	//echo processTime( $article->pubDate );
	//$descriptions = $article->getElementsByTagName('description');
	
	array_push($articleArray, 
			array( 	'title' => trim(processSafeText( $article->title)), 
					'pubDate' => processTime($article->pubDate), 
					'lastUpdate' => $article->lastUpdated,
					'description' => processArticle($article->description),
					'link' => $article->link, 
					'media' => $article->media, 
					) );
	
}
//processSafeText( (string)
//echo json_encode($articleArray);

$base64 = base64_encode(gzcompress(json_encode($articleArray),9));
echo $base64;

//echo 'fun: '. $xml->channel->title;
//$flagstatus = $xml->heartbeat->currentFlag;
//$Commentary = explode("- ",$Commentary);
//foreach ($xml->item as $xdriver) {
//	$rank = $xdriver->rank;
//}

//echo $contents;

function processArticle( $xString ) {
	$xString = preg_replace("/<iframe[^>]+\>/i", "", $xString);
	
	
	return $xString;
}

function processTime( $xString ) {
	//echo date('U', strtotime( $xString )) . '<BR>';
	return date('D, M. j, Y', strtotime( $xString ));
	//return $xString;
}

function processSafeText ( $xString ) {
	$xString = str_replace("'",'&#39;',$xString);
	$xString = str_replace("*",'&#42;',$xString);
	$xString = str_replace("^",'&#94;',$xString);
	$xString = str_replace("@",'&#64;',$xString);
	$xString = str_replace("‘",'&lsquo;',$xString);
	$xString = str_replace("’",'&rsquo;',$xString);
	$xString = str_replace("'",'&#39;',$xString);
	$xString = str_replace('"','&quot;',$xString);
	$xString = str_replace('“','&quot;',$xString);
	$xString = str_replace('”','&quot;',$xString);
	return $xString;
}
*/


/*
$xml = <<<EOD
<?xml version='1.0' ?>
<document>
<thing>
  <description><![CDATA[The first thing]]></description>
</thing>
<thing>
  <description><![CDATA[The second thing]]></description>
</thing>
</document>
EOD;
$dom = new DOMDocument();
$dom->loadXML($xml);
$descriptions = $dom->getElementsByTagName('description');
foreach($descriptions as $desc)
{
   echo "<p>".$desc->textContent."</p>\n";
}
*/

?>
