$(function () {
    //On Click of copy referral link copy the referral link to the clipboard
    $(".copy-referral-link").on('click', async function () {
        navigator.clipboard.writeText($(".referral-link").text());
        toastr.success(`Refer Link (${$(".referral-link").text()}) Copied To Clipboard`);
    });
});