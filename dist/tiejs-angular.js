/*!
 TieJS - http://develman.github.io/tiejs
 Licensed under the MIT license

 Copyright (c) 2014 Georg Henkel <georg@develman.de>, Christoph Huppertz <huppertz.chr@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
angular.module("tiejs-ang", [])
    .directive('tiejsForm', function () {
        return {
            restrict: 'E',
            scope: {
                "formName": "@formName",
                "showRequiredAsterisk": "@showRequiredAsterisk",    // shows an star on required fields
                "fields": "=fields",                                // fields which should be created in the form
                "bindings": "=bindings",                            // binding option between field-name and variable-name
                "bindingSource": "=bindingSource",                  // object with data
                "onSubmit": "=onSubmit",                            // onsubmit callback function
                "submitButtonId": "@submitButtonId"                 // id of submit button (needed if button is outside of the formular)
            },
            template: '<form></form>',
            link: function (scope, element, attr) {
                var colorFieldNames = new Array();

                var options = {
                    "showRequiredAsterisk": scope.showRequiredAsterisk,
                    "formName": scope.formName,
                    "bindingSource": scope.bindingSource,
                    "onSubmit": scope.onSubmit
                };

                var formElem = element.find("form");
                formElem.TieJS(options);
                var tiejsForm = formElem.data('tiejs');


                var checkIfDataHasColorField = function(fieldData){
                    fieldData.forEach(function(item){
                        if(item.type === "color"){
                            scope.bindings.forEach(function(bindingData){
                                var name = bindingData[item.data.name];
                                if(name)
                                    colorFieldNames.push(name);
                            });
                        }
                    });
                }

                scope.fields.forEach(function (item) {
                    if (item.fieldData) {
                        if (item.fieldType === "field") {
                            tiejsForm.addFields(item.fieldData);
                            checkIfDataHasColorField(item.fieldData);
                        } else if (item.fieldType === "column") {
                            tiejsForm.addColumns(item.fieldData);
                        } else {
                            if (console) console.log("tiejs-directive: unknown type of field (only type -field- and -column- are allowed)");
                        }
                    }
                });
                tiejsForm.addBindings(scope.bindings);


                //init color picker, if we have an color field
                var colorPickers = new Array();
                if(colorFieldNames.length > 0){
                    var colorpickerElements = formElem.find(".colorpicker");
                    for(var i=0; i < colorFieldNames.length; i++){
                        var colorpicker = $(colorpickerElements[i]).colorpicker({
                            "format": "hex",
                            "color": "#" + scope.bindingSource[colorFieldNames[i]]
                        });
                        colorpicker.on('changeColor', function (value) {
                            var code = value.color.toHex();
                            scope.bindingSource[colorFieldNames[i]] = code.replace("#", "");
                        });
                        colorPickers.push(colorpicker);
                    }
                }


                // trigger submit from outside handler
                $('#' + scope.submitButtonId).on('click', function () {
                    formElem.trigger('submit');
                });


            }

        };
    });