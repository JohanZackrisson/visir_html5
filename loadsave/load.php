<?php

function error($error)
{
	die("error: $error");
}

$filename = null;
if (isset($_FILES["filename"]["tmp_name"])) $filename = $_FILES["filename"]["tmp_name"];

if (!$filename) die("no file submitted");
if (!is_uploaded_file($filename)) error("possible file upload attack");
$file = fopen($filename, "r");
$filesize = filesize($filename);
if ($filesize <= 0) error("file empty");
if ($filesize >= 65535) error("file to big");
$contents = fread($file, $filesize);
fclose($file);

echo $contents;

?>
