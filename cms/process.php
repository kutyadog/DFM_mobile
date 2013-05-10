<?php 

$con = mysql_connect("localhost","root","root");if (!$con) { die('Could not connect: ' . mysql_error()); }
mysql_select_db("mobile_t", $con) or die(mysql_error());

processFile('sdx.csv');

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


function processPlayerFile( $xfile, $player_name ) {
	$fileData = file_get_contents($xfile);
	$fileData = explode("\n",$fileData);
	
	//$player_name = "Troy Aikman";
	$player_season_count = 1;
	$player_first_season = 0;
	foreach ($fileData as $xline) {
		//1,1989,1,9/10/89,22-293,DAL,L 0-28,*,17,35,48.60%,180,0,2,5.14 
		$xline = explode( ',', $xline );
		if ( $player_first_season == 0 ) {
			$player_first_season = $xline[1];
		}
		$player_season_count = $xline[1] - $player_first_season + 1;
		$age = explode( '-', $xline[4] );
		$win = explode( ' ', $xline[6] );
		$score = explode( '-', $win[1] );
		$query = "INSERT INTO luck (player, career_game_num, year, player_year, game_num, date, age, team, win, score_us, score_them, GS, completions, attempts, comp_perc, yards, tds, ints) VALUES ( '". $player_name ."', '". $xline[0] ."', '". $xline[1] ."', '". $player_season_count ."', '". $xline[2] ."', '". $xline[3] ."', '". $age[0] ."', '". $xline[5] ."', '". $win[0] ."', '". $score[0] ."', '". $score[1] ."', '". $xline[7] ."', '". $xline[8] ."', '". $xline[9] ."', '". $xline[10] ."', '". $xline[11] ."', '". $xline[12] ."', '". $xline[13] ."')";
		
		//$query = "INSERT INTO Persons (player, career_game_num, year, player_year, game_num, date, age, team, win, score_us, score_them, GS, completions, attempts, comp_perc, yards, tds, ints) VALUES ( $player_name, $xline[0], $xline[1], $player_season_count, $xline[2], $xline[3], $age[0])";
		mysql_query($query);
		echo $query . '<BR>';
	}
	
	
}

?>