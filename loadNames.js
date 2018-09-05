var url = require('url');
var http = require('http');
var fs = require('fs');
var sizeOf = require('image-size');
var sqlite3 = require("sqlite3").verbose();  // use sqlite

/*for google vision api call*/
var APIrequest = require('request');

//http.globelAgent.maxSockets = 1;
var db = new sqlite3.Database('PhotoQ.db');
var count = 0;
// code run on startup
loadImageList();

function loadImageList () {
	var data = fs.readFileSync('photoList.json');
	if (! data) {
		console.log("cannot read photoList.json");
	} else {
		console.log("read photoList.json");
		listObj = JSON.parse(data);
		imgList = listObj.photoURLs;
	}
}

function getSize(ind,name,cbFun){
	var imgUrl = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/"+ imgList[ind];
	var options = url.parse(imgUrl);


	http.get(options, function (response) {
		var chunks = [];
		response.on('data', function (chunk) {
			chunks.push(chunk);
		}).on('end', function() {
			var buffer = Buffer.concat(chunks);
			dim = sizeOf(buffer);
			cbFun(ind,name,dim.width,dim.height);
		});
	});



}

for(var i=0; i< imgList.length; i++){
	var name = imgList[i].replace("&#39;", "%26%2339%3b");
	//	name = temp.split(".jpg")[0];
	//	name = name.split(".JPG")[0];
	//	name = name.split(".jpeg")[0];
	//	name = name.split(".JPEG")[0];
	getSize(i,name,cbFun);
	//	console.log(i);
}

function cbFun(i,name,width, height){
	// adding to database
	// for(var i=0; i < imgList.length; i++){
	//			console.log("Inserting ");
	cmdStr = ' INSERT OR REPLACE INTO photoTable VALUES (' + i + ', "name", ' + width + ', ' + height + ', "","") ';
	cmdStr = cmdStr.replace("name",name);
	// console.log(cmdStr);
	db.run(cmdStr, dbCallback);
	// }
	//db.close();
}

function dbCallback(err){
	if(err) {console.log(err); }
	else {
		count++;
		//		console.log("Inserted");
		if(count == imgList.length) {
			//dumpDB();
			console.log("Images Inserted into Database");
			var name = encodeURIComponent(imgList[0]);
			APIrequestObject = {
				"requests": [
					{
						"image": {
							"source": {"imageUri": "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg"}
						},
						"features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
					}
				]
			}
			APIrequestObject.requests[0].image.source.imageUri = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + name;
			//console.log(APIrequestObject.requests[0].image);
			annotateImage(i,APIrequestObject);
			/*updateDatabaseTags();
			setTimeout(updateDatabaseTagsEnd, 200000);*/
			/*for(var i = 0; i < imgList.length; i++){
				APIrequestObject.requests[0].image.source.imageUri = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + imgList[i];
				//console.log(APIrequestObject.requests[0].image);
				annotateImage(i,APIrequestObject);
			}*/
		}
	}
}

function dumpDB(){
	db.all('SELECT * FROM photoTable', dataCallback);
	function dataCallback(err,data){
		console.log(data)
	}
}

// An object containing the data the CCV API wants
// Will get stringified and put into the body of an HTTP request, below


googleurl = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDOmK9q1xrobtJ5EVecO-3W5jc78yMOOY8';
var count1 = 0;

