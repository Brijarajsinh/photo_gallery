exports.getGallery = async (req, res, next) => {
    try {
        console.log("ROUTE Called");
        res.render('user/gallery', {
            title: 'Gallery'
        });
    } catch (error) {
        console.log("Error Generated While fetching current setting details");
        res.send({
            type: 'error'
        });
    }
}