var genre_filter = "null";

$(function(){
    // Fetches all books from the API and sends it to display. 
    $.get("/api/books/sort", {sort_by: "release_date", genre: "null" }, function (data){
        console.log("Fetching all Books");

        displayItems(data);

    });
    console.log((sessionStorage.getItem("currentUser")));

    // This one is to prevent pressing "Enter" within the search box to refresh the page which is the default setting. 
    $("form").submit(function() { return false; });
 
    if (sessionStorage.getItem("currentUser") === "null" ){
        console.log("Sessoin is null");
        $("#cart-tracker").html("<h5>Log in to start shopping</h5>");
        $("#checkout-btn-box").html("");
    }

});

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
            let divs = document.querySelectorAll(".store_item");
            for (let i = 0; i <divs.length; i++){
                let book_title = divs[i].getElementsByClassName("title_text")[0].innerHTML.replace(/ /g, "-");
                let book_id = divs[i].getElementsByClassName("add_cart_btn")[0].value;
                
                divs[i].innerHTML = divs[i].innerHTML + "<div class=\"row admin_buttons\"><div class=\"col\"><a href=\"/product/edit/"+ book_title +"\"><button id=\"Edit\">Edit</button></a></div></div>"
            }
            selected = document.querySelector("#sort_by_row");
            selected.innerHTML = selected.innerHTML + "<div class=\"col mt-2 admin_buttons\"><span style=\"font-size: 20px;\">You are now logged in as Admin!! </span><a href=\"/product/edit/NewEntry\"><button id=\"add-book-btn\">Add Book</button></a></div>"
            console.log("POOOOOWWWEEERRR!!!");
        }
        else{
            // Nothing special here, was used for testing. 
        }
    });
    
}

function search(){
    search_text = $("#search_box").val();

    $.get("/api/books/search", {search_txt: search_text}, function(data){
        console.log("Search Result for " + search_text);
        displayItems(data);
    });

}

function displayItems(json){
    let output = "";
    let all_books = JSON.parse(json);

    for (let b in all_books){

        urlLink = "product/"
        urlLink += all_books[b][1].replace(/ /g, "-");

        output += "<div class=\"col px-md-4 text-center border border-secondary store_item\"><div class=\"row\"><a href=\"" + urlLink + "\"><img src=\"images/";
        output += all_books[b][9];      // Image URL
        output += "\" class=\"img-fluid rounded mx-auto d-block\" width=\"75%\"></a></div><div class=\"row\"><div class=\"col\"><a href=\"" + urlLink + "\"><h5 class=\"mx-auto title_text\">";
        output += all_books[b][1];      // Title
        output += "</h5></a></div></div><div class=\"row\"><p class=\"mx-auto\">Author: ";
        output += all_books[b][2];      // Author
        output += "<br /><b>Price: ";
        output += all_books[b][6];      // Price
        output += "$</b></p></div><div class=\"row\"><button type=\"button\" class=\"btn btn-info mx-auto add_cart_btn\" value=\"" + all_books[b][0] + "\" onclick=\"addToCart(";
        output += all_books[b][0];      // Book ID (for add to cart lookup)
        output += ")\">Add to cart</button></div><br /></div>"
    }

    $("#item_block").html(output);

}

function getGenre(gen){
    url = "/api/books/" + gen.innerHTML;

    genre_filter = gen.innerHTML;
    
    $.get(url, function (data){
        console.log("Fetching all " + gen.innerHTML + " books. ")

        displayItems(data);       
    });   
}

function getCartSize(){
    url = "/api/"+sessionStorage.getItem("currentUser")+"/cart/size"

    $.get(url, function (data){
        $("#cart-tracker").html("Items in cart: "+data);
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

function sortBooks(){
    let selected = $("#sort-by").val();
    $.get("/api/books/sort", { sort_by: selected, genre: genre_filter }, function(data){

        displayItems(data);
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

        // If the user was an addmin then this will remove all the admin buttons. 
        $(".admin_buttons").remove();  
    });
}