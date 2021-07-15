import sys
import flask
from flask.json import jsonify
import mysql.connector
import json
import os
from flask import render_template, request, abort, url_for, redirect
from werkzeug.utils import secure_filename

# For Google OAuth token verification
from google.oauth2 import id_token as goog_token
from google.auth.transport import requests as goog_req

# Configuring MySQL access. 
mysql_user = "odd"
mysql_pwd = "MySuperHardPassword!1"
mysql_host = "mysql1"
mysql_db = "an_odd_bookstore"

oauth_id   = '33190512866-s10gnlbb166ai0pslf7b6ccgd5rt7f74.apps.googleusercontent.com'      # TO-DO ----- FIX OAUTH !!! !! !! ---------------------

# Connectin to an_odd_bookstore database.
mydb = mysql.connector.connect(user = mysql_user, password = mysql_pwd, host = mysql_host, database = mysql_db)

# Not sure if I should close and create new cursors/databases for each query, but this worked fine. 
mycursor = mydb.cursor()

print("Python Server started up.")

def abort_if_email_is_null(email):
    if email == "null":
        abort(400, description="Login required. ")


def getUserID(email):
    userID = 0
    mycursor.execute("SELECT * FROM users")
    users_db_test = mycursor.fetchall()

    for u in users_db_test:
        if email in u[3]:
            userID = u[0]  
    return userID

def getCartSize(email):   
    userID = getUserID(email)
    mycursor.execute('SELECT cart_size FROM users WHERE user_id=%s;', (userID, ))
    cart = mycursor.fetchall()

    if cart != []:
        return cart[0]
    else:
        return 0

# ~~~~~~~~   The API   ~~~~~~~~

# Specifying an upload PATH for for images that are being uploaded. 
UPLOAD_FOLDER = "/var/fullstack/frontend/images"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

template_dir = os.path.abspath("/var/fullstack/frontend/templates") # Setting the render_template directery. 
app = flask.Flask(__name__, static_folder="/var/fullstack/frontend", static_url_path="", template_folder=template_dir)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/", defaults={"path": "index.html" })
@app.route('/<path>')
def serve_page(path):
    print("Request received for {}".format(path))
    return flask.send_from_directory('/var/fullstack/frontend', path)

@app.route("/api/books")
def allBooks():
    print("All Books where requested. ")
    mycursor.execute('SELECT * FROM books')
    sqlFetch = mycursor.fetchall()
    return json.dumps(sqlFetch[0], indent=4, sort_keys=True, default=str)

@app.route("/api/book/<int:book_id>")
def oneBook_by_id(book_id):
    mycursor.execute('SELECT * FROM books WHERE book_id=%s;', (book_id, ))
    sqlFetch = mycursor.fetchall()
    print("Requested book: {}".format(sqlFetch[0][1]))
    return json.dumps(sqlFetch[0], indent=4, sort_keys=True, default=str)

@app.route("/api/book/<string:book_title>")
def oneBook_by_title(book_title):
    b_title = book_title.replace("-", " ")
    mycursor.execute('SELECT * FROM books WHERE LOWER(books.title) LIKE %s;', (b_title.lower(), ))
    sqlFetch = mycursor.fetchall()
    
    if sqlFetch != []:
        return json.dumps(sqlFetch[0], indent=4, sort_keys=True, default=str)
    return "NULL"


@app.route("/api/books/<string:genre>")     # Finds books of a Genre. Returns an array of books. 
def getGenre(genre):
    sql = "SELECT * FROM books WHERE LOWER(books.genre) LIKE '%" + genre.lower() + "%';"
    mycursor.execute(sql)
    sqlFetch = mycursor.fetchall()
        
    return json.dumps(sqlFetch, indent=4, sort_keys=True, default=str)

