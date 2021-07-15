CREATE DATABASE an_odd_bookstore;
USE an_odd_bookstore;

CREATE TABLE users (
    user_id         INT unsigned NOT NULL AUTO_INCREMENT,     
    first_name      VARCHAR(150) NOT NULL,
    last_name       VARCHAR(150),
    email           VARCHAR(150) NOT NULL UNIQUE,
    access_level    INT unsigned NOT NULL DEFAULT 0,
    cart_size       INT DEFAULT 0,
    PRIMARY KEY     (user_id)
);

CREATE TABLE books (
    book_id         INT unsigned NOT NULL AUTO_INCREMENT,
    title           VARCHAR(150) NOT NULL,
    author          VARCHAR(150) NOT NULL,
    volume_nr       INT NOT NULL,
    release_date    DATE NOT NULL,              # Format here is YYYY-MM-DD
    synopsis        VARCHAR(1000) NOT NULL,     # Could here also use TEXT for longer text format. 
    price           DECIMAL(6,2) NOT NULL,      # In dollars, this specifies 4 digits with 2 decimals, so max 9999.99$. I dont think this store needs bigger prices. 
    genre           VARCHAR(150) NOT NULL,
    format          VARCHAR(32) NOT NULL, 
    frontpage       VARCHAR(150) DEFAULT "no_frontpage.jpg",
    PRIMARY KEY     (book_id)
);

CREATE TABLE orders (
    order_id        INT unsigned NOT NULL AUTO_INCREMENT,
    user_id         INT unsigned,
    address         VARCHAR(150),
    total_price     DECIMAL(6,2), 
    PRIMARY KEY     (order_id),
    FOREIGN KEY     (user_id) REFERENCES users(user_id)
);

CREATE TABLE items_in_order (
    order_id        INT unsigned,
    book_id         INT unsigned,
    FOREIGN KEY     (order_id) REFERENCES orders(order_id),
    FOREIGN KEY     (book_id) REFERENCES books(book_id)
);

CREATE TABLE items_in_cart (        # I could possibly instead just saved carts as Sessions, but decided to use a table for it. 
    user_id         INT unsigned,
    book_id         INT unsigned,
    FOREIGN KEY     (user_id) REFERENCES users(user_id),
    FOREIGN KEY     (book_id) REFERENCES books(book_id)
);

# All books in the store
INSERT INTO books (title, author, volume_nr, release_date, synopsis, price, genre, format, frontpage) VALUES
("A Sister's All You Need.", "Yomi Hirasaka", 1, "2018-06-15", "Itsuki Hashima is a novelist who's hopelessly enamored with the idea of little sisters and is constantly surrounded by colorful characters. A world class genius and love-guru who's beauty almost seems a waste on her. A girl who's constantly troubled by her friendships, love interests, and can't even find refuge in her dreams. A ridiculously talented illustrator. Each of them have as many problems and worries as the next and they never have a dull day together as they play games, travel, and work together. From the same author of the famous I Don't Have Many Friends, Yomi Hirasaka!", 12.90, "Romance, Comedy", "Light Novel", "a_sisters_all_you_need_vol_1_frontpage.jpg"),
("The Asterisk War", "Yuu Miyazaki", 1, "2016-08-22", "The school-city of Rokka-also known as \"Asterisk.\" Here boys and girls of the Starpulse Generation all compete in the Seibusai-the \"star battle festival,\" fighting for glory on the greatest combat entertainment stage of the world. Ayato Amagiri has just arrived at one of these academies at the express invitation of its student council president, but when he begins his career by making a dangerous enemy, his life on Asterisk is off to a rough start!", 15.00, "Action, Sci-fy", "Light Novel", "asterisk_war_vol_1_frontpage.jpg"),
("World's Strongest Rearguard: Labyrinth Country's Novice Seeker", "Towa", 1, "2020-02-14", "Corporate slave Arihito Atobe's death in a freak bus accident marks the beginning of his new life as a kind of adventurer called a Seeker. Reborn into a fantasy world, he settles into a previously unknown job class called \"rearguard,\" capable of providing his (all-female) party with critical attack, defense, and recovery support. And it comes with an added bonus: Simply being at the back of the party line increases his companions' fondness for him! Freed from the shackles of corporate life, Arihito is eager to start fresh as a newly minted Seeker!", 15.00, "Adventure, Fantasy", "Light Novel", "worlds_strongest_reargard_vol_1_frontpage.jpg"),
("That Time I Got Reincarnated as a Slime", "Fuse", 1, "2019-04-02", "Lonely thirty-seven-year-old Satoru Mikami is stuck in a dead-end job, unhappy with his mundane life, but after dying at the hands of a robber, he awakens to a fresh start in a fantasy realm...as a slime monster! As he acclimates to his goopy new existence, his exploits with the other monsters set off a chain of events that will change his new world forever!", 12.00, "Action, Fantasy", "Light Novel", "reincarnated_as_a_slime_vol_1_frontpage.jpg"),
("I've Been Killing Slimes for 300 Years and Maxed Out My Level", "Kisetsu Morita", 1, "2018-07-24", "After living a painful life as an office worker, Azusa ended her short life by dying from overworking. So when she found herself reincarnated as an undying, unaging witch in a new world, she vows to spend her days stress free and as pleasantly as possible. She ekes out a living by hunting down the easiest targets - the slimes! But after centuries of doing this simple job, she's ended up with insane powers...how will she maintain her low key life now?!", 15.00, "Comedy, Fantasy", "Light Novel", "killed_slimes_for_300_years_vol_1_frontpage.jpg"),
("Sword Art Online", "Reki Kawahara", 1, "2014-04-22", "Read the novel that ignited the phenomenon! In the year 2022, gamers rejoice as Sword Art Online - a VRMMORPG (Virtual Reality Massively Multiplayer Online Role Playing Game) like no other - debuts, allowing players to take full advantage of the ultimate in gaming technology: NerveGear, a system that allows users to completely immerse themselves in a wholly realistic gaming experience. But when the game goes live, the elation of the players quickly turns to horror as they discover that, for all its amazing features, SAO is missing one of the most basic functions of any MMORPG - a log-out button. Now trapped in the virtual world of Aincrad, their bodies held captive by NerveGear in the real world, users are issued a chilling ultimatum: conquer all one hundred floors of Aincrad to regain your freedom. But in the warped world of SAO, \"game over\" means certain death - both virtual and real...", 7.30, "Action, Adventure", "Light Novel", "sword_art_online_vol_1_frontpage.jpg");

# Creating a test users just to see if any functionality is working
INSERT INTO users (first_name, last_name, email, access_level) VALUES 
("Odds", "Dummy", "odds.dummy@gmail.com", 100),
("Odd Martin", "Kveseth", "oddm64@gmail.com", 100);


# Just looking over the table for debugging
SELECT * FROM books;
SELECT * FROM users;

# This is the user for the python backend to use. 
CREATE USER "odd" IDENTIFIED BY "MySuperHardPassword!1";
GRANT ALL PRIVILEGES ON * TO "odd";