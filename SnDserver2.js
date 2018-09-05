var static = require('node-static');
var http = require('http');
var util = require('util');
var fs = require('fs');  // file access module
var sqlite3 = require("sqlite3").verbose();

var fileServer = new static.Server('./public', { cache: 0 });
var db = new sqlite3.Database('PhotoQ.db');
var imgList = [];

var auto = require("./makeTagTable");
var tagTable = {};   // global
auto.makeTagTable(tagTableCallback);
function tagTableCallback(data) {
	tagTable = data;
	console.log("Table loaded");
}



// code run on startup
/*loadImageList();*/

console.log("Server Runing");

/*function loadImageList () {
	var data = fs.readFileSync('photoList.json');
	if (! data) {
		console.log("cannot read photoList.json");
	} else {
		listObj = JSON.parse(data);
		imgList = listObj.photoURLs;
	}
}*/

function handler (request, response) {
	var url = request.url;
	queryUrl = url.split("/")[2];

	request.addListener('end', function () {
		//			console.log(url.split("=")[0]);
		// Serve files!
		if(url.split("/")[1] == "query"){
			//			console.log(url.split("/")[1]);
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<p>You asked for image <code>" + queryUrl + "</code></p>");
			response.end();
		}
		else if(url.split("=")[0] == "/query?num"){
			var imageNum = url.split("=")[1];
			response.writeHead(200, {"Content-Type": "text/html"});

			if( !(imageNum < 989 && imageNum > 0) ){
				response.write("Bad Request");
			}
			else {
				response.write(imgList[imageNum]);
			}
			response.end();
		}
		else if(url.split("=")[0] == "/query?deleteTag"){
			var imageTags = url.split("=")[1];
			console.log(imageTags);
			//imageTags = decodeURIComponent(imageTags);
			deletTagInfo = imageTags.split("+");
			deletTagInfo[0] = decodeURIComponent(deletTagInfo[0]);
			//console.log("deleteTag in DB ", deletTagInfo);
			response.writeHead(200, {"Content-Type": "application/json"});

			var cmdStr = ' SELECT tags FROM photoTable WHERE idNum = number ';
			cmdStr = cmdStr.replace("number", deletTagInfo[1]);
			//console.log(cmdStr);
			db.all(cmdStr, dataCallback);
			function dataCallback(err,rowData){
				if(err){
					console.log("error: ", err);
					response.write("error");
					response.end();
				}
				else{
					//console.log("error: ", err);
					//console.log("got: ", rowData[0].tags, "\n");
					tagStr1 = rowData[0].tags.split(",");
					tagStr = [];
					tagStr1.map(function(e) {
						if(e != deletTagInfo[0]){
							tagStr.push(e);
						}
					});
					tagStr = tagStr.join(",");
					var cmdStr = ' UPDATE photoTable SET tags = \'' + tagStr + '\' WHERE idNum = ' + deletTagInfo[1];
					//console.log("cmdStr Update: \n",cmdStr);

					db.all(cmdStr, dataCallback1);
					function dataCallback1(err1,rowData1){
						if(err1){
							console.log("error: ", err1);
							response.write("error");
							response.end();
						}
						else{
							console.log("Response Sent: \n",tagStr);
							auto.makeTagTable(tagTableCallback);
							function tagTableCallback(data) {
								tagTable = data;
							}
							response.write(tagStr);
							response.end();
						}
					}

				}
			}
		}
		else if(url.split("=")[0] == "/query?addTag"){
			var imageTags = url.split("=")[1];
			//console.log(imageTags);
			//imageTags = decodeURIComponent(imageTags);
			deletTagInfo = imageTags.split("+");
			deletTagInfo[0] = decodeURIComponent(deletTagInfo[0]);
			//console.log("deleteTag in DB ", deletTagInfo);
			response.writeHead(200, {"Content-Type": "application/json"});

			var cmdStr = ' SELECT tags FROM photoTable WHERE idNum = number ';
			cmdStr = cmdStr.replace("number", deletTagInfo[1]);
			//console.log(cmdStr);
			db.all(cmdStr, dataCallback);
			function dataCallback(err,rowData){
				if(err){
					console.log("error: ", err);
					response.write("error");
					response.end();
				}
				else{
					////console.log("error: ", err);
					//console.log("got: ", rowData[0].tags, "\n");
					tagStr = rowData[0].tags + "," + deletTagInfo[0];

					var cmdStr = ' UPDATE photoTable SET tags = \'' + tagStr + '\' WHERE idNum = ' + deletTagInfo[1];
					//console.log("cmdStr Update: \n",cmdStr);

					db.all(cmdStr, dataCallback1);
					function dataCallback1(err1,rowData1){
						if(err1){
							console.log("error: ", err1);
							response.write("error");
							response.end();
						}
						else{
							console.log("Response Sent: \n",tagStr);
							auto.makeTagTable(tagTableCallback);
							function tagTableCallback(data) {
								tagTable = data;
							}
							response.write(tagStr);
							response.end();
						}
					}
				}
			}
		}
		else if(url.split("=")[0] == "/query?autocomplete"){
			var tagKey = url.split("=")[1];
			//console.log(tagKey);
			//imageTags = decodeURIComponent(imageTags);
			tagKey = decodeURIComponent(tagKey);
			//console.log("tagKey in DB ", tagKey);
			response.writeHead(200, {"Content-Type": "application/json"});
			if (tagKey in tagTable === true){
				var autoTags = tagTable[tagKey].tags;
				tagKey = Object.keys(autoTags);
			}
			tagKey = JSON.stringify(tagKey)
			response.write(tagKey);
			response.end();
		}
		else if(url.split("=")[0] == "/query?deletImage"){
			var imageId = url.split("=")[1];
			//console.log(imageId);
			//imageId = decodeURIComponent(imageId);
			//deletTagInfo = imageId.split("+");
			//deletTagInfo[0] = decodeURIComponent(deletTagInfo[0]);
			////console.log("deleteTag in DB ", deletTagInfo);
			response.writeHead(200, {"Content-Type": "application/json"});

			var cmdStr = ' DELETE FROM photoTable WHERE idNum = number ';
			cmdStr = cmdStr.replace("number", imageId);
			//console.log(cmdStr);
			db.all(cmdStr, dataCallback);
			function dataCallback(err,rowData){
				if(err){
					console.log("error: ", err);
					response.write("error");
					response.end();
				}
				else{
					//console.log("error: ", err);

					console.log("Response Sent: \n","Deleted Image");
					auto.makeTagTable(tagTableCallback);
					function tagTableCallback(data) {
						tagTable = data;
					}
					response.write("Deleted Image");
					response.end();

				}
			}
		}
		else if(url.split("=")[0] == "/query?keyList"){
			var imageTags = url.split("=")[1];
			//console.log(url);
			imageTags = decodeURIComponent(imageTags);
			imageTags = imageTags.split("+");
			console.log(imageTags);
			response.writeHead(200, {"Content-Type": "application/json"});
			jsonObj = [];
			var cmdStr = ' SELECT idNum, filename AS src, width, height, locationTag, tags FROM photoTable WHERE (locationTag = \"jagah\" OR tags LIKE \"%ptag%\")';
			cmdStr = cmdStr.replace("jagah", imageTags[0]);
			cmdStr = cmdStr.replace("ptag", imageTags[0]);
			for(var i = 1; i < imageTags.length; i++){
				var cmdStr1 = ' AND (locationTag = \"jagah\" OR tags LIKE \"%ptag%\")';
				cmdStr1 = cmdStr1.replace("ptag", imageTags[i]);
				cmdStr1 = cmdStr1.replace("jagah", imageTags[i]);
				cmdStr = cmdStr + cmdStr1;
			}
			//console.log(cmdStr);
			db.all(cmdStr, dataCallback);
			function dataCallback(err,rowData){
				if(err){
					console.log("error: ", err);
				}
				else{
					//count++;
					//rowData = rowData[0];
					rowData1 = [];
					//console.log(rowData.length);
					if (rowData.length == 0){
						rowData1[0] = {message: "There were no photos satisfying this query."};
					}
					else{
						rowData1[0] = {message: "These are all of the photos satisfying this query."};
					}
					//console.log("got: ", rowData, "\n");
					rowData = rowData.map(obj => {
						obj.src = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/" + obj.src;
						return obj;
					});
					rowData1[1] = rowData;
					//console.log("update ", rowData1, "\n");
					rowData = JSON.stringify(rowData1);
					console.log("Response Sent: \n",rowData)
					response.write(rowData);
					//db.close();
					response.end();
					//}
				}
			}
		}
		else if(url.split("=")[0] == "/query?numList"){
			var count = 0;
			var outboundFlag = 0;
			var imageNums = url.split("=")[1];
			imageNums = imageNums.split("+");
			//				console.log(imageNums);
			response.writeHead(200, {"Content-Type": "application/json"});
			jsonObj = [];
			for(var i = 0; i < imageNums.length; i++){
				if( !(imageNums[i] < 989 && imageNums[i] > 0) ){
					outboundFlag = 1;
					break;
				}
			}
			if(outboundFlag == 1){
				response.write("Bad Request");
				//db.close();
				console.log("Response Sent: Bad Request");
				response.end();
			}
			else{
				for(var i = 0; i < imageNums.length; i++){

					var cmdStr = ' SELECT * FROM tags WHERE idNum = numb';
					cmdStr = cmdStr.replace("numb", imageNums[i]);
					//console.log(cmdStr);
					db.all(cmdStr, dataCallback);
				}
				function dataCallback(err,rowData){
					if(err){
						console.log("error: ", err);
					}
					else{
						count++;
						rowData = rowData[0];
						//console.log("got: ", rowData, "\n");
						item = {}
						item ["src"] = "http://lotus.idav.ucdavis.edu/public/ecs162/UNESCO/"+rowData.filename;
						item ["width"] = rowData.width;
						item["height"] = rowData.height;
						jsonObj.push(item);
						//console.log(jsonObj);
						if(count == imageNums.length){
							jsonObj = JSON.stringify(jsonObj);
							console.log("Response Sent: \n",jsonObj)
							response.write(jsonObj);
							//db.close();
							response.end();
						}
					}
				}
			}
		}
		else{
			fileServer.serve(request, response, function(err, result) {
				if (err && (err.status === 404 || err.status === 500) ) {
					fileServer.serveFile(util.format('/%d.html', err.status), err.status, {}, request, response);
				}
				else {
					console.log('%s - %s', request.url, response.message);
				}});
			}}).resume();
		}

		var server = http.createServer(handler);

		server.listen(56333);
