$(function () {
    //On Click of copy referral link copy the referral link to the clipboard
    $(".copy-referral-link").on('click', async function () {
        navigator.clipboard.writeText($(".referral-link").val());
        toastr.success(`Refer Link Copied To Clipboard`);
        window.location.redirect(`${$(".referral-link").val()}`);
    });
});