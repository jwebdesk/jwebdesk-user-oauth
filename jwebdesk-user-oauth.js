define([
    "jwebkit",
    "jwebdesk"
], function(vapaee, jwebdesk) {

    var $ = vapaee.query;
    var LOGGED_FLAG = "logged",
        LOGGED_STORED_LBL = "user-logged",
        VAPAEE_ACCESS_TOKEN = "vapaee-token",
        VAPAEE_REFRESH_TOKEN = "vapaee-refresh",
        PROXYID_USER_OAUTH = "proxy-id-oauth";
    
    var vapaee_accounts = "http://accounts.vapaee.com/index.php";
    var vapaee_login_url = vapaee_accounts + "?r=oauth/endpoint/login";
    var vapaee_logout_url = vapaee_accounts + "?r=oauth/endpoint/logout";
    var token_route = vapaee_accounts + "?r=oauth/endpoint/token";
    var token_proxy_route =  "/package/jwebdesk/jwebdesk-user-oauth/get_access_token.php?_=_";
    var authorize_route = vapaee_accounts + "?r=oauth/endpoint/authorize";
    
    
    jwebdesk.Authentication = function () {        
        vapaee.Node.call(this);
        this.create_service();
    }
    
    jwebdesk.Authentication.prototype = new vapaee.Node();
    jwebdesk.Authentication.prototype.constructor = jwebdesk.Authentication;
    
    function server_ajax (params) {
        return $.ajax(params).then(function (result) {
            try {
                var obj = JSON.parse(result);                
                return obj;
            } catch (err) {
                var res = { error: "JSON parse error", exception: err, source: result };
                console.error(res)
                return res;
            }
        });        
    }
    
    // logged return true if the user is authenticated
    jwebdesk.Authentication.prototype.logged = function () {
        
        var user = this;
        return server_ajax({ url: jwebdesk.serverURL + "?action=logged" }).then(function (result) {
            if (result.error) {
                console.error("ERROR: while trying to access the server", arguments);
            } else {
                if (result.logged) {
                    jwebdesk.localStorage.setItem(LOGGED_STORED_LBL, result);
                    user.flag_on(LOGGED_FLAG);
                }                
                return vapaee.Deferred().resolve(result.logged, result.user).promise();
            }            
        }).fail(function () {
            console.error("ERROR: while trying to access the server", arguments);
        });
        
    }
    
    // if the user is not authenticated creates a popups to the authentication module url
    jwebdesk.Authentication.prototype.login = function () {
        
        jwk.setCookie("access_token", "");
        jwk.setCookie("refresh_token", "");           
        window.location.href = vapaee_login_url + "&callback="+  encodeURIComponent("http://jwebdesk.com");
        var deferred = vapaee.Deferred();
        return deferred.promise();
    }
    
    // force de user to logout
    jwebdesk.Authentication.prototype.logout = function () {
        // var promise = server_ajax({ url: jwebdesk.serverURL + "?action=logout" });
        jwebdesk.localStorage.removeItem(LOGGED_STORED_LBL);
        this.flag_off(LOGGED_FLAG);
        var token = jwk.getCookie("access_token");
        jwk.setCookie("access_token", "");
        jwk.setCookie("refresh_token", "");
            
        window.location.href = vapaee_logout_url + "&back=true&access_token=" +  token;
        
        return vapaee.Deferred();
    }
    
    // return a specified property of the user: name, lastname, mail, avatar, etc
    jwebdesk.Authentication.prototype.prop = function () {
        console.error("jwebdesk.Authentication.prototype.prop not implemented", arguments);
    }
    
    // return configuration for the package_id. If no package_id is specified all configuration is returned.
    // If package_id & path are specified, the specific value is returned.
    // If value is specified then is stored instead of returned.
    jwebdesk.Authentication.prototype.config = function (package_id, path, value) {
        console.error("jwebdesk.Authentication.prototype.config not implemented", arguments);
    }

    jwebdesk.Authentication.prototype.create_service = function () {
        var dialog = this;
        jwebdesk.wait_flag("ready").done(function (){ 
            if (jwebdesk.service("user-auth")) return;

            var service = vapaee.global.proxy();
            dialog.service = service;

            service.register_function({
                logged: dialog.logged,
                isLogged: dialog.logged,
                login: dialog.login,
                logout: dialog.logout,
                prop: dialog.prop,
            }, dialog);

            jwebdesk.register_service("user-auth", service);

        }) 
    }
    
    var proxy_id = vapaee.urlParam("proxy");
    if (proxy_id) {
        
        var userdata = vapaee.urlParam("userdata");
        console.error("----------->", userdata);
        if (userdata) {
            try {
                userdata = JSON.parse(userdata);
                proxy.trigger("logged", userdata);
            } catch (err) {
                console.error("ERROR: JSON.parse fail. source:", userdata, [err]);
            }            
        } 
        
    } else {
        var authentication = new jwebdesk.Authentication();    
    }
    
    
    
    return authentication;
});