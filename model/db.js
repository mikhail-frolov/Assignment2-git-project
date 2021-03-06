//to do: function for meals similar to email 
// get meals similar to get users
// make it work from MongoDB


const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

let userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        trim: true
    },
    fname: {
        type: String
    },
    lname: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

let packageSchema = new Schema({
    title: String,
    category: String,
    price: Number,
    meals: Number,
    description: String,
    img: String,
    top: {
        type: Boolean,
        default: false
    }
});

let Users;
let Packages;

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection("mongodb+srv://mfrolov:3jdeSnedd@senecaweb.isxj3.mongodb.net/SenecaWeb?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

        db.on("error", (err) => {
            reject(err);
        });

        db.once("open", () => {
            Packages = db.model("packages", packageSchema);
            Users = db.model("users", userSchema);
            resolve();
        });
    });
}

module.exports.getTopAllMeals = (top) => {
    return new Promise((resolve, reject) => {
        if (top == true) {
            GetMeals = Packages.find({ top: true });
        } else {
            GetMeals = Packages.find();
        }

        GetMeals
            .exec()
            .then((meals) => {
                if (meals.length != 0) {
                    resolve(meals.map((meal) => meal.toObject()));
                } else {
                    reject("No meals have been found");
                }

            })
            .catch((err) => {
                reject(err);
            });
    });
};

module.exports.getPackagesByTitle = (ttitle) => {
    return new Promise((resolve, reject) => {
        Packages.find({ title: ttitle })
            .exec()
            .then((package) => {
                if (package.length != 0) {
                    resolve(package.map((ppackage) => ppackage.toObject()));
                } else {
                    reject("No meals have been found");
                }

            })
            .catch((err) => {
                reject(err);
            });
    });
};

module.exports.validateNewPackage = (data) => {
    return new Promise((resolve, reject) => {
        data.errors = [];
        const numbersCheck = /[0-9]+[.]?[0-9]*/;
        data.top = (data.top) ? true : false;

        let flag = true;

        if (data.title == "") {
            data.errors.push("Please, enter the Title");
            flag = false;
        }

        if (data.category == "") {
            data.errors.push("Please, enter the Category");
            flag = false;
        }

        if (data.price == "") {
            data.errors.push("Please, enter the Price");
            flag = false;
        } else {

            if (!data.price.match(numbersCheck)) {
                data.errors.push("Numbers Only Accepted");
                flag = false;
            }
        }

        if (data.description == "") {
            data.errors.push("Please, enter the Description");
            flag = false;
        }

        if (!flag) {
            reject(data);
        } else {
            this.getPackagesByTitle(data.title)
                .then((meal) => {
                    data.errors.push("An item with this title is already exists");
                    reject(data);
                })
                .catch(() => {
                    resolve(data);
                });
        }
    });
}


module.exports.addMeal = (data) => {
    return new Promise((resolve, reject) => {
        let newPackage = new Packages({
            title: data.title,
            category: data.category,
            price: data.price,
            meals: data.meals,
            description: data.description,
            top: data.top,
            img: data.img

        });

        newPackage.save((err) => {
            if (err) {
                console.log("Error: " + err);
                reject(err);
            } else {
                console.log("Meal to add: " + data.title);
                resolve(newPackage);
            }
        });
    });
}


module.exports.addUser = (data) => {
    return new Promise((resolve, reject) => {
        let newUser = new Users({
            email: data.email,
            fname: data.fname,
            lname: data.lname,
            password: data.password,
            admin: data.admin
        });

        bcrypt.genSalt(10)
            .then(salt => bcrypt.hash(newUser.password, salt))
            .then(hash => {
                newUser.password = hash;
                newUser.save((err) => {
                    if (err) {
                        console.log("Error: " + err);
                        reject(err);
                    } else {
                        console.log("New User's Email: " + data.email);
                        resolve(newUser);
                    }
                });
            })
            .catch(err => {
                console.log(err);
                reject("Error: invalid hashing of password!");
            });
    });
}

