const accountHandler = (function () {
    this.initialize = function () {

        //cancelEventHandler Function Handles cancel event on profile page
        cancelEventHandler();

        //imagePreviewHandler Function Previews a selected profile image to the current Logged-in user
        imagePreviewEventHandler();

        //updateProfileEventHandler updates user profile
        updateProfileEventHandler();

        //changePasswordEventHandler changes current logged-in user's password field
        changePasswordEventHandler();
    };

    //on click of cancel button user moves to the dashboard page
    cancelEventHandler = function () {
        $(document).off('click', '.btn-cancel').on('click', '.btn-cancel', function () {
            window.location.replace("/dashboard");
        });
    };

    //on selection of image user will see the preview of selected image which will be set as profile picture of that user
    imagePreviewEventHandler = function () {
        $(document).off('change', '#image').on('change', '#image', function () {
            $(".profilePicture").attr('src', `${window.URL.createObjectURL($("#image")[0].files[0])}`);
        });
    };

    //when user submits updated details than this updateProfileEventHandler function is called and
    updateProfileEventHandler = function () {
        $(document).off('click', '#btn-update').on('click', '#btn-update', function () {
            //add jquery validator method to validate contact number field is valid or not
            $.validator.addMethod('checkNumber', function (value) {
                return /^[0-9\d=!]*$/.test(value) // consists of only these
                // && /\d/.test(value) // has a digit
            });
            //using jquery validator validate the edit-profile-form details which are entered by user is valid or not
            $("#edit-setting-form").validate({
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
                    "phone": {
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
                        email: 'Please Enter Valid E-mail',
                        remote: 'E-mail is already Registered'
                    },
                    "gender": {
                        required: 'Select Gender'
                    },
                    "phone": {
                        required: "Please Enter Mobile Number",
                        checkNumber: "Enter Characters Between 0-9 digit",
                        minlength: "Please Enter Mobile Number Length of 10",
                        maxlength: "Please Enter Mobile Number Length of 10",
                    }
                },
                //on submit of registration-form validate user entered details using jquery validator
                submitHandler: function () {

                    //append the user entered details in formData object
                    const formData = new FormData();
                    formData.append('fname', $("#current-fname").val().trim());
                    formData.append('lname', $("#current-lname").val().trim());
                    formData.append('email', $("#current-email").val().trim());
                    formData.append('gender', $('input[type=radio]').val());
                    formData.append('phone', $('#current-phone').val());
                    formData.append('profile', $("#image")[0].files[0]);

                    //an ajax request with data of user's details to update in users collection
                    $.ajax({
                        type: "put",
                        url: "/my-account/edit-profile",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (res) {
                            //on error response of ajax request
                            if (res.type == 'error') {
                                //user will be toast with error message
                                toastr.error(res.message);
                            }
                            //on success response of ajax request user successfully updated profile
                            else {
                                toastr.success("Details Successfully Updated");
                            }
                        },
                        error: function (err) {
                            console.log(err.toString());
                        }
                    });
                }
            });
        });
    };

    //changePasswordEventHandler this event handles the process of changing user's password
    changePasswordEventHandler = function () {
        $(document).off('click', '#btn-change').on('click', '#btn-change', function () {
            $.validator.addMethod("strongPassword", function (value) {
                return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) // consists of only these
                    && /[a-z]/.test(value) // has a lowercase letter
                    && /[A-Z]/.test(value) // has a upperCase letter
                    && /\d/.test(value) // has a digit
            });
            $("#change-password-form").validate({
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
                    "current-password": {
                        required: true
                    },
                    "new-password": {
                        required: true,
                        strongPassword: true,
                        minlength: 8,
                        maxlength: 12
                    },
                    "confirm-password": {
                        required: true,
                        equalTo: "#new-password",
                    }
                },
                messages: {
                    "current-password": {
                        required: 'Enter Current Password'
                    },
                    "new-password": {
                        required: 'New Password is Required',
                        strongPassword: "(Use a combination of 1 upper case letters, 1 lower case letters, 1 number character)",
                        minlength: 'Password Must contain 8 characters',
                        maxlength: "Password Must contain 12 characters"
                    },
                    "confirm-password": {
                        required: 'Confirm Your Password',
                        equalTo: 'New Password Not Matched '
                    }
                },
                submitHandler: function () {
                    //append the user entered details in data object
                    const data = {
                        currentPassword: $("#current-password").val().trim(),
                        newPassword: $("#new-password").val().trim(),
                        confirmPassword: $("#confirm-password").val().trim()
                    }
                    //on submit of change password-form validate by user an ajax call to update password in db
                    $.ajax({
                        type: "put",
                        url: "/my-account/change-password",
                        data: data,
                        success: function (res) {
                            //on error response of ajax request toasts user the error generated like current-password is not matched
                            if (res.type == 'error') {
                                toastr.error(res.message);
                            }
                            //on success response of ajax request means user successfully updated Password
                            else {
                                toastr.success("Password Successfully Changed");
                            }
                        },
                        error: function (err) {
                            console.log(err.toString());
                        }
                    });
                }
            });
        });
    };

    const _this = this;
    this.initialize();
})();









