<?php sleep(3); 	//delays the output for a bit for testing ?>
<div class="toolbar ">
	<!-- ALL buttons first -->
	<div class="sm_but_icon leftarroww left"  onclick="xInterface.closeActiveWindow();"></div>
	<div class="sm_but_icon settingsw invisible"></div><!-- center title by having same amount of buttons on each side. This one is on right (default) -->
	<!-- then add title -->
	<h1>Hardcoded Window 2</h1>
</div>

<div class="content belowtoolbar pattern" style="">
	<div class="scroller">
		<ul class="list">
			<li onclick="openNewRandomWindow('windowOne');">Item One</li>
			<li onclick="openNewRandomWindow('windowTwo');">Item Two</li>
			<li onclick="openNewRandomWindow('windowThree');">Item Three</li>
		</ul>
		<ul class="list">
			<li onclick="xInterface.showWindow( 'window_3');">Item One</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
			<li class="no_action">No Action List Item</li>
		</ul>
	</div>
</div>