module.exports.getUsersByEmail = (Email) => {
    return new Promise((resolve, reject) => {
        Users.find({ email: Email })
            .exec()
            .then((fetchedUsers) => {
                if (fetchedUsers.length != 0)
                    resolve(fetchedUsers.map(user => user.toObject()));
                else
                    reject("User not found!");
            }).catch((err) => {
                console.log("Error finding the user with email:" + err);
                reject(err);
            });
    });
}

module.exports.validateUserRegistration = (data) => {
    return new Promise((resolve, reject) => {
        data.errors = [];
        const regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
        const re = /^[A-Za-z0-9]+$/;

        let flag = true;

        if (data.fname == "") {
            data.errors.push("First Name is required");
            flag = false;
        }

        if (data.lname == "") {
            data.errors.push("Last Name is required");
            flag = false;
        }

        if (data.email == "") {
            data.errors.push("Email is required");
            flag = false;
        } else if (!regex.test(data.email)) {
            data.errors.push("Email must be like example@example.ca");
            flag = false;
        }

        if (data.password == "") {
            data.errors.push("Password is required");
            flag = false;
        }


        if (data.password.length < 6 || data.password.length > 12) {
            data.errors.push("Password must be 6 to 12 characters long");
            flag = false;
        } else if (!re.test(data.password)) {
            data.errors.push("Password must contain letters and numbers only");
            flag = false;
        }

        if (!flag) {
            reject(data);
        } else {
            this.getUsersByEmail(data.email)
                .then((user) => {
                    data.errors.push("This email is already registered!");
                    reject(data);
                })
                .catch(() => {
                    resolve(data);
                });
        }

    });
}

module.exports.validateUserLogin = (data) => {
    return new Promise((resolve, reject) => {
        data.errors = [];

        if (data.email == "") {

            data.errors.push("Email is required");

        }

        if (data.password == "") {

            data.errors.push("Password is required");

        }

        if (data.email == "" || data.email == "") {

            reject(data);

        }


        this.getUsersByEmail(data.email)
            .then((user) => {
                bcrypt
                    .compare(data.password, user[0].password)
                    .then((res) => {
                        if (res) {
                            resolve(user[0]);
                        } else {
                            data.errors.push("Wrong password or email, try again");
                            reject(data);
                        }
                    })
                    .catch((err) => {
                        console.log("Cannot compare passwords " + err);
                        reject(data);
                    });
            })
            .catch((err) => {
                console.log("Cannot get by email " + err);
                data.errors.push("Wrong password or email, try again");
                reject(data);
            });
    });
};

//edit in dataclerk

module.exports.validateMealEdit = function(data) {
    return new Promise((resolve, reject) => {
        data.errors = [];
        let check = true;

        data.top = (data.top) ? true : false;

        if (data.img == "") {
            data.errors.push("This field is required");
            check = false;
        }

        if (data.title == "") {
            data.errors.push("This field is required");
            check = false;
        }

        if (data.category == "") {
            data.errors.push("This field is required");
            check = false;
        }

        if (data.price == "") {
            data.errors.push("This field is required");
            check = false;
        } else {
            var numbersonly = /[0-9]+[.]?[0-9]*/;
            if (!data.price.match(numbersonly)) {
                data.errors.push("Only Numbers alowed");
                check = false;
            }
        }

        if (data.description == "") {
            data.errors.push("This field is required");
            check = false;
        }

        if (!check) {
            reject(data);
        } else {
            resolve(data);
        }
    });
}

module.exports.editMeal = (data) => {
    return new Promise((resolve, reject) => {
        data.top = (data.top) ? true : false;
        Packages.updateOne({ title: data.title }, {
                $set: {
                    img: data.img,
                    category: data.category,
                    price: data.price,
                    meals: data.meals,
                    description: data.description,
                    top: data.top
                }
            })
            .exec()
            .then(() => {
                console.log(`Meal ${data.title} has been updated`);
                resolve();
            }).catch((err) => {
                reject(err);
            });
    });
}