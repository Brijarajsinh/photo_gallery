const adminDashboardHandler = function () {
    this.initialize = function () {
        //clear searching by admin user
        clearEventHandler();

    }
    clearEventHandler = function () {
        $(document).off('click', '.clear-user-graph').on('click', '.clear-user-graph', function () {
            window.location.replace('/dashboard');
        });
    };

    getUrl = function (start, end) {
        const url = new URL(location);
        if (start || end) {
            url.searchParams.set("from", start);
            url.searchParams.set("to", end);
        }
        return url
    };

    this.bindUserRegistrationFilterEvent = function () {
        // handle search event
    }

    this.prepareUserRegistrationStatistics = function (from, to) {
        let url = '';
        if (from || to) url += getUrl(from, to)
        else url += '/dashboard/admin/user-statistics'
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                if (res.type == 'success') {
                    _this.loadUserRegistrationChart(res.dateArray, res.countUserArray);
                    $(".start-date-user-graph").val(res.search.from);
                    $(".end-date-user-graph").val(res.search.to);
                }
                else {
                    console.log(res.message);
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    }

    this.loadUserRegistrationChart = function (xValues, yValues) {
        const barColors = ["red", "green", "blue", "orange", "brown"];
        new Chart("userRegisteredGraph", {
            type: "bar",
            data: {
                labels: xValues,
                datasets: [{
                    backgroundColor: barColors,
                    data: yValues
                }]
            },
            options: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "user registered in photo gallery affiliate marketing"
                }
            }
        });
    }

    const _this = this;
};
$(function () {
    const dashboardObj = new adminDashboardHandler();
    dashboardObj.initialize();
    dashboardObj.prepareUserRegistrationStatistics();
});


/*
new Chart("approveWithdrawalAmount", {
type: "bar",
data: {
labels: xValues,
datasets: [{
backgroundColor: barColors,
data: yValues
}]
},
options: {
legend: { display: false },
title: {
display: true,
text: "Withdrawal amount from photo gallery affiliate marketing"
}
}
});
*/