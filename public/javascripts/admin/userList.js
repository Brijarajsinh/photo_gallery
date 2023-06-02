$(function () {

    //getUrl function creates url to call route with query parameters of search and page number
    function getUrl() {
        let url = '/userList?'
        const search = $(".search").val().trim();
        //if logged-in user search other user by first name, last name and full name than that search value is passed in query parameter 
        if (search) {
            url += `search=${search}&`
        }
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
        // $(document).bind('click', '.user-wise', function () {
        const page = $(this).data("page");
        let url = getUrl();
        url += `page=${page}&`;
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                $("#main").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    });
    $(".clear-search").on('click', function () {
        // $(document).on('click', '.clear-search', function () {
        $(".search").val("");
        $.ajax({
            type: "get",
            url: '/userList?',
            success: function (res) {
                $("#main").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    });


    //sorting user list based on admin selection
    $(".sort").on('click', function () {
        let url = getUrl();
        const sort = $(this).attr(`value`);
        const sortOrder = $(this).attr(`data-flag`);
        url += `sort=${sort}&sortOrder=${sortOrder}`;
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
        // if (sortOrder) {
        //     // console.log($(`#${sort}`).data('flag'));
        //     $(`#${sort}`).data('flag', '-1');
        // }
        // else {
        //     $(`#${sort}`).data('flag', '1');
        // }
    });
});