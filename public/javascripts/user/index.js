const dashboardHandler = (function () {
    this.initialize = function () {
        //Option to copy referral link
        copyReferLink();
    };

    //On Click of copy referral link copy the referral link to the clipboard
    copyReferLink = function () {
        $(".copy-referral-link").on('click', function () {
            navigator.clipboard
                .writeText($(".referral-link").val())
                .then(() => {
                    toastr.success(`Refer Link Copied To Clipboard`);
                    const timeOut = setTimeout(toast, 2000);
                    function toast() {
                        window.location.replace(`${$(".referral-link").val()}`);
                    }
                })
                .catch(() => {
                    toastr.error("something went wrong");
                });
        });
    };

    const _this = this;
    this.initialize();
})()