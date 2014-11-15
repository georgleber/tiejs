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
    $('#form').TieJS({bindingSource: user});

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




TieJS Angular Directive
====

Example how to use the directive:

1. include tiejs.js and tiejs-angular.js into the project
2. add the directive to your angular modul

     var app = angular.module('testApp', ['tiejs-ang']);

3. in your controller.js create your tiejs form:

    // ---- TieJS Angular Form Example---- //
    (function () {
        var firstData = [{     // first we have some rows...
            type: "text",
            data: {
                label: "Name",
                name: "name",
                placeholder: "Benutzername",
                attributes: "autofocus required"
            }
        }, {
            type: "number",
            data: {
                label: "Alter",
                name: "age",
                placeholder: "Alter",
                attributes: "required"
            }
        }, {
            type: "color",
            data: {
                label: "Lieblings-Farbe",
                name: "wantedColor",
                attributes: "required"
            }
        }];

        // as columns
        var secondData = [{  //then we have two columns...
            type: "text",
            data: {
                label: "Start",
                name: "start",
                placeholder: "hh:mm",
                attributes: "autofocus required",
                regex: "^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
            }
        }, {
            type: "text",
            data: {
                label: "Ende",
                name: "end",
                placeholder: "hh:mm",
                attributes: "required",
                regex: "^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
            }
        }];

        // as row fields        //then we have again a row...
        var thirdData = [{
            type: "checkbox",
            data: {
                label: "Alles ok so ?",
                name: "checkAll"
            }
        }];

        var bindings = [{
            "name": "name",
            "age": "age",
            "wantedColor": "wantedColor",
            "start": "start",
            "end": "end",
            "checkAll": "checkAll"
        }];

        $scope.testForm = {
            "fields": [
                {"typ": "field", "data": firstData},
                {"typ": "column", "data": secondData},
                {"typ": "field", "data": thirdData}
            ],
            "bindings": bindings
        };
    })();


4. create an tiejs tag in the html code:

    <tiejs-form data-form-name="testForm"
                data-show-required-asterisk="true"
                data-fields="testForm.fields"
                data-bindings="testForm.bindings"
                data-binding-source="testdata"
                data-on-submit="onSubmit"
                data-submit-button-id="submitButtonId"></tiejs-form>



Dependencies
====

- jQuery
    http://jquery.com/

- Bootstrap Colorpicker 2.0 (for color fields)
    https://github.com/mjolnic/bootstrap-colorpicker
