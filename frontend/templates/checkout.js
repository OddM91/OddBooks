var total_price = 0;

$(function(){
    $.get("/api/cart/check", {email: sessionStorage.getItem("currentUser")}, function(json){
        data = JSON.parse(json);

        if(data.length == 0){
            let output = "<div class \"col\"><h4>You have no items in your cart</h4></div>";
            $("#item_block").html(output);
        }else{
            displayCart(data);
        }
    });

    console.log("Session when starting page is: " + sessionStorage.getItem("currentUser"));

    if (sessionStorage.getItem("currentUser") === "null" ){
        console.log("Sessoin is null");
        $("#cart-tracker").html("<h5>Log in to start shopping</h5>");
        $("#checkout-btn-box").html("");
    }

});

function displayCart(json){

    // json here is an array of arrays for all the info about each book. 
    // [0] = ID, [1] = Title, [2] = Author, [3] = VolNr, [4] = Release, [5] = Synopsis, [6] = Price, [7] = Genre, [8] = Format, [9] = frontpage.jpg. 

    let output = "<div class=\"col\"><div class=\"row\"><div class=\"col\"><h4>Current Items in Cart: </h4></div></div>";
    total_price = 0;
    let all_books = json;

    for (let b in all_books){
        urlLink = "product/"
        urlLink += all_books[b][1].replace(/ /g, "-");

        output += "<div class=\"row mt-2 border-bottom\"><div class=\"col-md-2\"><a href=\"" + urlLink + "\"><img src=\"../images/";
        output += all_books[b][9];  // Image
        output += "\" width=\"100%\"></a></div><div class=\"col-md-7 mt-2\"><a href=\"" + urlLink + "\"><h5>";
        output += all_books[b][1];  // Title
        output += "</h5></a>Author: ";
        output += all_books[b][2];  // Author
        output += "<br /><i>";
        output += all_books[b][8];  // Format
        output += "</i><br /><button onclick=\"deleteItem("
        output += all_books[b][0];  // Book ID
        output += ")\">Remove from cart</button></div><div class=\"col-md-3\"><b>$";         // FIX HERE !!! Add Remove from Cart function some how!!
        output += all_books[b][6]   // Price
        output += "</b></div></div>"
        
        total_price = +total_price + +all_books[b][6]
    }

    if(Math.random()*1000 == 0){
        total_price = 0;
    }
        
    output += "<div class=\"row\"><div class=\"col-md-9\"></div><div class=\"col-md-3 total_price\" style=\"font-size: 20px;\">"; 
    if(total_price != 0) {
        output += "<u>Total Price: $";
        output += parseFloat(total_price).toFixed(2) + "</u>";
    }  // This is where the total gets printed
    else{   // And if you hit the 1 in 1000 you get a free purchase. 
        output += "<b>You just drew the super rare chance of getting a free purchase!! Buy now and get all items for free!!</b>"
    }
    output += "</div></div><form><div class=\"form-group row\"><div class=\"col-md-8 mt-1\"><span style=\"font-size: 20px;\"><label for=\"deliveryInput\">Delivery Adress: </label></span><input type=\"text\" id=\"delivery_address\" class=\"form-control\"></div></div>";
    output += "<div class=\"form-group row\"><div class=\"col-md-8 mt-1\"><span style=\"font-size: 20px;\"><label for=\"cardInput\">Credit Card Nr.: </label></span><input type=\"text\" id=\"credit_card\" class=\"form-control\" placeholder=\"This one obviously does nothing.\"></div></div>";
    output += "<button class=\"btn btn-primary\" onclick=\"confirmPurchase()\">Confirm Purchase</button></div>";
    
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
            // Nothing left here, was used for testing. 
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

function confirmPurchase(){
    $.post("/api/purchase", {email: sessionStorage.getItem("currentUser"), address: $("#delivery_address").val(), price: total_price}, function(data){
        alert("Thank you for your purchase ^^ ");
    }).fail(function(data){
        alert("Something went wrong, please try again later. ");
    });
}

function deleteItem(id){

    $.ajax({
        url: "/api/cart/item/delete/"+id+"/"+sessionStorage.getItem("currentUser"),
        type: 'DELETE',
        //body: {"book_id": id, email: sessionStorage.getItem("currentUser")},
        
        success: function(data){
           console.log("Deleted item");
        },
        error: function(data){
           error = JSON.parse(data.responseText);
           $("#outputtest").html(error.message);
        }
    });
    location.reload();
}