@app.route("/api/books/search")             # Finds books that contains an incoming word/sentence in the title. Returns an array of books
def searchForBooks():
    args = request.args.get("search_txt")
    print("Trying to search for {}".format(args))

    sql = "SELECT * FROM books WHERE LOWER(books.title) LIKE '%" + args.lower() + "%';"
    mycursor.execute(sql)
    sqlFetch = mycursor.fetchall()

    return json.dumps(sqlFetch, indent=4, sort_keys=True, default=str)

@app.route("/api/login", methods=["POST"])  # Looks up a user when someone logs in. If they are not already registered it will add them. Returns their Access Level, and their Cart Size. 
def login():

    firstName = request.form.get("first_name")
    lastName = request.form.get("last_name")
    email = request.form.get("email")
    access_level = 0

    data = (firstName, lastName, email, access_level)
    print("This user logged on: First Name: {}, Last Name: {}, email: {}".format(firstName, lastName, email))

    mycursor.execute("SELECT * FROM users")
    users_db_test = mycursor.fetchall()

    returnValues = []

    # Checking if user is registered already and adds their Access Level to the return values. 
    for u in users_db_test: 
        if email in u[3]:
            returnValues.append(u[4])
            returnValues.append(u[0])

    if returnValues == []:

        # If not then it will add the new user into the database and return their access level which is 0. 
        mycursor.execute('INSERT INTO users (first_name, last_name, email, access_level) VALUES (%s, %s, %s, %s);', data)

        mydb.commit()

        # add try catch here?  https://www.tutorialspoint.com/python_data_access/python_mysql_insert_data.htm

        # This is just for testing to see that someone was added. 
        mycursor.execute("SELECT user_id FROM users WHERE email=%s", (email, ))
        sqlFetch = mycursor.fetchall()

        returnValues.append(access_level)
        returnValues.append(sqlFetch[0][0])

    returnValues.append(getCartSize(email))

    # Returns [Access_level, user_id, cart_size]
    return json.dumps(returnValues)


@app.route("/api/<string:email>/userID")        # Looks up the User ID of someones email and returns the ID. (might not be in use, check later. )
def getUserID(email):
    mycursor.execute("SELECT * FROM users")
    users_db_test = mycursor.fetchall()

    for u in users_db_test:
        if email in u[3]:
            return json.dumps(u[0])

    return json.dumps(-1)

@app.route("/api/<string:email>/cart/size")     # !!! CHANGE HERE? DUMB/DUP NAME, is it in use? !!! Returns the Cart Size of a user. 
def apiGetCartSize(email):
    cart = getCartSize(email)

    if cart != []:
        return json.dumps(cart[0])
    else:
        return json.dumps(0)
        
@app.route("/api/cart/add", methods=["POST"])   # Adds item to users cart while increasing their Cart Size. Returns Cart Size. 
def addItemToCart():
    itemID = request.form.get("item_id")
    email = request.form.get("email")
    abort_if_email_is_null(email) # If the user is not logged in it will stop here and respond with an error message. 
    mycursor.execute("SELECT * FROM users")
    users_db_test = mycursor.fetchall()
    userID = 0

    for u in users_db_test:
        if email in u[3]:
            userID = u[0]
    
    data = (userID, itemID)

    mycursor.execute('INSERT INTO items_in_cart (user_id, book_id) VALUES (%s, %s);', data)
    mycursor.execute('UPDATE users SET cart_size = cart_size + 1 WHERE user_id=%s;', (userID, ))

    mydb.commit()

    mycursor.execute("SELECT cart_size FROM users WHERE user_id=%s;", (userID, ))
    totItems = mycursor.fetchall()

    return json.dumps(totItems)

@app.route("/api/cart/check", methods=["GET"])          # Returns items in users cart. 
def checkCart():
    email = request.args.get('email')
    userID = getUserID(email)
    mycursor.execute('SELECT book_id FROM items_in_cart WHERE user_id=%s;', (userID, ))
    data = mycursor.fetchall()

    output = []

    for d in data:
        mycursor.execute('SELECT * FROM books WHERE book_id=%s;', (d[0], ))
        temp = (mycursor.fetchall())
        # the fetchall() returns an Array of Tuples which is why the [0] is needed. 
        output.append(temp[0])
          
    return json.dumps(output, indent=4, sort_keys=True, default=str)

