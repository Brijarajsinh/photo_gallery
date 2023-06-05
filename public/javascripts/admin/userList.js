$(function () {
    // console.log("Current Page is" + window.location.search);
    // $("li").find(`[data-page='${1}']`).addClass("bg-dark current-user-page");


    //getUrl function creates url to call route with query parameters of search and page number
    function getUrl() {
        const url = new URL(location);
        const search = $(".search").val().trim();
        //if logged-in user search other user by first name, last name and full name
        // than that search value is passed in query parameter 
        if (search) {
            // url += `?search=${search}&`
            url.searchParams.set("search", `${search}`);
        }

        const state = { page: 1 };
        history.pushState(state, "", url);

        history.pushState({}, "", url);
        return url;
    };

    //if admin searches than ajax request is called with search parameter in query string
    $(".search-user").on('click', function () {
        $.ajax({
            type: "get",
            url: getUrl(),
            success: function (res) {
                $("#main").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    });

    //when user moves to another page than ajax called 
    //with that selected page value as page parameter in ajax request query string
    $(".user-wise").on('click', function () {
        const page = $(this).data("page");
        let url = getUrl();
        // url += `&page=${page}&`;
        url.searchParams.set("page", `${page}`);
        history.pushState({}, "", url);


        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                // $(".current-page").removeClass('bg-dark current-user-page');
                // $(".current-page").addClass('bg-white');

                $("#main").html(res);

                // $("li").find(`[data-page='${page}']`).addClass("bg-dark current-user-page");
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    });

    //When user click on clear search option to clear filtered data
    //than this function requests an ajax call and clear the search query parameter to fetch all records
    $(".clear-search").on('click', function () {
        window.location.replace("/user-list");
    });


    //sorting user list based on admin selection
    $(".sort").on('click', function () {
        let url = getUrl();
        const sort = $(this).attr(`value`);
        const sortOrder = $(this).attr(`data-flag`);

        // url += `&sort=${sort}&sortOrder=${sortOrder}`;
        url.searchParams.set("sort", `${sort}`);
        url.searchParams.set("sortOrder", `${sortOrder}`);
        history.pushState({}, "", url);

        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                $("#main").html(res);
                if (sortOrder == '1') $(`#${sort}`).attr('data-flag', '-1');
                else $(`#${sort}`).attr('data-flag', '1');
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    });
});