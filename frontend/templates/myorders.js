$(function(){
    $.get("/api/orders/check", {email: sessionStorage.getItem("currentUser")}, function(json){
        data = JSON.parse(json);

        if(data.length == 0){
            let output = "<div class \"col\"><h4>You have no past orders</h4></div>";
            $("#item_block").html(output);
        }else{
            displayOrders(data);
        }
    });

    console.log("Session when starting page is: " + sessionStorage.getItem("currentUser"));

    if (sessionStorage.getItem("currentUser") === "null" ){
        console.log("Sessoin is null");
        $("#cart-tracker").html("<h5>Log in to start shopping</h5>");
        $("#checkout-btn-box").html("");
    }

});

function displayOrders(json){

    // json here is an array of arrays OF ARRAYS, first is the entire "object", then for each individual order, and then for the info about each book in the order. 
    // [0] = ID, [1] = Title, [2] = Author, [3] = VolNr, [4] = Release, [5] = Synopsis, [6] = Price, [7] = Genre, [8] = Format, [9] = frontpage.jpg. 

    let output = "<div class=\"col\"><div class=\"row\"><div class=\"col\"><h4>Your past orders: </h4></div></div>";
    total_price = 0;
    let all_orders = json;

    for (let o in all_orders){
        output += "<div class=\"row mt-2\"><div class=\"col\"><h5><u>Order Number: ";
        output += all_orders[o][0];
        output += "</u></h5></div></div>";
        output += "<div class=\"row mt-2\"><div class=\"col\"><h6>Delivery Address: ";
        output += all_orders[o][1];
        output += "</h6></div></div>";
        

        for (let b in all_orders[o]){
            if (b == 0 || b == 1 || b == 2){
                continue;   // This one jumps over the Order ID, Address and Price that I am sending in as the first 3 elements. 
            }
            urlLink = "../product/";
            urlLink += all_orders[o][b][1].replace(/ /g, "-");

            output += "<div class=\"row mt-2 border-bottom\"><div class=\"col-md-2\"><a href=\"" + urlLink + "\"><img src=\"../images/";
            output += all_orders[o][b][9];  // Image
            output += "\" width=\"100%\"></a></div><div class=\"col-md-7 mt-2\"><a href=\"" + urlLink + "\"><h5>";
            output += all_orders[o][b][1];  // Title
            output += "</h5></a>Author: ";
            output += all_orders[o][b][2];  // Author
            output += "<br /><i>";
            output += all_orders[o][b][8];  // Format
            output += "</i><br /></div><div class=\"col-md-3\"><b>$";
            output += all_orders[o][b][6];   // Price
            output += "</b></div></div>";
        }

        output += "<div class=\"row\"><div class=\"col-md-8\"></div><div class=\"col-md-4\"><span style=\"font-size: 18px;\">Total Price: $";
        output += parseFloat(all_orders[o][2]).toFixed(2);
        output += "</span></div></div>";
    }

    
    
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
            // Nothing here, was used for testing. 
        }
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
        let output = "<div class \"col\"><h4>You have no items in your cart</h4></div>";
        $("#item_block").html(output);
    });
    
}
