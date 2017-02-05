/* With help of the achievment index, retrieve the actual status of the fractal achievement. 
The numbers in the bits array indicate the completed indices of the achievement, ie index 0 
is the first achievement.*/
function retrieveFractalAchievementStatus(apiKeyArray){

	// Dictionary to store account, achievementinfo pair
	var accountAchievementDictionary = {};
	var accountNameArray = []
	
	// Retrieve fractal achievements for every account.
	for(var i = 0; i < apiKeyArray.length; i++){
		if(apiKeyArray[i] != "" && apiKeyArray[i] != undefined){
			
			console.log("Current API key in loop" + apiKeyArray[i]);
			
			// Retrieve the achievement information from the API
			var achievementArray = retrieveAchievementAPI(apiKeyArray[i]);
			
			// Get indices for this specific ApiKey because they differ
			var indexArray = findFractalAchievementIndex(achievementArray);
			
			var fractalInitiate = [];
			var fractalAdept = [];
			var fractalExpert = [];
			var fractalMaster = [];
			
			// Get achievement bits using the indices
			fractalInitiate = achievementArray[indexArray[0]].bits;
			fractalAdept = achievementArray[indexArray[1]].bits;
			fractalExpert = achievementArray[indexArray[2]].bits;
			fractalMaster = achievementArray[indexArray[3]].bits;
			
			// Concatenate arrays
			var fractalTotal = fractalInitiate.concat(fractalAdept, fractalExpert, fractalMaster);
			
			// Get name and put it in the dictionary
			var accountName = retrieveAccountName(apiKeyArray[i]);
			accountNameArray[i] = accountName;
			
			accountAchievementDictionary[accountName] = fractalTotal;
			console.log( "Full array" + accountAchievementDictionary[accountName]);
			
			// Debugging printing to console
			var arr = accountAchievementDictionary[accountName];
			var arrlength = arr.length;
			var alles = "";
			
			for(var i = 0; i < arrlength; i++){
				alles += (arr[i] + " ");
			}
			
			console.log("Alles: " + alles);
			
		}
	}
}



/* Retrieves all information about all achievements of a given account. */
function retrieveAchievementAPI(apiKey){
	
		var achievementArray;
	
		$.ajax({
		type: "GET",
		async: false,
		url: "https://api.guildwars2.com/v2/account/achievements?access_token=" + apiKey,
		cache: false,
		dataType: 'text',
		
			success: function (){},
			error: function(){},
			
			// Wait until request is done.
			complete: function(data){
				// Parse json object
				achievementArray = JSON.parse(data.responseText);
				console.log("finished api call to achievements");
			}
		});
		
		return achievementArray;
}


/* Find the achievements in the achievement array and find the corresponding 
index to avoid extra looping for the other player's achievement arrays */	
function findFractalAchievementIndex(achievementArray){
	
	var indexArray = []
	
	/* Reverse might be faster due to the recent nature of these achievements? */
	for(var i = 0, length = achievementArray.length; i < length; i++){
		switch(achievementArray[i].id){
			case 2965:
				indexArray[0] = i;
				console.log(i);
				break;
			case 2894:
				indexArray[1] = i;
				console.log(i);
				break;
			case 2217:
				indexArray[2] = i;
				console.log(i);
				break;
			case 2415:
				indexArray[3] = i;
				console.log(i);
				break;
		} 
	}
	
	console.log("currently in indexarray");
	console.log(indexArray[0]);
	console.log(indexArray[1]);
	console.log(indexArray[2]);
	console.log(indexArray[3]);
	return indexArray;
}


/* Retrieves all information about all achievements of a given account. */
function retrieveAccountName(apiKey){
	
		var accountName;
	
		$.ajax({
		type: "GET",
		async: false,
		url: "https://api.guildwars2.com/v2/account?access_token=" + apiKey,
		cache: false,
		dataType: 'text',
		
			success: function (){},
			error: function(){},
			
			// Wait until request is done.
			complete: function(data){
				// Parse json object
				console.log("API" + apiKey);
				
				console.log(data);
				
				var accountInfo = JSON.parse(data.responseText);
				accountName = accountInfo.name;
			}
		});
		
		return accountName;
}