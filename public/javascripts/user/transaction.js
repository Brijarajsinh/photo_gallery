const transactionHandler = (function () {

    this.initialize = function () {
        //sorts the transaction based on selection of logged-in user
        sortTransactionEventHandler();

        //search transactions by amount
        searchTransactionEventHandler();

        //Pagination on transaction table handled by pagination event Handler
        paginationEventHandler();

        //clearEventHandler clears the searching value and page value
        clearEventHandler();
    };

    //getUrl function creates url to call route with query parameters of search and page number
    getUrl = function (sort, sortOrder, page) {
        const url = new URL(location);
        const search = $(".search-amount").val().trim();
        const filterStatus = $(".filter-status").val();
        const filterType = $(".filter-type").val();
        //if logged-in user search transaction by amount than pass user entered value in search parameter of query string 
        if (search) {
            url.searchParams.set("amount", `${search}`);
        }
        //else passes blank string in query parameter
        else {
            url.searchParams.set("amount", "");
        }
        //if user filter's transactions by status like credit and debit 
        // than this status passed in query parameter of url
        if (filterStatus) url.searchParams.set("status", `${filterStatus}`);

        //if user filter's transactions by type like welcome-bonus,referral-bonus and image-deduction 
        // than this type passed in query parameter of url
        if (filterType) url.searchParams.set("txtType", `${filterType}`);

        //if user sorts the table contents than sorting field passed in query parameter
        if (sort) url.searchParams.set("sort", `${sort}`);

        //if user sorts the table contents than sorting field passed in query parameter with sortOrder parameter which
        //sorts the records in order like ascending or descending
        if (sortOrder) url.searchParams.set("sortOrder", `${sortOrder}`);

        if (page) url.searchParams.set("page", `${page}`);
        else {
            url.searchParams.set("page", `1`);
        }
        history.pushState({}, "", url);

        return url;
    }

    //sorting on transactions  based on user selection
    sortTransactionEventHandler = function () {
        $(document).off('click', '.sort').on('click', ".sort", function () {
            const sort = $(this).attr(`value`);
            const sortOrder = $(this).attr(`data-flag`);
            $.ajax({
                type: "get",
                url: getUrl(sort, sortOrder),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter(".main").html();
                    $(".main").html(successHtml);
                    if (sortOrder == 'ASC') $(`#${sort}`).attr('data-flag', 'DSC');
                    else $(`#${sort}`).attr('data-flag', 'ASC');
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };

    // //user searches transactions by amount than ajax request is called with search parameter in query string
    searchTransactionEventHandler = function () {
        $(document).off('click', '.search-transaction').on('click', ".search-transaction", function () {
            $.ajax({
                type: "get",
                url: getUrl(),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter(".main").html();
                    $(".main").html(successHtml);
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });

        });
    };

    // //when user moves to another page than ajax called 
    // //with that selected page value as page parameter in ajax request query string
    paginationEventHandler = function () {
        $(document).off('click', '.entry-wise').on('click', ".entry-wise", function () {
            const page = $(this).data("page");
            $.ajax({
                type: "get",
                //calling getUrl function with sort and sortOrder = '' and page parameter as page variable
                url: getUrl('', '', page),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter(".main").html();
                    $(".main").html(successHtml);
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };

    // //When user click on clear search option to clear filtered transaction
    // //than this function requests an ajax call and clear the search query parameter to fetch all transactions records
    clearEventHandler = function () {
        $(document).off('click', '.clear-transaction').on('click', ".clear-transaction", function () {
            window.location.replace("/transaction");
        });
    };

    const _this = this;
    this.initialize();
})();
