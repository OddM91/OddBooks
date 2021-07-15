$(function(){
    url = window.location.href;
    slash_index = url.lastIndexOf("/");
    product = url.slice(slash_index+1);

    url_lookup = "/api/book/" + product;

    $.get(url_lookup, function (data){

        displayItem(data);
        
    });

    if (sessionStorage.getItem("currentUser") === "null" ){
        console.log("Sessoin is null");
        $("#cart-tracker").html("<h5>Log in to start shopping</h5>");
        $("#checkout-btn-box").html("");
    }

});

function displayItem(json){

    let output = "";
    let a_book = JSON.parse(json);

    output += "<div class=\"col-md-12\"><div class=\"row\"><div id=\"product-image\" class=\"col-md-4\"><img src=\"../images/";
    output += a_book[9];    // Image
    output += "\" width=\"100%\"><i>Click here for sample pages.</i></div><div id=\"product-info\" class=\"col-md-8\"><h3>";
    output += a_book[1];    // Title
    output += "</h3><span style=\"font-style: italic;\">"; 
    output += a_book[8];    // Format
    output += " </span><br /><span style=\"font-size: 18px;\">Author: ";
    output += a_book[2];    // Author    
    output += " </span> | <span style=\"font-style: italic;\">";
    output += a_book[7] + "</span><p>"; // Genre
    output += a_book[5];    // Synopsis
    output += "</p><h6>Price: ";
    output += a_book[6];    // Price
    output += "$</h6><button type=\"button\" class=\"btn btn-info\" onclick=\"addToCart(";
    output += a_book[0];  // Book ID (for add to cart lookup)
    output += ")\">Add to cart</button></div></div><div class=\"row mt-05\"><div class=\"col-md-12\"><h4>Reviews: </h4></div></div><div class=\"row\"><div id=\"product-reviews\" class=\"col\"><div class=\"row\"><div class=\"col-md-2\">Profile Picture. </div><div class=\"col-md-10\"><h6>I think it is pretty good 4/5</h6><p>Fake reviews for every book here, I can make up a lot of bullshit about these books so I feel like I am qualified for doing this nonsense, so lets get at it!</p></div></div></div></div>";

    // Last line is the Review part, fix that later. 

    $("#item_block").html(output);

}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    sessionStorage.setItem("currentUser", profile.getEmail());

    $.post("/api/login", {first_name: profile.getGivenName(), last_name: profile.getFamilyName(), email: profile.getEmail() }, function(json){
        // Admin mode here !!

        data = JSON.parse(json);        

        $("#cart-tracker").html("<h5>Items in cart: "+ data[2] + "</h5>");
        $("#checkout-btn-box").html("<a href=\"/checkout\"><button id=\"checkout\">Checkout</button></a>");
        $("#my_orders").html("<a href=\"/orders/" + data[1] + "\"><button id=\"my-orders\">My Orders</button></a>");

        if (data[0] == 100){
            // Enter Admin Mode !!
            // Reveal button "Admin Page"? 
            console.log("POOOOOWWWEEERRR!!!");
        }
        else{
            // For testing purposes. 
        }
    });
    
}

function addToCart(item_id){
    $.post("/api/cart/add", {item_id: item_id, email: sessionStorage.getItem("currentUser")}, function(json){
        data = JSON.parse(json);
        $("#cart-tracker").html("<h5>Items in cart: " + data[0] + "</h5>");
    }).fail(function(response){
        err = JSON.parse(response.responseText);
        slash_index = err.error.lastIndexOf(":");
        err = err.error.slice(slash_index+2);
        alert(err)
    });
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        $("#cart-tracker").html("<h5>Log in to start shopping</h5>");
        $("#checkout-btn-box").html("");
        sessionStorage.setItem("currentUser", "null");
        console.log("Session is: " + sessionStorage.getItem("currentUser"));
    });
    
}