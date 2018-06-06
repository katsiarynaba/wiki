<?
	header('Content-Type:application/json');

	$url = $_GET['url'];

	$doc = new \DOMDocument();
	@$doc->loadHTMLFile($url);
	$xpath = new \DOMXPath($doc);	
	

	//$elements = $xpath->query("//div[@id='file']//a");
	$elements = $xpath->query('//span[contains(@class,"mw-filepage-other-resolutions")]//a[1]');
	$filename = false;
	//echo count($elements);
	if(count($elements) > 0){
		foreach ($elements as $element) {
			//echo $filename;
			$filename = $element->getAttribute('href');
			
		}

	}
	$result = new stdClass();
	$result->src = $filename;
	echo json_encode($result);

?>