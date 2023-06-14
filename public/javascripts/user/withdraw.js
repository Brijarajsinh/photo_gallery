const withdrawRequestHandler = (function () {
    this.initialize = function () {

        withdrawCoinHandler();

        cancelRequestEventHandler();

        //sorting on gallery page of uploaded on and image cost with date and time
        sortRequestEventHandler();

        //searching on gallery page by by cost
        searchRequestEventHandler();

        //pagination on uploaded images view
        paginationEventHandler();

        //clear searching and filtering
        clearEventHandler();
    };

    getUrl = function (sort, sortOrder, page) {
        const url = new URL(location);
        const startDate = $(".start-date").val();
        const endDate = $(".end-date").val();
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
                    const data = {
                        reqId: $(this).attr('id'),
                        status: "cancelled"
                    }
                    $.ajax({
                        type: 'put',
                        url: '/withdraw',
                        data: data,
                        async: true,
                        success: function (res) {
                            console.log(res);
                            if (res.type == 'success') {
                                $(`.${res.reqId}`).html(`<button type="button" class="btn btn-dark">Cancelled</button>`);
                            }
                            else {
                                toastr.error(res.message);
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

    //sorting on images  based on user selection
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
                    if (sortOrder == 'ASC') $(`#${sort}`).attr('data-flag', 'DSC');
                    else $(`#${sort}`).attr('data-flag', 'ASC');
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };
    withdrawCoinHandler = function () {
        $(document).off('click', '.withdraw-coin').on('click', '.withdraw-coin', function () {
            $("#withdraw-request-form").validate({
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
                    "withdraw": {
                        required: true,
                        min: 1,
                        max: 100,
                        remote: '/my-account/get-coins'
                    }
                },
                messages: {
                    "withdraw": {
                        required: "Please Enter Coins To Withdraw",
                        min: "Please Enter Minimum 1 coin to Withdraw",
                        max: "You Can Withdraw Maximum 100 Coins At a Time",
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
                                window.location.reload();
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
    searchRequestEventHandler = function () {
        $(document).off('click', '.search-request').on('click', '.search-request', function () {
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
        $(document).off('click', '.clear-request').on('click', '.clear-request', function () {
            window.location.replace("/withdraw/list");
        });
    };
    const _this = this;
    this.initialize();
})();