@app.route("/api/orders/check", methods=["GET"])
def getOrders():
    email = request.args.get('email')
    userID = getUserID(email)
    mycursor.execute('SELECT * FROM orders WHERE user_id=%s;', (userID, ))
    my_orders = mycursor.fetchall()
    all_orders = []
    for o in my_orders:
        mycursor.execute('SELECT book_id FROM items_in_order WHERE order_id=%s;', (o[0], ))
        sqlFetch = mycursor.fetchall()
        this_order = []
        this_order.append(o[0])
        this_order.append(o[2])
        this_order.append(o[3])
        for b in sqlFetch:
            mycursor.execute('SELECT * FROM books WHERE book_id=%s;', (b[0], ))
            this_order.append(mycursor.fetchall()[0])
        all_orders.append(this_order)

    return json.dumps(all_orders, indent=4, sort_keys=True, default=str)

@app.route("/api/books/sort")
def sortBooks():                # !!!! Fix this one so that sortBy can not be an illigal input !!!
    sortBy = request.args.get("sort_by")
    genre = request.args.get("genre")
    print("Sorting by {}, for the genre {}".format(sortBy, genre))

    sql = 'SELECT * FROM books '
    
    if genre != "null":
        sql = sql + " WHERE genre LIKE '%" + genre + "%'"

    sql = sql + ' ORDER BY ' + sortBy.lower().replace(" ", "_")

    # It makes more sense to sort book release dates as newest to oldest so it gets added "Descended" to it. 
    if sortBy.lower().replace(" ", "_") == "release_date":
        sql = sql + " DESC"
    
    mycursor.execute(sql)
    data = mycursor.fetchall()

    return json.dumps(data, indent=4, sort_keys=True, default=str)

@app.route("/api/book/edit", methods=["POST"])      # Could have been a PUT, as it is used for updating data, but this function will also be used to add, so I feel like post is fine here. 
def editBook():                                     #  Maybe they should just have been 2 seperate ones somehow. 
    id = request.form.get("id")
    title = request.form.get("title")
    author = request.form.get("author")
    volume = request.form.get("volume")
    release = request.form.get("release")
    synopsis = request.form.get("synopsis")
    price = request.form.get("price")
    genre = request.form.get("genre")
    format = request.form.get("format")

    mycursor.execute('SELECT book_id FROM books WHERE book_id=%s;', (id, ))  
    exsists = mycursor.fetchall()

    if exsists == []:
        mycursor.execute('INSERT INTO books (title, author, volume_nr, release_date, synopsis, price, genre, format, frontpage) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, IFNULL(%s, DEFAULT(frontpage)));', (title, author, volume, release, synopsis, price, genre, format, None))
        mydb.commit()
        print("Added new book called: {}".format(title))
        return "New Book Added"

    else:
        mycursor.execute('SELECT frontpage FROM books WHERE book_id=%s;', (id, ))
        image = mycursor.fetchall()[0][0]   # [0][0] becaues of the array of tuples. 
        mycursor.execute('UPDATE books SET title = %s, author = %s, volume_nr = %s, release_date = %s, synopsis = %s, price = %s, genre = %s, format = %s, frontpage = %s WHERE book_id=%s;', (title, author, volume, release, synopsis, price, genre, format, image, id))
        mydb.commit()
        print("--- Updated:  {}".format(title))
        return "Updated Book"


