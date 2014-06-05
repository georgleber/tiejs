Tie.js
=====

TieJS makes it easy to create forms via JSON and bind objects to its form fields. Furthermore it has HTML5 validation functionalities

Getting Started
=====
First create a new javascript object, which will be tied to the form.

    var User = function() {
        var self = this;

        self.id = 0;
        self.username = '';
        self.firstname = '';
        self.lastname = '';
        self.email = '';
    };
    
Adding TieJS to a form and setting user as `bindingSource`:

    var user = new User(); 
    $('#form'.TieJS({bindingSource: user});

Define the fields and tie the properties of the user object to the form:

    var tiejs = form.data('tiejs').addFields([{
                type: "text",
                data: {
                    label: "Benutzername",
                    name: "username",
                    placeholder: "Benutzername",
                    attributes: "autofocus required"
                }
            }, {
                type: "text",
                data: {
                    label: "Vorname",
                    name: "firstname",
                    placeholder: "Vorname"
                }
            }, {
                type: "text",
                data: {
                    label: "Nachname",
                    name: "lastname",
                    placeholder: "Nachname"
                }
            }, {
                type: "email",
                data: {
                    label: "E-Mail-Adresse",
                    name: "email",
                    placeholder: "E-Mail-Adresse",
                    attributes: "required"
                }
            }
        ]).addBindings([{
                "username": "username",
                "firstname": "firstname",
                "lastname": "lastname",
                "email": "email"
            }
        ]);
