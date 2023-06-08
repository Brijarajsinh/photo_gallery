$(function () {
    //getUrl function creates url to call route with query parameters of search and page number in image table
    function getUrl(sort, sortOrder, page) {
        const url = new URL(location);
        const search = $(".search-cost").val().trim();
        const startDate = $(".start-date").val();
        const endDate = $(".end-date").val();
        //if logged-in user search image by charge than pass user entered value in search parameter of query string 
        if (search) {
            url.searchParams.set("charge", `${search}`);
        }
        //else passes blank string in query parameter
        else {
            url.searchParams.set("charge", "");
        }

        //if user sorts the table contents than sorting field passed in query parameter
        if (sort) url.searchParams.set("sort", `${sort}`);

        //if user sorts the table contents than sorting field passed in query parameter with sortOrder parameter which
        //sorts the records in order like ascending or descending
        if (sortOrder) url.searchParams.set("sortOrder", `${sortOrder}`);

        if (page) url.searchParams.set("page", `${page}`);
        else {
            url.searchParams.set("page", `1`);
        }
        url.searchParams.set("from", `${startDate}`);
        url.searchParams.set("to", `${endDate}`);
        history.pushState({}, "", url);
        return url;
    };

    //sorting on images  based on user selection
    $(".sort").on('click', function () {
        const sort = $(this).attr(`value`);
        const sortOrder = $(this).attr(`data-flag`);
        $.ajax({
            type: "get",
            url: getUrl(sort, sortOrder),
            success: function (res) {
                $("#images-page").html(res);
                if (sortOrder == 'ASC') $(`#${sort}`).attr('data-flag', 'DSC');
                else $(`#${sort}`).attr('data-flag', 'ASC');
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    });

    //if user searches images by charge than ajax request is called with search parameter in query string
    $(".search-image").on('click', function () {
        $.ajax({
            type: "get",
            url: getUrl(),
            success: function (res) {
                $("#images-page").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        });

    });

    //when user moves to another page than ajax called 
    //with that selected page value as page parameter in ajax request query string
    $(".image-wise").on('click', function () {
        const page = $(this).data("page");
        $.ajax({
            type: "get",
            //calling getUrl function with sort and sortOrder = '' and page parameter as page variable
            url: getUrl('', '', page),
            success: function (res) {
                console.log(res);
                $("#images-page").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    });

    //When user click on clear search option to clear filtered image
    //than this function requests an ajax call and clear the search query parameter to fetch all images records
    $(".clear-image").on('click', function () {
        window.location.replace("/gallery");
    });
});