@app.route("/api/cart/item/delete/<int:id>/<string:email>", methods=["DELETE"])
def deleteItemFromCart(id, email):
    uid = getUserID(email)
    mycursor.execute('DELETE FROM items_in_cart WHERE book_id=%s AND user_id=%s LIMIT 1;', (id, uid))
    mycursor.execute('UPDATE users SET cart_size = cart_size - 1 WHERE user_id=%s;', (uid, ))
    mydb.commit()
    return "Deleted"

@app.route("/api/purchase", methods=["POST"])
def confirmPurchase():
    email = request.form.get("email")
    address = request.form.get("address")
    price = request.form.get("price")
    print("Purchase from: {}, with Address: {}, total price: {}, just came in!".format(email, address, price))
    user_id = getUserID(email)
    mycursor.execute('SELECT book_id FROM items_in_cart WHERE user_id=%s;', (user_id, ))
    items_bought = mycursor.fetchall()
    mycursor.execute('INSERT INTO orders (user_id, address, total_price) VALUES (%s, %s, %s);', (user_id, address, price))
    
    # Finding the latest order from the user that just purchased something. 
    mycursor.execute('SELECT MAX(order_id) FROM orders WHERE user_id=%s;', (user_id, ))
    new_order = mycursor.fetchall()

    for i in items_bought:
        mycursor.execute('INSERT INTO items_in_order (order_id, book_id) VALUES (%s, %s);', (new_order[0][0], i[0]))
    

    # This one is to empty the cart as the items are bought and stored in an order instead. 
    mycursor.execute('DELETE FROM items_in_cart WHERE user_id=%s;', (user_id, ))
    mycursor.execute('UPDATE users SET cart_size = 0 WHERE user_id=%s;', (user_id, ))
    mydb.commit()

    return "Successful"


# some parts here taken from "https://flask.palletsprojects.com/en/1.1.x/patterns/fileuploads/#a-gentle-introduction" just for reference. 
# This is for uploading images.     Yes, the "if method=POST" is kind of redundant, but too lazy to remove it. 
@app.route('/api/book/add/image', methods=['POST'])
def upload_file():
    id = request.args.get("id")
    fname = request.files['file'].filename
    mycursor.execute('UPDATE books SET frontpage = %s WHERE book_id=%s;', (fname, id))

    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            print("No file part")
            return "0"
            
        file = request.files['file']
        print("We got a file: {}".format(file))
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            print('No selected file')
            return redirect(request.url)
        if file:
            print("ok, something might have happened! ")
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return "Successful!"
    return "0"


@app.route("/product")          # !!! Don't think this one is in use, check later !!!
def getProductPageTest():
    return render_template("product.html")

@app.route("/product/<string:book_title>")      # Renders detailed pages for a product. 
def getProductPage(book_title):
    print("The book {} was requested".format(book_title))
    return render_template("product.html")

@app.route("/product/edit/<string:book_title>")      # Renders an Admin page for adding or editing products. 
def getEditProductPage(book_title):
    print("The book {} was requested".format(book_title))
    return render_template("editproduct.html")

@app.route("/orders/<int:id>")      # Renders an Admin page for adding or editing products. 
def checkingMyOrders(id):
    print("Orders for user {} was requested".format(id))
    return render_template("myorders.html")

@app.route("/checkout")      # Renders detailed pages for a product. 
def gotToCheckout():
    return render_template("checkout.html")


# ------------- ERROR HANDELING ------------------
@app.errorhandler(400)
def bad_request(e):
    return jsonify(error=str(e)), 400


# OAuth Token validation: 
def validate_token(token):

    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        idinfo = goog_token.verify_oauth2_token(token, goog_req.Request(), oauth_id)
        print("\nTOKEN VALID. User: {}\nUser data: \n{}\n"
            .format(idinfo['given_name'],idinfo))
        return idinfo

    except ValueError as err:
        # Invalid token
        print(f"Token validation failed: {err}")

    return False

if __name__ == '__main__':
    # Connecting to the port Docker is forwarding. 
    app.run(host="0.0.0.0") 
    mydb.close()