$(function () {

    function getUrl() {
        let url = '/userList?'
        const search = $(".search-user").val();
        //if logged-in user search other user by first name, last name and full name than that search value is passed in query parameter 
        if (search) {
            url += `search=${search}&`
        }
        return url;
    };

    //if admin searches than ajax request is called with search parameter as url
    $(".search-user").on('input', function () {
        $.ajax({
            type: "get",
            url:getURL(),
            success: function (res) {
                //if response type of ajax request is success than shows only fetched user-details
                $("#report").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });

    //when user moves to another page than ajax called 
    //with that selected page value as page parameter in ajax request query string
    $(document).on('click', '.user-wise', function () {
        const page = $(this).data("page");
        let url = getUrl();
        url += `page=${page}`;
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                //displays fetched records to the user
                $("#report").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
});