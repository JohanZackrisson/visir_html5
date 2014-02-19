<?php

function error($error)
{
	die("error: $error");
}

if (!isset($_POST["data"])) error("no data sent");
$data = $_POST["data"];
if (get_magic_quotes_gpc()) $data = stripslashes($data);

$savename = "experiment.cir";
header("Content-Type: application/download");
header('Content-Disposition: attachment; filename="'.$savename.'"');
echo $data;

?>
