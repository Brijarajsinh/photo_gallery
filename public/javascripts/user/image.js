//uploadImage object consists all user selected images
const uploadImage = {}
const imageUploadHandler = (function () {
    this.initialize = function () {
        //remove selected image for uploading
        removeImage();

        //cancel the precess of image uploading and continue in gallery page
        cancelImageUpload();

        //selection of image by client
        imageSelection();

        //stores the selected image
        storeImage();
    };

    //when client removes particular selected image than remove that selected image from preview 
    //and also remove that selected file from uploadImage object
    removeImage = function () {
        $(document).on('click', '.remove-image', function () {
            const image = $(this).parent().attr('data-image');
            delete uploadImage[image];
            $("div").find(`[data-image='${image}']`).remove();
        });
    };

    //when client press cancel button for uploading image that redirect client to gallery page
    cancelImageUpload = function () {
        $(".cancel-upload").on('click', function () {
            window.location.href = 'http://localhost:3000/gallery';
        });
    };

    //On selection of image to upload a preview of that selected image can be view by client 
    //and object for uploading image will store this selected image
    imageSelection = function () {
        $("#image").on('change', function () {
            const input = document.getElementById('image');
            const output = document.getElementById('upload-image-list');
            for (var i = 0; i < input.files.length; ++i) {
                //on image selection of client store that image in uploadImage object
                //and also give the preview of selected image to the client
                uploadImage[input.files.item(i).name] = input.files.item(i);
                output.innerHTML += `<div class="col" data-image="${input.files.item(i).name}">
                    <a href="javascript:void(0);" class="fa fa-close float-right remove-image"></a>
                    <img class="image-upload text-danger ml-1" src=${window.URL.createObjectURL(input.files.item(i))} alt="Select Proper Image" />
                    </div>
                    `;
            };
        });
    };

    //Store uploaded image in db and redirect to gallery page on successfully uploading
    storeImage = function () {
        $(".store-image").on('click', function () {
            /*
                //Validating size of to be uploaded file
                $.validator.addMethod('filesize', function (value, element, param) {
                    //add filesize rule to JqueryValidator which validates user to upload file greater than 2 mb size
                    return this.optional(element) || (element.files[0].size <= param * 1000000)
                }, 'File size must be less than {2} MB');
            */
            $("#add-image-form").validate({
                //using jquery validations, validate client selected file is image or not
                //if not image than gives message to the client side
                keypress: true,
                rules: {

                    //rules for file upload extension
                    "image": {
                        extension: "gif|jpeg|png|jpg",
                        // filesize: 2
                    }
                },
                messages: {

                    //message on file upload rule break
                    "image": {
                        extension: "Please select .gif , .png or .jpeg/.jpg file",
                        //filesize: "File must be less than 2 MB"
                    }
                },
                //errorPlacement function to place error after element, if error generated
                errorPlacement: function (error, element) {
                    if (element.attr('name') == "image") {
                        error.insertAfter("#image-error");
                    } else {
                        error.insertAfter(element);
                    }
                },

                //on press of upload button by client
                submitHandler: function () {
                    const formData = new FormData();

                    //if user selects image than
                    if (Object.values(uploadImage).length) {

                        //append all the selected image to formData object
                        for (let i = 0; i < Object.values(uploadImage).length; i++) {
                            formData.append(`photos`, Object.values(uploadImage)[i]);
                        }

                        //Ajax request of post method for add selected image in image collection
                        $.ajax({
                            type: "post",
                            url: '/gallery/upload-image',
                            enctype: 'multipart/form-data',
                            data: formData,
                            contentType: false,
                            processData: false,
                            success: function (res) {
                                if (res.type == 'success') {
                                    //success response of ajax call redirect client to gallery page
                                    toastr.success("please wait, Image are successfully uploaded");
                                    const timeOut = setTimeout(toast, 3000);
                                    function toast() {
                                        window.location.href = 'http://localhost:3000/gallery';
                                    }
                                }
                                else {
                                    //on error response of ajax call client stays in same page and toastr show error message
                                    toastr.error(res.message);
                                }
                            },
                            error: function (err) {
                                console.log(err.toString());
                            }
                        });
                    }
                    //if without selecting any image file client press upload button than client get notify from toastr message
                    else {
                        toastr.error("Please Select Images To upload");
                    }
                }
            })
        });
    }

    const _this = this;
    this.initialize();
})();