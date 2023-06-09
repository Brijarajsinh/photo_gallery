const signUpHandler = (function () {

    this.initialize = function () {
        //Handles the sign-up event of client
        signUpEventHandler();
    };

    signUpEventHandler = function () {
        $("#btn-submit").on('click', function () {
            //add jquery validator method to validate password field is strong enough or not
            $.validator.addMethod("strongPassword", function (value) {
                return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) // consists of only these
                    && /[a-z]/.test(value) // has a lowercase letter
                    && /[A-Z]/.test(value) // has a upperCase letter
                    && /\d/.test(value) // has a digit
            });

            //add jquery validator method to validate contact number field is valid or not
            $.validator.addMethod('checkNumber', function (value) {
                return /^[0-9\d=!]*$/.test(value) // consists of only these
                // && /\d/.test(value) // has a digit
            });
            //using jquery validator validate the registration form details which are entered by user
            $("#registration-form").validate({
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
                    "fname": {
                        required: true
                    },
                    "lname": {
                        required: true
                    },
                    "email": {
                        required: true,
                        email: true,
                        remote: "/check-email"
                    },
                    "gender": {
                        required: true
                    },
                    "pswd": {
                        required: true,
                        minlength: 8,
                        maxlength: 12,
                        strongPassword: true
                    },
                    "confirm-pswd": {
                        required: true,
                        equalTo: "#register-password"
                    },
                    "contactNumber": {
                        required: true,
                        checkNumber: true,
                        minlength: 10,
                        maxlength: 10
                    }
                },
                messages: {
                    "fname": {
                        required: 'First Name is Required'
                    },
                    "lname": {
                        required: 'Last Name is Required'
                    },
                    "email": {
                        required: 'E-mail is required',
                        remote: 'E-mail is already Registered',
                        email: 'Please Enter Valid E-mail'

                    },
                    "gender": {
                        required: 'Select Gender'
                    },
                    "pswd": {
                        required: 'Password is Required',
                        strongPassword: "(Use a combination of 1 upper case letters, 1 lower case letters, 1 number character)",
                        minlength: 'Password Must contain 8 characters',
                        maxlength: "Password Must contain 12 characters"

                    },
                    "confirm-pswd": {
                        required: 'Confirm Your Password',
                        equalTo: 'Password Not Matched'
                    },
                    "contactNumber": {
                        required: "Please Enter Mobile Number",
                        checkNumber: "Enter Characters Between 0-9 digit",
                        minlength: "Please Enter Mobile Number Length of 10",
                        maxlength: "Please Enter Mobile Number Length of 10",
                    }
                },
                //if error generated from jquery validator than place that error at specific location
                errorPlacement: function (error, element) {

                    //if error generated from gender element than place that error just after gender-error element
                    if (element.attr('name') == "gender") {
                        error.insertAfter("#gender-error");
                    }
                    //else place that error just after form which that error is generated
                    else {
                        error.insertAfter(element);
                    }
                },
                //on submit of registration-form validate user entered details using jquery validator
                submitHandler: function () {
                    //append the user entered details in data object
                    const data = {
                        fname: $("#register-fname").val().trim(),
                        lname: $("#register-lname").val().trim(),
                        email: $("#register-email").val().trim(),
                        gender: $('input[name="gender"]:checked').val(),
                        password: $("#register-password").val().trim(),
                        phone: $("#contactNumber").val().trim(),
                        referral: $("#referral-link").val().trim()
                    }
                    //an ajax request with data of user's details to store in users collection
                    $.ajax({
                        type: "post",
                        url: "/user/registration",
                        data: data,
                        success: function (res) {
                            //on error response of ajax request user redirect to login page
                            if (res.type == 'error') {
                                toastr.error(res.message);
                            }
                            //on success response of ajax request user redirect to timeline page
                            else {
                                toastr.success("please wait, Registration process is completed You will be redirected to dashboard page");
                                const timeOut = setTimeout(toast, 4000);
                                function toast() {
                                    window.location.href = "/dashboard";
                                }
                            }
                        },
                        error: function (err) {
                            console.log(err.toString());
                        }
                    });
                }
            });
        });
    }
    const _this = this;
    this.initialize();
})();
