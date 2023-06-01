$(function () {
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
            "welcomeBonus": {
                required: true,
                min: 0,
                max: 1000
            },
            "referralBonus": {
                required: true,
                min: 0,
                max: 1000
            },
            "chargePerImage": {
                required: true,
                min: 0,
                max: 100
            },
            "maxRefer": {
                required: true,
                min: 0,
                max: 10
            },
        },
        messages: {
            "welcomeBonus": {
                required: 'Please Enter Welcome Bonus',
                min: 'Welcome Bonus is not allowed below 0',
                max: 'Welcome Bonus is not allowed more than 1000'
            },
            "referralBonus": {
                required: 'Please Enter Referral Bonus',
                min: 'Referral Bonus is not allowed below 0',
                max: 'Referral Bonus is not allowed more than 1000'
            },
            "chargePerImage": {
                required: 'Please Enter Charge Per Image',
                min: 'Charge Per Image is not allowed below 0',
                max: 'Charge Per Image is not allowed more than 100'
            },
            "maxRefer": {
                required: 'Please Enter Maximum Refer Count',
                min: 'Maximum Refer Count is not allowed below 0',
                max: 'Maximum Refer Count is not allowed more than 10'
            },
        },
        //if error generates by jquery validator
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        submitHandler: function () {
            $.ajax({
                /**
                 * after validating user entered details,
                 * ajax request of put type is called to update user entered details in db and 
                 * success response of ajax request set the updated details of post
                 */
                type: 'post',
                url: '/settings',
                data: $("form").serialize(),
                success: function (res) {
                    if (res.type == 'success') {
                        toastr.success("Successfully Updated General Settings");
                    }
                    else {
                        alert(res.message);
                    }
                }

            })
        }
    });
});