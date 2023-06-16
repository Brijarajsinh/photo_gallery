const withdrawRequestHandler = (function () {
    this.initialize = function () {

        //approveRequestEventHandler handles the event to approve withdrawal request of user
        approveRequestEventHandler();

        //rejectRequestEventHandler handles the event to approve withdrawal request of user
        rejectRequestEventHandler();

        //sorting on gallery page of uploaded on and image cost with date and time
        sortRequestEventHandler();

        //searching on gallery page by by cost
        searchRequestEventHandler();

        //pagination on uploaded images view
        paginationEventHandler();

        //clear searching and filtering
        clearEventHandler();
    };

    approveRequestEventHandler = function () {
        $(document).off('click', '.approve').on('click', '.approve', function () {
            Swal.fire({
                title: 'Approve',
                text: "Are You Sure To Approve This Withdrawal Request",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Approve it!',
                allowOutsideClick: false,
                allowEscapeKey: false,
                // showLoaderOnConfirm: true
            }).then((result) => {
                if (result.isConfirmed) {
                    const data = {
                        amount: $(this).attr('data-amount'),
                        userId: $(this).attr('data-user-id')
                    }
                    $.ajax({
                        type: 'put',
                        url: `/withdraw/admin/request/${$(this).attr('id')}/${$(this).attr('data-status')}`,
                        data: data,
                        async: true,
                        success: function (res) {
                            if (res.type == 'success') {
                                $(`#${res.reqId}`).html(`<button type="button" class="btn btn-primary">Approved</button>`);
                                $(`.${res.reqId}`).html('');
                            }
                            else {
                                Swal.fire({
                                    title: "Insufficient Balance!",
                                    text: res.message,
                                    icon: 'error',
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                }
                                );
                            }
                        },
                        error: function (err) {
                            console.log(err.toString());
                        }
                    })
                }
            })
        });
    };
    rejectRequestEventHandler = function () {
        $(document).off('click', '.reject').on('click', '.reject', function () {
            swal.fire({
                title: 'Reject',
                text: "Are You Sure To Reject This Withdrawal Request",
                input: 'text',
                inputPlaceholder: 'Enter Reason To Reject This Withdraw Request',
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Reject it!',
                customClass: {
                    validationMessage: 'my-validation-message'
                },
                allowOutsideClick: false,
                allowEscapeKey: false,
                preConfirm: (value) => {
                    if (!value) {
                        Swal.showValidationMessage(
                            'Please type Reason to Reject This Withdraw Request'
                        )
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const data = {
                        amount: $(this).attr('data-amount'),
                        reason: result.value,
                        userId: $(this).attr('data-user-id')
                    }
                    $.ajax({
                        type: 'put',
                        url: `/withdraw/admin/request/${$(this).attr('id')}/${$(this).attr('data-status')}`,
                        data: data,
                        success: function (res) {
                            $(`#${res.reqId}`).html(`<button type="button" class="btn btn-danger">Rejected</button>`);
                            $(`.${res.reqId}`).html('');
                        },
                        error: function (err) {
                        }
                    })
                }
            })
        });
    };
    sortRequestEventHandler = function () {
        $(document).off('click', '.sort-request').on('click', '.sort-request', function () {
            const sort = $(this).attr(`value`);
            const sortOrder = $(this).attr(`data-flag`);
            $.ajax({
                type: "get",
                url: getUrl(sort, sortOrder),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter("#withdraw-request-page").html();
                    $("#withdraw-request-page").html(successHtml);
                    if (sortOrder == 'ASC') $(`#sort-${sort}`).attr('data-flag', 'DESC');
                    else $(`#sort-${sort}`).attr('data-flag', 'ASC');
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };
    searchRequestEventHandler = function () {
        $(document).off('click', '.search-request').on('click', '.search-request', function () {
            $.ajax({
                type: "get",
                url: getUrl(),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter("#withdraw-request-page").html();
                    $("#withdraw-request-page").html(successHtml);
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
                url: getUrl('', '', page),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter("#withdraw-request-page").html();
                    $("#withdraw-request-page").html(successHtml);
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };
    clearEventHandler = function () {
        $(document).off('click', '.clear-request').on('click', '.clear-request', function () {
            window.location.replace("/withdraw/admin/request");
        });
    };
    getUrl = function (sort, sortOrder, page) {

        const url = new URL(location);
        const startDate = $(".start-date-request").val();
        const endDate = $(".end-date-request").val();
        const filter = $('.filter-request').val();
        const user = $(".filter-user").val();

        //if admin sorts the table contents than sorting field passed in query parameter
        if (sort) url.searchParams.set("sort", `${sort}`);

        //if admin sorts the table contents than sorting field passed in query parameter with sortOrder parameter which
        //sorts the records in order like ascending or descending
        if (sortOrder) url.searchParams.set("sortOrder", `${sortOrder}`);

        //if admin moves to another page than page number is passed in query parameter
        if (page) url.searchParams.set("page", `${page}`);

        //otherwise pass page number = 1
        else {
            url.searchParams.set("page", `1`);
        }

        //if admin selects user to show specific that user's withdrawal request than userId passed in query parameter
        url.searchParams.set("user", `${user}`);

        //show withdraw request status wise by default shows only pending request
        url.searchParams.set("status", `${filter}`);

        //show withdrawal request only requested between last 7 days
        url.searchParams.set("from", `${startDate}`);
        url.searchParams.set("to", `${endDate}`);

        history.pushState({}, "", url);
        return url;
    };
    const _this = this;
    this.initialize();
})();