// function to send off request to the API
function annotateImage(ind,APIrequestObj) {
	// The code that makes a request to the API
	// Uses the Node request module, which packs up and sends off
	// an HTTP message containing the request to the API server
	APIrequest(
		{ // HTTP header stuff
			url: googleurl,
			method: "POST",
			headers: {"content-type": "application/json"},
			// will turn the given object into JSON
			json: APIrequestObj
		},
		// callback function for API request
		APIcallback
	);


	// callback function, called when data is received from API
	function APIcallback(err, APIresponse, body) {
		if ((err) || (APIresponse.statusCode != 200)) {
			console.log("Got API error at ",ind );
			console.log("error body ", body);
		} else {
			APIresponseJSON = body.responses[0];
			console.log("Image ", APIrequestObj.requests[0].image.source.imageUri);
			console.log(APIresponseJSON);
			cmdStr = ' UPDATE photoTable SET locationTag = \'landmark\', tags = \'label\' WHERE idNum = ind';
			var labelFlag = 0;
			if(APIresponseJSON.labelAnnotations == null){
				cmdStr = ' UPDATE photoTable SET locationTag = \'landmark\' WHERE idNum = ind';
				labelFlag = 1;
				console.log("NO LABEL");
			}
			if(APIresponseJSON.landmarkAnnotations == null){
				if(labelFlag == 1){
					cmdStr = cmdStr.replace("landmark", "");
					console.log("NO LABEL and NO LANDMARK");
				}
				else {
					cmdStr = cmdStr.replace("locationTag = \'landmark\', ", "");
					console.log("NO LANDMARK");
				}
			}
			else if(APIresponseJSON.landmarkAnnotations[0].description == null){
				if(labelFlag == 1){
					cmdStr = cmdStr.replace("landmark", "");
					console.log("NO LABEL and NO LANDMARK");
				}
				else {
					cmdStr = cmdStr.replace("locationTag = \'landmark\', ", "");
					console.log("NO LANDMARK");
				}
			}
			else {
				var landmarkdesc = APIresponseJSON.landmarkAnnotations[0].description;
				landmarkdesc = landmarkdesc.replace("\'", "");
				landmarkdesc = landmarkdesc.replace("\"", "");
				cmdStr = cmdStr.replace("landmark", landmarkdesc);

			}
			cmdStr = cmdStr.replace("ind", ind);
			if(labelFlag == 0){
				var labelStr = APIresponseJSON.labelAnnotations[0].description;
				labelStr = labelStr.replace("\'", "");
				labelStr = labelStr.replace("\"", "");
				for(var i = 1; i < APIresponseJSON.labelAnnotations.length && i < 6; i++){
					var labelStr1 = APIresponseJSON.labelAnnotations[i].description;
					labelStr1 = labelStr1.replace("\'", "");
					labelStr1 = labelStr1.replace("\"", "");
					labelStr = labelStr + "," + labelStr1;
				}
				cmdStr = cmdStr.replace("label", labelStr);

			}
			console.log(cmdStr);
			db.run(cmdStr,dbCallback1);
		}
	} // end callback function

	function dbCallback1(err){
		if(err) {
			console.log(err);
		}
		else {
			count1++;

			if(count1 == imgList.length) {
				console.log("UPDATED databases with tags from Google API");
				//dumpDB();
				db.close();
			}
			else{
				var name = encodeURIComponent(imgList[count1]);
				APIrequestObject = {
					"requests": [
						{
							"image": {
								"source": {"imageUri": "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg"}
							},
							"features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
						}
					]
				}
				APIrequestObject.requests[0].image.source.imageUri = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + name;
				//console.log(APIrequestObject.requests[0].image);
				annotateImage(count1,APIrequestObject);
			}
		}
	}

	function dumpDB(){
		db.all('SELECT * FROM photoTable', dataCallback);
		function dataCallback(err,data){
			console.log(data)
		}
	}

} // end annotateImage


// Do it!
function updateDatabaseTags(){
	for(var i = 0; i < 500; i++){
		var name = encodeURIComponent(imgList[i]);
		APIrequestObject = {
			"requests": [
				{
					"image": {
						"source": {"imageUri": "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg"}
					},
					"features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
				}
			]
		}
		APIrequestObject.requests[0].image.source.imageUri = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + name;
		//console.log(APIrequestObject.requests[0].image);
		annotateImage(i,APIrequestObject);
	}
}

function updateDatabaseTagsEnd(){
	for(var i = 500; i < imgList.length; i++){
		var name = encodeURIComponent(imgList[i]);
		APIrequestObject = {
			"requests": [
				{
					"image": {
						"source": {"imageUri": "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/Royal%20Palace%2c%20Rabat.jpg"}
					},
					"features": [{ "type": "LABEL_DETECTION" },{ "type": "LANDMARK_DETECTION"} ]
				}
			]
		}
		APIrequestObject.requests[0].image.source.imageUri = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + name;
		//console.log(APIrequestObject.requests[0].image);
		annotateImage(i,APIrequestObject);
	}
}
