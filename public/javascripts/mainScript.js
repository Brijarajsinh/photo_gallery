//if user's role is admin than user will join adminRoom of socket to get notification on image upload
if ("{{user.role}}" == 'admin') {
    const socket = io({
      query: { "RoomID": "adminRoom" }
    });
    socket.on("imageUpload", (data) => {
      toastr.success(`Image Uploaded by ${data.userName}`);
    });

    socket.on("withdrawRequest", (data) => {
      toastr.success(`Withdraw Requested by ${data.userName}`);
    });
  }

  //else if user's role is user than user will join userRoom of socket to get notification on reference user's registration
  else if ("{{user.role}}" == 'user') {
    const socket = io({
      query: { "RoomID": "userRoom" }
    });
    socket.on("registerWithReferLink", (data) => {
      if ("{{user._id}}" == data.referredBy) {
        toastr.success(`${data.userName} registered with your referral link`);
      }
    });

    socket.on("requestUpdate", (data) => {
      if ("{{user._id}}" == data.userId) {
        toastr.success(`${data.message}`);
      }
    });
  }

  (function ($) {
    "use strict";
    /**jQuery('#vmap').vectorMap({
      map: 'world_en',
      backgroundColor: null,
      color: '#ffffff',
      hoverOpacity: 0.7,
      selectedColor: '#1de9b6',
      enableZoom: true,
      showTooltip: true,
      //values: sample_data,
      scaleColors: ['#1de9b6', '#03a9f5'],
      normalizeFunction: 'polynomial'
    });
    **/
  })(jQuery);