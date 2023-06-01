$(function () {
    //login-form is validate using jquery validator method
    $("#login-form").validate({
        keypress: true,
        errorClass: 'error',
        validClass: 'success',
        errorElement: 'span',
        highlight: function (element, errorClass, validClass) {
            $(element).parents("div.control-group")
                .addClass(errorClass)
                .removeClass(validClass);
        },
        rules: {
            "email": {
                email: true,
                required: true
            },
            "pswd": {
                required: true
            }
        },
        messages: {
            "email": {
                required: 'Please Enter E-mail',
                email: 'Please Enter Valid E-mail'
            },
            "pswd": {
                required: 'Please Enter Password'
            }
        },
        //if error generates by jquery validator
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        //on submit of login-form submit the form to the action with method post
        submitHandler: function (form) {
            form.submit();
        }
    });
});