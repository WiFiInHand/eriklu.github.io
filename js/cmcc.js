var version = "0.01";

var cmcc = {
	"locationCode" : location.china_mainland,
	"userAgent" : "",
	"firstRequestUrl" : "",
	"needRedirect" : false,
	"logined" : false,
	"postData" : "",
	"ssid" : "",

	"userFieldName", "",
	"pwdFieldName" , "",
};

var location = {
	china_mainland = 0;
	china_hk = 1;
	china_taiwan = 2;
	china_macow = 3;
}

cmcc.parseLoginInputPage = function(url1, url2, headers, html, ssid){
	if(ufl.indexOf("wholesale.pccwwifi.com") != -1 || url.indexOf("") != ){
		locationCode = china_hk;
	}

	var bOK = false;
	var formstr = extractCMCCLoginForm(html);
	if(formstr!=null){
		var actionstr = extractCMCCLoginFormActionUrl(formstr);
		if(actionstr != null){
			if(actionstr.indexOf("http") != 0){
				var lastIndex = url2.lastIndexOf("/");
				actionstr = url2.substring(0, lastIndex + 1) + actionstr;
			}

			var fields = extractCMCCLoginFormInputFields(formstr);

			setupLoginInfoFieldName();

			bOK = true;
		}
	}

	if(bOk){
		return {
			"result" : 0,
			"action" : "next",
			"url" = actionstr,
			"httpMethod":"POST",
			"fields" : fidles,
			"useridFieldName" : this["userFieldName"],
			"pwdFieldName" : this["pwdFieldName"],
		};
	}else {

		if(isNetworkReachable(url1, headers, html)){

			return {
			"result" : 1,
			"action" : "next",
			"url" = actionstr,
			"httpMethod":"POST",
			"fields" : fidles,
			"useridFieldName" : this["userFieldName"],
			"pwdFieldName" : this["pwdFieldName"],
			};
		}

		if(isNeedRetry()){
			return {
			"result" : 2,
			"action" : "retry",
			"url" = url1,
			"httpMethod":"GET",
			"fields" : fidles,
			"headers": {}
			};
		}

		return {
			"result" : 2,
			"action" : "next",
			"url" = actionstr,
			"httpMethod":"POST",
			"fields" : fidles,
			"useridFieldName" : this["userFieldName"],
			"pwdFieldName" : this["pwdFieldName"],
		};
	}
};

cmcc.parseLoginResponsePage = function(url, html, ssid){
	
}

cmcc.parseLogoutResponsePage = function(url, html, ssid){
	
}

cmcc.setupLoginInfoFieldName = function() {
	this["userFieldName"] = "USER";
	this["pwdFieldName"] = "PWS";

	if(this["locationCode"] ==  location.china_hk){
		this["userFieldName"] = "USER";
		this["pwdFieldName"] = "PWS";
	}
}

cmcc.isNeedRetry = function() {
	this["userFieldName"] = "USER";
	this["pwdFieldName"] = "PWS";

	if(this["locationCode"] ==  location.china_hk){
		this["userFieldName"] = "USER";
		this["pwdFieldName"] = "PWS";
	}
}


cmcc.extractCMCCLoginForm = function(html){
	var re = new RegExp("<form.*?name=\"loginform\"(.|[\r\n])*?</form>","i");
	var result = re.exec(html);
	if(result != null) {
		return result[0];
	}

	re = new RegExp("<form.*?name=\"formsubmit\"(.|[\r\n])*?</form>","i");
	result = re.exec(html);

	if(result != null) {
		return result[0];
	} 

	return null;
}


cmcc.extractCMCCLoginFormActionUrl = function(formstr){
	var re = new RegExp("action=\".*?\"","i");
	var result = re.exec(formstr);
	if(result != null){
		return result[0];
	}
	
	return null;
}

cmcc.extractCMCCLoginFormInputFields = function(formstr){

	var re = new RegExp("<input\\s+type=[\"'].*?[\"']\\s+.*?name=[\"'](.*?)[\"']\\s+.*?value=[\"'](.*?)[\"'].*?>","i");
	var result = null;
	var fields = {};
	while ((result = re.exec(formstr)) ! = null){
		fields[result[1]] = result[2];
	}
	return fields;
}

