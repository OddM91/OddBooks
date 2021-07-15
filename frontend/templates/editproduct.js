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
    let a_book = "";

    if (json === "NULL"){
        a_book = [0, "", "", "", "", "", "", "", "", "no_frontpage.jpg"]    // If this is for a new book then it just creates an empty shell of a book to make the output work. 
    }
    else {
        a_book = JSON.parse(json);
    }

    output += "<div class=\"col-md-12\"><div class=\"row\"><div id=\"product-image\" class=\"col-md-4\"><img src=\"../../images/";
    output += a_book[9];    // Image
    output += "\" width=\"100%\"><form id=\"image_form\" enctype=\"multipart/form-data\" name=\"file\"><div class=\"form-group\"><span style=\"font-size: 20px;\"><label for=\"imageInput\">Upload Image: </label></span><input type=\"file\" class=\"form-control-file\" id=\"book_image\"></div></form><button id=\"imageConfirm\" onclick=\"uploadImage(";
    output += a_book[0];  
    output += ")\">Upload Image</button><p><i>You can not upload an image when making a new item as it does not have an ID yet. After creating it go into its edit page to add image.</i></p></div><div id=\"product-info\" class=\"col-md-8\"><form><div class=\"form-group row\"><div class=\"col mt-1\"><span style=\"font-size: 20px;\"><label for=\"titleInput\">Title: </lable></span></div></div><div class=\"row mt-n3\"><div class=\"col\"><input type=\"text\" class=\"form-control\" id=\"book_title\" value=\"";
    output += a_book[1];    // Title
    output += "\"></div></div><div class=\"form-group row\"><div class=\"col mt-1\"><span style=\"font-size: 20px;\"><label for=\"formatInput\">Format: </lable></span></div></div><div class=\"row mt-n3\"><div class=\"col\"><input type=\"text\" class=\"form-control\" id=\"book_format\" value=\""; 
    output += a_book[8];    // Format
    output += "\"></div></div><div class=\"form-group row\"><div class=\"col mt-1\"><span style=\"font-size: 20px;\"><label for=\"volumeInput\">Volume: </lable></span></div></div><div class=\"row mt-n3\"><div class=\"col\"><input type=\"number\" class=\"form-control\" id=\"book_volume\" value=\""; 
    output += a_book[3];    // Volume
    output += "\"></div></div><div class=\"form-group row\"><div class=\"col mt-1\"><span style=\"font-size: 20px;\"><label for=\"releaseInput\">Release Date: </lable></span></div></div><div class=\"row mt-n3\"><div class=\"col-12 col-md-8 col-lg-5\"><input type=\"date\" class=\"form-control\" id=\"book_release\" value=\""; 
    output += a_book[4];    // Release Date
    output += "\"></div></div><div class=\"form-group row\"><div class=\"col mt-1\"><span style=\"font-size: 20px;\"><label for=\"authorInput\">Author: </lable></span></div></div><div class=\"row mt-n3\"><div class=\"col\"><input type=\"text\" class=\"form-control\" id=\"book_author\" value=\"";
    output += a_book[2];    // Author    
    output += "\"></div></div><div class=\"form-group row\"><div class=\"col mt-1\"><span style=\"font-size: 20px;\"><label for=\"genreInput\">Genre: </lable></span></div></div><div class=\"row mt-n3\"><div class=\"col\"><input type=\"text\" class=\"form-control\" id=\"book_genre\" value=\"";
    output += a_book[7];    // Genre
    output += "\"></div></div><div class=\"form-group row\"><div class=\"col mt-1\"><span style=\"font-size: 20px;\"><label for=\"synopsisInput\">Synopsis: </lable></span></div></div><div class=\"row mt-n3\"><div class=\"col\"><textarea class=\"form-control\" id=\"book_synopsis\" rows=\"8\">";
    output += a_book[5];    // Synopsis
    output += "</textarea></div></div><div class=\"form-group row\"><div class=\"col mt-1\"><span style=\"font-size: 20px;\"><label for=\"priceInput\">Price: </lable></span></div></div><div class=\"row mt-n3\"><div class=\"col\"><input type=\"number\" class=\"form-control\" id=\"book_price\" value=\"";
    output += a_book[6];    // Price
    output += "\"></div></div></form><div class=\"row\"><div class=\"col mt-2\"><button type=\"button\" class=\"btn btn-info\" onclick=\"confirmEdit(";
    output += a_book[0];  // Book ID 
    output += ")\">Confirm</button></div></div></div></div></div>";
    

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
            $("#item_block").html("<h3>You are not an admin, please go away from this place. </h3>");
            // You should not be allowed onto an admin page when not an admin so this should remove text when you are not admin. 
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
        $("#item_block").html("<h3>You are not an admin, please go away from this place. </h3>");
    });
    
}

function confirmEdit(book_id){

    const book_update = {
        id: book_id,
        title: $("#book_title").val(), 
        author: $("#book_author").val(), 
        volume: $("#book_volume").val(), 
        release: $("#book_release").val(), 
        synopsis: $("#book_synopsis").val(), 
        price: $("#book_price").val(), 
        genre: $("#book_genre").val(), 
        format: $("#book_format").val(),
    }

    $.post("/api/book/edit", book_update, function(data){
        alert("Commit Successful!");
    }).fail(function(response){
        alert("Something went wrong!");
    });
}

function uploadImage(id){
    let fd_image = document.getElementById("image_form");
    let fd = new FormData();
    var files = $("#book_image")[0].files[0];

    fd.append('file', files);
    fd.append('book_id', id);

    $.ajax({
        url: "/api/book/add/image?id="+id,
        type: "POST",
        data: fd,
        contentType: false,
        processData: false,
        success: function(response){
            if(response != 0){
                alert("File Uploaded.");
            }else{
                alert("Something went wrong. ");
            }
        },
    });
}