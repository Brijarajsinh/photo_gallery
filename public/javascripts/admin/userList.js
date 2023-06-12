const userListHandler = (function () {
    this.initialize = function () {
        //functionality of searching on users by admin
        searchEventHandler();

        //pagination on user-list selected by admin user
        paginationEventHandler();

        //sorting on user-list by name and available coins
        sortingEventHandler();

        //clear searching by admin user
        clearEventHandler();
    };

    //getUrl function creates url to call route with query parameters of search and page number
    getUrl = function () {
        const url = new URL(location);
        const search = $(".search").val().trim();
        //if logged-in user search other user by first name, last name and full name
        // than that search value is passed in query parameter 
        if (search) {
            url.searchParams.set("search", `${search}`);
        }
        else {
            url.searchParams.set("search", ``);
        }
        const state = { page: 1 };
        history.pushState(state, "", url);

        history.pushState({}, "", url);
        return url;
    };

    //when Admin searches users by their fname,lname or fullName
    //with that searched value as search parameter is applied in ajax request query string
    searchEventHandler = function () {
        $(document).off('click', '.search-user').on('click', '.search-user', function () {

            $.ajax({
                type: "get",
                url: getUrl(),
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter("#main").html();
                    $("#main").html(successHtml);
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };

    //when user moves to another page than ajax called 
    //with that selected page value as page parameter in ajax request query string
    paginationEventHandler = function (pge) {
        $(document).off('click', '.user-wise').on('click', '.user-wise', function () {
            let url = getUrl();
            const page = $(this).data('page');
            url.searchParams.set("page", `${page}`);
            history.pushState({}, "", url);
            $.ajax({
                type: "get",
                url: url,
                success: function (res) {
                    const successHtml = $($.parseHTML(res)).filter("#main").html();
                    $("#main").html(successHtml);
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };

    //sorting user list based on admin selection
    sortingEventHandler = function () {
        $(document).off('click', '.sort').on('click', '.sort', function () {
            let url = getUrl();
            const sort = $(this).attr(`value`);
            const sortOrder = $(this).attr(`data-flag`);
            url.searchParams.set("sort", `${sort}`);
            url.searchParams.set("sortOrder", `${sortOrder}`);
            history.pushState({}, "", url);

            $.ajax({
                type: "get",
                url: url,
                success: function (res) {

                    const successHtml = $($.parseHTML(res)).filter("#main").html();
                    $("#main").html(successHtml);

                    if (sortOrder == 'ASC') $(`#${sort}`).attr('data-flag', 'DSC');
                    else $(`#${sort}`).attr('data-flag', 'ASC');
                },
                error: function (err) {
                    console.log(err.toString());
                }
            });
        });
    };

    //When user click on clear search option to clear filtered data
    //than this function requests an ajax call and clear the search query parameter to fetch all records
    clearEventHandler = function () {
        $(document).off('click', '.clear-search').on('click', '.clear-search', function () {
            window.location.replace("/user-list");
        });
    }

    const _this = this;
    this.initialize();
})();