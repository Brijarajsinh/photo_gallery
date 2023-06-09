const withdrawRequestHandler = (function () {
    this.initialize = function () {

        //request coins for withdraw to admin
        withdrawCoinHandler();

        //cancelRequestEventHandler cancels pending request
        cancelRequestEventHandler();

        //sorting on withdraw request table
        sortRequestEventHandler();

        //searching on withdraw request table
        searchRequestEventHandler();

        //pagination on withdraw request table
        paginationEventHandler();

        //clear searching and filtering on withdraw request table
        clearEventHandler();

        //user will view reason of rejected request by admin
        viewDescriptionEventHandler();

        const today = moment(new Date()).format('YYYY-MM-DD');
        $(".date-picker-withdraw-request-user").daterangepicker({
            startDate: moment().subtract(6, 'day'),
            maxDate: today,
            locale: {
                format: 'YYYY-MM-DD'
            },
        });
    };

    withdrawCoinHandler = function () {
        $(document).off('click', '.withdraw-coin').on('click', '.withdraw-coin', function () {
            console.log("btn-clicked");
            $("#withdraw-request-form").validate({
                // keypress: true,
                errorClass: 'error',
                validClass: 'success',
                errorElement: 'span',
                highlight: function (element, errorClass, validClass) {
                    $(element).parents("div.control-group")
                        .addClass(errorClass)
                        .removeClass(validClass);
                },
                rules: {
                    "withdraw": {
                        required: true,
                        min: 1,
                        max: 1000,
                        remote: '/my-account/get-coins'
                    }
                },
                messages: {
                    "withdraw": {
                        required: "Please Enter Coins To Withdraw",
                        min: "Please Enter Minimum 1 coin to Withdraw",
                        max: "You Can Withdraw Maximum 1000 Coins At a Time",
                        remote: "Insufficient Coins In Your Wallet To Withdraw"
                    }
                },
                errorPlacement: function (error, element) {
                    error.insertAfter(element);
                },
                submitHandler: function () {
                    const amount = $(".withdraw").val();
                    $(".withdraw").val('');
                    $.ajax({
                        type: "post",
                        url: "/withdraw",
                        data: {
                            'amount': amount
                        },
                        success: function (res) {
                            //on error response of ajax request user redirect to login page
                            if (res.type == 'error') {
                                toastr.error(res.message);
                            }
                            //on success response of ajax request user redirect to timeline page
                            else {
                                window.location.replace("http://localhost:3000/withdraw/request");
                            }
                        },
                        error: function (err) {
                            console.log(err.toString());
                        }
                    });
                }
            });
        })
    }

    cancelRequestEventHandler = function () {
        $(document).off('click', ".cancel-request").on('click', ".cancel-request", function () {
            Swal.fire({
                title: 'Cancel',
                text: "Are You Sure To Cancel This Withdrawal Request",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Cancel it!',
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    const url = `/withdraw/request/${$(this).attr('id')}/cancel`
                    Swal.fire({
                        title: 'Processing',
                        text: 'Please Wait your withdrawal request will be cancelled soon',
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });
                    $.ajax({
                        type: 'put',
                        url: url,
                        success: function (res) {
                            if (res.type == 'success') {
                                window.location.reload();
                            }
                            else {
                                toastr.error(res);
                            }
                        },
                        error: function (err) {
                            console.log(err.toString());
                        }
                    })
                }
            })
        });
    }

    sortRequestEventHandler = function () {
        $(document).off('click', '.sort-request').on('click', '.sort-request', function () {
            const sort = $(this).attr(`value`);
            const sortOrder = $(this).attr(`data-flag`);
            $.ajax({
                type: "get",
                url: getUrl(sort, sortOrder),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter("#withdraw-list-page").html();
                    $("#withdraw-list-page").html(successHtml);
                    if (sortOrder == 'ASC') $(`#${sort}`).attr('data-flag', 'DESC');
                    else $(`#${sort}`).attr('data-flag', 'ASC');
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };

    searchRequestEventHandler = function () {
        $(document).off('click', '.search-list').on('click', '.search-list', function () {
            $.ajax({
                type: "get",
                url: getUrl(),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter("#withdraw-list-page").html();
                    $("#withdraw-list-page").html(successHtml);
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };

    paginationEventHandler = function () {
        $(document).off('click', '.request-wise').on('click', '.request-wise', function () {
            const page = $(this).data("page");
            $.ajax({
                type: "get",
                //calling getUrl function with sort and sortOrder = '' and page parameter as page variable
                url: getUrl('', '', page),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter("#withdraw-list-page").html();
                    $("#withdraw-list-page").html(successHtml);
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };

    clearEventHandler = function () {
        $(document).off('click', '.clear-list').on('click', '.clear-list', function () {
            window.location.replace("/withdraw/request");
        });
    };

    viewDescriptionEventHandler = function () {
        $(document).off('click', ".view-status").on('click', ".view-status", function () {
            $.ajax({
                type: 'get',
                url: `/withdraw/request/${$(this).attr('id')}/reason`,
                async: true,
                success: function (res) {
                    console.log(res);
                    const successHtml = $($.parseHTML(res)).filter("#withdraw-list-page").html();
                    $("#withdraw-list-page").html(successHtml);
                    $("#exampleModal1").modal('show');
                },
                error: function (err) {
                    console.log(err.toString());
                }
            })
        });
    };

    getUrl = function (sort, sortOrder, page) {
        const url = new URL(location);
        const date = $(".date-picker-withdraw-request-user").val().split(' - ');


        const startDate = date[0];
        const endDate = date[1];
        const filter = $('.filter-request-status').val();
        //if user sorts the table contents than sorting field passed in query parameter
        if (sort) url.searchParams.set("sort", `${sort}`);
        //if user sorts the table contents than sorting field passed in query parameter with sortOrder parameter which
        //sorts the records in order like ascending or descending
        if (sortOrder) url.searchParams.set("sortOrder", `${sortOrder}`);

        if (page) url.searchParams.set("page", `${page}`);
        else {
            url.searchParams.set("page", `1`);
        }
        url.searchParams.set("status", `${filter}`);
        url.searchParams.set("from", `${startDate}`);
        url.searchParams.set("to", `${endDate}`);
        history.pushState({}, "", url);
        return url;
    };


    const _this = this;
    this.initialize();
})();