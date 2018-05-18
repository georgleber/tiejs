/*!
 TieJS - http://develman.github.io/tiejs
 Licensed under the MIT license

 Copyright (c) 2018 Georg Henkel <g.henkel@cg-solutions.de>, Christoph Huppertz <c.huppertz@cg-solutions.de>

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// AMD support
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // using AMD; register as anon module
        define(['jquery'], factory);
    } else {
        // no AMD; invoke directly
        factory(jQuery);
    }
}

(function ($) {
    "use strict";

    var TieJS = function (form, options) {
        var self = $(this);
        var $form = $(form);
        var fieldNames = [];

        // settings
        var settings = $.extend({
            showRequiredAsterisk: true,
            requiredText: "Mit <span class='required-sign'>*</span> markierte Felder sind Pflichtfelder.",
            formName: null,
            validationEnabled: true,
            globalValidationFailedText: "Bitte beheben Sie die im Formular hervorgehobenen Fehler.",
            bindingSource: {},
            onSubmit: function () {
            }
        }, options);

        _initForm();

        this.addFields = function (fields) {
            $.each(fields, function (index, field) {
                if (field.data) {
                    $form.append(_addField(field.type, field.data));
                    if (_findInArray(field.data.name, fieldNames) === null) {
                        fieldNames.push({name: field.data.name, binding: ""});
                    }
                }
            });

            return this;
        };

        this.addColumns = function (columns) {
            if (columns.length > 0) {
                $form.append(_addColumns(columns, fieldNames));
            }

            return this;
        };

        this.addBindings = function (bindings) {
            if (settings.bindingSource) {
                $.each(bindings, function (index, binding) {
                    $.each(binding, function (fieldName, property) {

                        // check if property is chained with points -> then it is another object in binding source
                        var binding = settings.bindingSource;
                        if (property.indexOf('.') != -1) {
                            var lastPointIdx = property.lastIndexOf('.');
                            var namespace = property.substr(0, lastPointIdx);
                            property = property.substr(lastPointIdx + 1);

                            var tmp = "settings.bindingSource." + namespace;
                            binding = eval(tmp); // jshint ignore:line
                        }

                        _bind($form, binding, fieldName, property);

                        var fieldNameData = _findInArray(fieldName, fieldNames);
                        fieldNameData.binding = property;
                    });
                });
            }

            return this;
        };

        this.captureFields = function () {
            $form.find(':input:not(:button)').each(function (index, field) {
                var fieldName = $(field).attr('name');
                if (_findInArray(fieldName, fieldNames) === null) {
                    fieldNames.push({name: fieldName, binding: ""});
                }
            });

            return this;
        };

        this.updateSettings = function (newSettings) {
            $.extend(settings, newSettings);
            this.reload();
        };

        this.reload = function () {
            _clearMarker($form);

            $.each(fieldNames, function (index, fieldNameData) {
                _bind($form, settings.bindingSource, fieldNameData.name, fieldNameData.binding);
            });
        };

        this.markFieldError = function (fieldNames, errorMessage) {
            $.each(fieldNames, function (index, fieldName) {
                var field = $form.find('[name=' + fieldName + ']');
                _addFieldError(field);
            });

            _addFormError($form, errorMessage);
        };

        this.markFormError = function (errorMessage) {
            _addFormError($form, errorMessage);
        };

        this.enableValidation = function () {
            _clearMarker($form);
            settings.validationEnabled = true;
        };

        this.disableValidation = function () {
            _clearMarker($form);
            settings.validationEnabled = false;
        };

        function _initForm() {
            if (settings.formName) {
                $form.attr('name', settings.formName);
            }

            if (settings.showRequiredAsterisk) {
                var info = $("<p class='required-info'>" + settings.requiredText + "</p>");
                $form.prepend(info);
            }

            $form.addClass("tiejs-form");
            $form.on('submit', function (e) {
                e.preventDefault();

                if (_validate($form, fieldNames)) {
                    settings.onSubmit($form);
                }
            });
        }

        var _addField = function (type, data) {
            var field = null;
            switch (type) {
                case 'text':
                case 'number':
                case 'email':
                case 'password':
                case 'regex':
                case 'typeahead':
                    field = _defaultField(type, data);
                    break;
                case 'checkbox':
                    field = _checkboxField(data);
                    break;
                case 'radio':
                    field = _radioField(data);
                    break;
                case 'select':
                    field = _selectField(data, false);
                    break;
                case 'tags':
                    field = _selectField(data, true);
                    break;
                case 'color':
                    field = _defaultAddonField('color', data);
                    break;
                case 'date':
                    field = _defaultAddonField('date', data);
                    break;
                case 'time':
                    field = _defaultAddonField('time', data);
                    break;
                case 'longtext':
                    field = _textareaField(data);
                    break;
                case 'wysiwyg':
                    field = _wysiwygField(data);
                    break;
                case 'button':
                    field = _button(data);
                    break;
                case 'file':
                    field = _file(data);
                    break;
            }

            return field;
        };

        var _addColumns = function (columns, fieldNames) {
            var row = $("<div></div>");
            row.addClass("row");

            $.each(columns, function (index, field) {
                var column = $("<div></div>");
                column.addClass("col-md-6");

                if (field.data) {
                    column.append(_addField(field.type, field.data));
                    if (_findInArray(field.data.name, fieldNames) === null) {
                        fieldNames.push({name: field.data.name, binding: ""});
                    }
                }

                row.append(column);
            });

            return row;
        };

        var _bind = function ($obj, bindingSource, fieldName, property) {
            var field = $obj.find('[name=' + fieldName + ']');

            if (field && typeof (bindingSource[property]) !== 'undefined') {
                var type = field.prop('type');
                if ("undefined" === typeof type) {
                    type = field.attr('type');
                }

                $obj.on("change", field, function (event, data) {
                    if (field.attr("name") === $(event.target).attr("name")) {
                        var value;
                        switch (type) {
                            case 'checkbox':
                                value = field.is(':checked') ? 1 : 0;
                                bindingSource[property] = value;
                                break;
                            case 'radio':
                                value = $obj.find('input[name=' + fieldName + ']:checked').val();
                                bindingSource[property] = value;
                                break;
                            case 'select':
                                if (!$(event.target).hasClass("tags")) { //only for single select fields
                                    value = $obj.find('select[name=' + fieldName + '] option:selected').val();
                                    bindingSource[property] = value;
                                }
                                break;
                            case 'wysiwyg':
                                value = $obj.find('div[name=' + fieldName + ']').html();
                                bindingSource[property] = value;
                                break;
                            case 'file':
                                bindingSource[property] = field.prop('files')[0];
                                var label = field.val().replace(/\\/g, '/').replace(/.*\//, '');
                                $obj.find('input[name=' + fieldName + '_label]').val(label);
                                break;
                            default:
                                bindingSource[property] = field.val();
                        }
                    }
                });

                _updateFieldData(field, bindingSource, property);
            }
        };

        var _validate = function ($obj, fieldNames) {
            _clearMarker($obj);

            var isValid = true;
            if (!settings.validationEnabled) {
                return isValid;
            }

            $.each(fieldNames, function (index, fieldNameData) {
                var field = $obj.find('[name=' + fieldNameData.name + ']');
                var type = field.prop('type');
                if ("undefined" === typeof type) {
                    type = field.attr('type');
                }

                var value = field.val();
                if (type === 'wysiwyg') {
                    value = field.html();
                }

                if (_hasAttribute(field, 'required')) {
                    switch (type) {
                        case 'radio':
                            if (field.is(':checked') === false) {
                                isValid = false;
                                _addFieldError(field);
                            }
                            break;

                        case 'checkbox':
                            if (!value || field.prop('checked') === false) {
                                isValid = false;
                                _addFieldError(field);
                            }
                            break;

                        case 'select-one':
                            if (!value || value == '0') {
                                isValid = false;
                                _addFieldError(field);
                            }
                            break;

                        default:
                            if (!value) {
                                isValid = false;
                                _addFieldError(field);
                            }
                    }
                } else if (type == 'radio' && field.closest('div').hasClass('required')) {
                    if (field.is(':checked') === false) {
                        isValid = false;
                        _addFieldError(field);
                    }
                }

                var regex;
                switch (type) {
                    case 'number':
                        if (value && !$.isNumeric(value)) {
                            isValid = false;
                            _addFieldError(field);
                        }
                        break;

                    case 'email':
                        regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        if (value && !regex.test(value)) {
                            isValid = false;
                            _addFieldError(field);
                        }
                        break;
                }

                var regexStr = field.attr('data-regex');
                if (regexStr) {
                    regex = new RegExp(regexStr);
                    if (value && !regex.test(value)) {
                        isValid = false;
                        _addFieldError(field);
                    }
                }

            });

            if (!isValid) {
                _addFormError($obj);
            }

            return isValid;
        };

        var _createGroupAddon = function (type) {
            var groupAddon = $("<span></span>");
            groupAddon.addClass("input-group-addon");

            if (type === "time") {
                groupAddon.html('<i class="fa fa-clock-o"></i>');
            } else if (type === "date") {
                groupAddon.html('<i class="fa fa-calendar"></i>');
            } else {
                groupAddon.html("<i></i>");
            }
            return groupAddon;
        };

        var _addLabel = function (formGroup, data) {
            var label = data.label;
            if (settings.showRequiredAsterisk && data.required) {
                label += "<span class='required-sign'>*</span>";
            }
            formGroup.append("<label class='control-label'>" + label + ":</label>");
            return formGroup;
        };

        var _addNeededOptions = function (input, data) {
            if (data.css) {
                input = input.slice(0, -1);
                input += " " + data.css + "'";
            }

            if (data.placeholder) {
                input += " placeholder='" + data.placeholder + "'";
            }

            if (data.attributes) {
                input += " " + data.attributes;
            }

            if (data.required) {
                input += " required";
            }

            if (data.regex) {
                input += " data-regex='" + data.regex + "'";
            }

            if (data.elemdata) {
                input += " data-elemdata='" + JSON.stringify(data.elemdata) + "'";
            }

            return input;
        };

        var _defaultField = function (type, data) {
            var formGroup = $("<div></div>");
            formGroup.addClass("form-group");
            formGroup = _addLabel(formGroup, data);

            var input = "<input type='" + type + "' name='" + data.name + "' class='form-control'";
            input = _addNeededOptions(input, data);
            input += " />";

            formGroup.append(input);

            return formGroup;
        };

        var _defaultAddonField = function (type, data) {
            var formGroup = $("<div></div>");
            formGroup.addClass("form-group");
            formGroup.addClass("addon");
            formGroup = _addLabel(formGroup, data);

            var inputGroup = $("<div></div>");
            inputGroup.addClass("input-group " + type);  // type = color, time, date, typeadhead

            var input = "<input type='text' name='" + data.name + "' class='form-control'";
            if (type === "date") {
                input += " data-date-format='" + data.format + "'";
            }
            input = _addNeededOptions(input, data);
            input += " />";

            var groupAddon = _createGroupAddon(type);

            inputGroup.append(input);
            inputGroup.append(groupAddon);
            formGroup.append(inputGroup);

            return formGroup;
        };

        var _checkboxField = function (data) {
            var checkboxDiv = $("<div></div>");
            checkboxDiv.addClass("checkbox");

            var label = $("<label></label>");
            label.addClass("control-label");

            var input = "<input type='checkbox' name='" + data.name + "'";
            input = _addNeededOptions(input, data);
            input += " />";

            label.append(input);

            var dataLabel = data.label;
            if (settings.showRequiredAsterisk && data.required) {
                dataLabel += "<span class='required-sign'>*</span>";
            }

            label.append(dataLabel);
            checkboxDiv.append(label);

            return checkboxDiv;
        };

        var _radioField = function (data) {
            var radioDiv = $("<div></div>");
            radioDiv.addClass("radio");

            var label = $("<label></label>");
            label.addClass("control-label");

            var input = "<input type='radio' name='" + data.name + "'";

            if (data.value) {
                input += " value='" + data.value + "'";
            }

            input = _addNeededOptions(input, data);
            input += " />";

            label.append(input);

            var dataLabel = data.label;
            if (settings.showRequiredAsterisk && data.required) {
                dataLabel += "<span class='required-sign'>*</span>";
            }

            label.append(dataLabel);
            radioDiv.append(label);

            return radioDiv;
        };

        var _selectField = function (data, isTagSelectField) {
            var formGroup = $("<div></div>");
            formGroup.addClass("form-group");

            formGroup = _addLabel(formGroup, data);

            var classes = "'form-control'";
            if (isTagSelectField) {
                classes = "'form-control tags chosen-select' multiple";
                if (data.placeholder) {
                    classes += " data-placeholder='" + data.placeholder + "'";
                }
            }

            var select = "<select type='select' name='" + data.name + "' class=" + classes;

            if (data.css) {
                select = input.slice(0, -1);
                select += " " + data.css + "'";
            }

            if (data.attributes) {
                select += " " + data.attributes;
            }

            if (data.required) {
                select += " required";
            }

            select += ">";

            if (data.placeholder && !isTagSelectField) {
                select += "<option value='0' disabled selected>" + data.placeholder + "</option>";
            }

            if (data.options) {
                $.each(data.options, function (idx, option) {
                    select += "<option value='" + option.id + "'";
                    if (option.type) {
                        select += " data-type='" + option.type + "'";
                    }
                    select += ">" + option.name + "</option>";
                });
            }

            if (data.url) { //load options from url
                $.ajax({
                    type: "GET",
                    url: data.url,
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        var dataArray = JSON.parse(JSON.stringify(data.result));
                        dataArray.forEach(function (option) {
                            select += "<option value='" + option.Id + "'";
                            if (option.Type) {
                                select += " data-type='" + option.Type + "'";
                            }
                            select += ">" + option.Name + "</option>";
                        });
                    },
                    error: function (data, status) {
                        if (console) console.log("tiejs: error loading select options from server, status: " + status);
                    }
                });
            }

            select += "</select>";
            formGroup.append(select);
            return formGroup;
        };

        var _textareaField = function (data) {
            var formGroup = $("<div></div>");
            formGroup.addClass("form-group");

            formGroup = _addLabel(formGroup, data);

            var textarea = "<textarea type='textarea' name='" + data.name + "' class='form-control'";
            textarea = _addNeededOptions(textarea, data);

            textarea += "></textarea>";
            formGroup.append(textarea);

            return formGroup;
        };

        var _wysiwygField = function (data) {
            var formGroup = $("<div></div>");
            formGroup.addClass("form-group");

            formGroup = _addLabel(formGroup, data);

            var textarea = "<div type='wysiwyg' name='" + data.name + "' class='form-control wysiwyg'";
            textarea = _addNeededOptions(textarea, data);

            textarea += "></div>";
            formGroup.append(textarea);

            return formGroup;
        };

        var _button = function (data) {
            var formGroup = $("<div></div>");
            formGroup.addClass("form-group");

            var button = "<button type='button' class='btn btn-default'";

            if (data.css) {
                button = button.slice(0, -1);
                button += " " + data.css + "'";
            }

            button += ">" + data.label + "</button>";

            formGroup.append(button);

            if (data.clickCB) {
                var btn = formGroup.find("button");
                $(btn).on("click", data.clickCB);
            }

            return formGroup;
        };

        var _file = function (data) {
            var formGroup = $("<div></div>");
            formGroup.addClass("form-group");
            formGroup = _addLabel(formGroup, data);

            var inputGroup = $("<div></div>");
            inputGroup.addClass("input-group");

            var fileInput = "<label class='input-group-btn'><span class='btn btn-success'><i class='fa fa-folder-open'></i>" +
                data.buttonLabel + "<input type='file' name='" + data.name + "'";

            if (data.accept) {
                fileInput += " accept='" + data.accept + "'";
            }

            if (data.required) {
                fileInput += " required";
            }

            fileInput += " style='display:none'/></span></label>";
            inputGroup.append(fileInput);

            var filenameInput = "<input type='text' class='form-control' name='" + data.name + "_label'";

            if (data.placeholder) {
                filenameInput += " placeholder='" + data.placeholder + "'";
            }

            filenameInput += "readonly/>";

            if (data.clearable) {
                filenameInput += "<span class='input-group-btn'><span class='btn btn-danger clear-" + data.name + "'><i class='fa fa-trash'></i></span></span>";

                $(document).off('click', '.clear-' + data.name).on('click', '.clear-' + data.name, function () {
                    data.clearable();
                    $form.find('input[name=' + data.name + '_label]').val('');
                });
            }

            $(document).off('click', 'input[name=' + data.name + '_label]').on('click', 'input[name=' + data.name + '_label]', function () {
                $(this).parents('.input-group').find(':file').click();
            });

            inputGroup.append(filenameInput);
            formGroup.append(inputGroup);

            return formGroup;
        };

        function _clearMarker($obj) {
            $obj.find('div.alert').remove();
            $obj.find('.error-message').hide();
            $obj.find('.has-error').each(function (index, value) {
                $(value).removeClass('has-error has-feedback');
                $(value).find('.form-control-feedback').remove();
            });
        }

        function _hasAttribute(field, attribute) {
            var attr = $(field).attr(attribute);
            return typeof attr !== 'undefined' && attr !== false;
        }

        function _addFormError(form, message) {
            var error = $(".formerror");
            if (error.length === 0) {
                error = $("<div></div>");
                error.addClass("formerror alert alert-danger");
                form.prepend(error);
            }

            if (message === undefined) {
                error.text(settings.globalValidationFailedText);
            } else {
                error.text(message);
            }
        }

        function _addFieldError(field) {
            var $formGroup = field.is(':radio') ? field.closest('div') : field.parent();
            if ($formGroup.hasClass('input-group')) {
                $formGroup = $formGroup.parent();
            }

            $formGroup.addClass('has-error has-feedback');

            if (field.is("select")) {
                $formGroup.append("<span class='fa fa-times form-control-feedback feedback-select'></span>");
            } else if (field.is(":checkbox")) {
                $formGroup.append("<span class='fa fa-times form-control-feedback feedback-checkbox'></span>");
            } else if (field.is(":radio")) {
                $formGroup.append("<span class='fa fa-times form-control-feedback feedback-radio'></span>");
            } else {
                $formGroup.append("<span class='fa fa-times form-control-feedback'></span>");
            }

            $formGroup.find('.error-message').show().css("display", "block");
        }

        function _updateFieldData(field, bindingSource, property) {
            var type = field.prop('type');
            if ("undefined" === typeof type) {
                type = field.attr('type');
            }

            switch (type) {
                case 'checkbox':
                    var state = bindingSource[property];
                    if (state) {
                        field.prop('checked', true);
                    } else {
                        field.prop('checked', false);
                    }
                    break;

                case 'radio':
                    field.val([bindingSource[property]]);
                    break;

                case 'select':
                    if (!$(field).hasClass("tags")) {
                        var optionArray = field.find("option");
                        optionArray.each(function (idx) {
                            var dataType = $(optionArray[idx]).attr("data-type");
                            if (dataType) {
                                if (dataType === bindingSource[property]) {
                                    field.val($(optionArray[idx]).val());
                                }
                            } else if ($(optionArray[idx]).val() === bindingSource[property]) {
                                field.val($(optionArray[idx]).val());
                            }
                        });
                    } else {
                        var items = [];
                        bindingSource[property].forEach(function (item) {
                            items.push(item);
                        });
                        field.val(items);
                    }
                    break;

                case 'wysiwyg':
                    field.html(bindingSource[property]);
                    field.trigger("change");
                    break;
                case 'file':
                    field.wrap('<form>').closest('form').get(0).reset();
                    field.unwrap();
                    $form.find('input[name=' + field.prop('name') + '_label]').val(bindingSource[property]);
                    break;
                default:
                    field.val(bindingSource[property]);
            }
        }

        function _findInArray(value, array) {
            for (var i = 0; i < array.length; i++) {
                var obj = array[i];
                if (obj.name === value) {
                    return obj;
                }
            }

            return null;
        }

    };

    $.fn.TieJS = function (options) {
        return this.each(function () {
            var element = $(this);

            // check if already initialized
            if (element.data('tiejs')) {
                return;
            }

            element.data('tiejs', new TieJS(this, options));
        });
    };
}));
