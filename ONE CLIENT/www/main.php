<?php
	require ("logincheck.php");
?> 
    
<html>
	<body>
		Welcome <?php echo $_SESSION["email"] ?>.

<a href="logout.php">LOG OUT</a>
<button onclick="document.location='logout.php'">HTML Tutorial</button>

	</body>
</html>