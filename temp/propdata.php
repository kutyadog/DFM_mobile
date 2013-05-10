<?php
//jsonServLet.php
//sleep(3);
//$xURL = 'http://extras.denverpost.com/media/MRSS/Breaking_News_230605.xml'
$xURL = 'http://www.'. $_GET["p"] .'/mngi/servletDispatch/JsonArticleServlet.dyn?ci='. $_GET["x"] .'&includeBody=true';
//$xURL = 'denvertest.xml';
$xsourcefile = file_get_contents( $xURL );
//var xURL = 'jsonServLet.php?x=http://www.'+ topDomain + '/mngi/servletDispatch/JsonArticleServlet.dyn?ci=' + xID +'&includeBody=true;


echo $xsourcefile;


?>