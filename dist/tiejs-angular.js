/*!
 TieJS - http://develman.github.io/tiejs
 Licensed under the MIT license

 Copyright (c) 2014 Georg Henkel <georg@develman.de>, Christoph Huppertz <huppertz.chr@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
angular.module("tiejs-ang", ['angular.css.injector'])
    .directive('tiejsForm', [ 'cssInjector', function (cssInjector) {
        return {
            restrict: 'E',
            scope: {
                "formName": "@formName",
                "showRequiredAsterisk": "@showRequiredAsterisk",    // shows an star on required fields
                "fields": "=fields",                                // fields which should be created in the form
                "bindings": "=bindings",                            // binding option between field-name and variable-name
                "bindingSource": "=bindingSource",                  // object with data
                "onSubmit": "=onSubmit",                            // onsubmit callback function
                "submitButtonId": "@submitButtonId",                // id of submit button (needed if button is outside of the formular)
                "reloadFlag": "=reloadFlag"                         // trigger flag to reload the hole tiejs content
            },
            template: '<form></form>',
            link: function (scope, element, attr) {

                var addSpecifiedFieldToArray = function (item, array) {
                    scope.bindings.forEach(function (bindingData) {
                        var name = bindingData[item.data.name];
                        if (name)
                            array.push(name);
                    });
                };

                var init = function (scope, element, attr) {
                    var colorFieldNames = new Array();
                    var dateFieldNames = new Array();
                    var timeFieldNames = new Array();
                    var wysiwygFieldNames = new Array();

                    var checkIfDataHasSpecialField = function (fieldData) {
                        fieldData.forEach(function (item) {
                            switch (item.type) {
                                case "color":
                                    addSpecifiedFieldToArray(item, colorFieldNames);
                                    break;
                                case "date":
                                    addSpecifiedFieldToArray(item, dateFieldNames);
                                    break;
                                case "time":
                                    addSpecifiedFieldToArray(item, timeFieldNames);
                                    break;
                                case "wysiwyg":
                                    addSpecifiedFieldToArray(item, wysiwygFieldNames);
                                    break;
                            }
                        });
                    };

                    var options = {
                        "showRequiredAsterisk": scope.showRequiredAsterisk,
                        "formName": scope.formName,
                        "bindingSource": scope.bindingSource,
                        "onSubmit": scope.onSubmit
                    };

                    var formElem = element.find("form");
                    formElem.TieJS(options);
                    var tiejsForm = formElem.data('tiejs');

                    scope.fields.forEach(function (item) {
                        if (item.fieldData) {
                            if (item.fieldType === "field") {
                                tiejsForm.addFields(item.fieldData);
                            } else if (item.fieldType === "column") {
                                tiejsForm.addColumns(item.fieldData);
                            } else {
                                if (console) console.log("tiejs-directive: unknown type of field (only type -field- and -column- are allowed)");
                            }

                            // if field is color, date or time -> add it to array for init addons
                            checkIfDataHasSpecialField(item.fieldData);
                        }
                    });
                    tiejsForm.addBindings(scope.bindings);


                    //init color picker addon, if color field is available
                    var colorPickers = new Array();
                    if (colorFieldNames.length > 0) {
                        var colorpickerElements = formElem.find(".color");
                        for (var i = 0; i < colorFieldNames.length; i++) {
                            var colorpicker = $(colorpickerElements[i]).colorpicker({
                                color: "#" + scope.bindingSource[colorFieldNames[i]]
                            });
                            colorpicker.on('changeColor', function (value) {
                                var code = value.color.toHex();
                                scope.bindingSource[colorFieldNames[i]] = code.replace("#", "");
                            });
                            colorPickers.push(colorpicker);
                        }
                    }

                    //init date picker addon, if color field is available
                    var datePickers = new Array();
                    if (dateFieldNames.length > 0) {
                        var datepickerElements = formElem.find(".date");
                        for (var i = 0; i < datepickerElements.length; i++) {
                            var datepicker = $(datepickerElements[i]).datetimepicker({
                                language: 'de',
                                pickTime: false,
                                showToday: true,

                                daysOfWeekDisabled:[0] //disable sunday
                            });
                            datePickers.push(datepicker);
                        }
                    }

                    //init date picker addon, if color field is available
                    var timePickers = new Array();
                    if (timeFieldNames.length > 0) {
                        var timepickerElements = formElem.find(".time");
                        for (var i = 0; i < timepickerElements.length; i++) {
                            var clockpicker = $(timepickerElements[i]).clockpicker({
                                placement: 'bottom',
                                align: 'left',
                                autoclose: 'true'
                            });
                            timePickers.push(datepicker);
                        }
                    }

                    //init WYSIWYG Textarea addon https://github.com/samclarke/SCEditor
                    var editorPickers = new Array();
                    if (wysiwygFieldNames.length > 0) {
                        var editorPickerElements = formElem.find(".wysiwyg");
                        for (var i = 0; i < editorPickerElements.length; i++) {
                            var editorpicker = $(editorPickerElements[i]).wysiwyg();
                            $(editorPickerElements[i]).css('overflow', 'scroll');
                            $(editorPickerElements[i]).css('min-height', '400px');
                            editorPickers.push(editorpicker);
                        }
                    }

                    // load plugin css styles
                    if(cssInjector){
                        if(colorPickers.length > 0){
                            //cssInjector.add("/bower_components/mjolnic-bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css");
                            cssInjector.add("/public/js/lib/mjolnic-bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css");
                        }
                        if(datePickers.length > 0){
                            //cssInjector.add("/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.css");
                            cssInjector.add("/public/js/lib/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css");
                        }
                        if(timePickers.length > 0){
                            //cssInjector.add("/bower_components/clockpicker/dist/bootstrap-clockpicker.min.css");
                            cssInjector.add("/public/js/lib/clockpicker/dist/bootstrap-clockpicker.min.css");
                        }
                    }

                    // trigger submit from outside handler
                    $('#' + scope.submitButtonId).on('click', function () {
                        formElem.trigger('submit');
                    });
                };
                init(scope, element, attr);


                // reload tiejs form listener
                if (scope.reloadFlag != 'undefined') {
                    scope.$watch("reloadFlag", function () {
                        $(element).find('form').children().remove(); //remove old html
                        init(scope, element, attr);
                    });
                }
            }

        };
    }]);
