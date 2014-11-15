/**
 * File: , Created: 11.11.2014 - 19:38
 * Created by: Christoph Huppertz <huppertz.chr@gmail.com>
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





