const adminDashboardHandler = function () {
    this.initialize = function () {
        clearEventHandler();
        bindUserRegistrationFilterEvent();
        bindApprovedRequestFilterEvent();
    };
    clearEventHandler = function () {
        $(document).off('click', '.clear-user-graph').on('click', '.clear-user-graph', function () {
            _this.prepareUserRegistrationStatistics();
        });
        $(document).off('click', '.clear-approved-request-graph').on('click', '.clear-approved-request-graph', function () {
            _this.prepareApprovedRequestStatistics();

        });
    };

    this.getUrl = function (graph, dateRange) {
        let url = `/dashboard/admin/${graph}?`
        if (dateRange) {
            const date = dateRange.split(' - ');
            url += `from=${date[0]}&to=${date[1]}`
        }
        return url
    };

    bindUserRegistrationFilterEvent = function () {
        $(document).off('click', '.apply-registered-users-statistics').on('click', '.apply-registered-users-statistics', function () {
            const datePicked = $('.date-picker-user-graph').val()
            _this.prepareUserRegistrationStatistics(datePicked);
        });
    }

    bindApprovedRequestFilterEvent = function () {
        $(document).off('click', '.apply-approved-request-statistics').on('click', '.apply-approved-request-statistics', function () {
            const datePicked = $('.date-picker-approved-request-graph').val()
            _this.prepareApprovedRequestStatistics(datePicked);
        });
    }

    this.prepareApprovedRequestStatistics = function (dateRange) {
        let url = ''
        if (dateRange) url += this.getUrl('approved-request-statistics', dateRange)
        else url += this.getUrl('approved-request-statistics')
        $.ajax({
            type: "get",
            url: url,
            async: false,
            success: function (res) {
                if (res.type == 'success') {
                    _this.loadApprovedRequestChart(res.WithdrawDateArray, res.countAmountArray);
                    $(".date-picker-approved-request-graph").val(`${res.search.from} - ${res.search.to}`);
                }
                else {
                    console.log("Error generated client side to display graph of users by admin");
                    console.log(res.message);
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    }

    this.prepareUserRegistrationStatistics = function (dateRange) {
        let url = ''
        if (dateRange) url += this.getUrl('user-statistics', dateRange)
        else url += this.getUrl('user-statistics')
        $.ajax({
            type: "get",
            url: url,
            async: false,
            success: function (res) {
                if (res.type == 'success') {
                    _this.loadUserRegistrationChart(res.dateArray, res.countUserArray);
                    $(".date-picker-user-graph").val(`${res.search.from} - ${res.search.to}`);
                }
                else {
                    console.log("Error generated client side to display graph of users by admin");
                    console.log(res.message);
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    }

    this.loadUserRegistrationChart = function (xValues, yValues) {
        new Chart("user-chart", {
            type: "bar",
            data: {
                labels: xValues,
                datasets: [{
                    data: yValues
                }]
            },
            options: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "User Registered in Photo Gallery Affiliate Marketing"
                }
            }
        });
    }

    this.loadApprovedRequestChart = function (xValues, yValues) {
        new Chart("approved-request-chart", {
            type: "line",
            data: {
                labels: xValues,
                datasets: [{
                    data: yValues
                }]
            },
            options: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Withdrawal Request Approved From Photo Gallery Affiliate Marketing"
                }
            }
        });
    }

    this.initialize();
    const _this = this;
};
$(function () {
    const today = moment(new Date()).format('YYYY-MM-DD');
    $(".date-picker-user-graph").daterangepicker({
        startDate: moment().subtract(6, 'day'),
        endDate: today,
        locale: {
            format: 'YYYY-MM-DD'
        },
    });
    $(".date-picker-approved-request-graph").daterangepicker({
        startDate: moment().subtract(6, 'day'),
        endDate: today,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    const dashboardObj = new adminDashboardHandler();
    dashboardObj.prepareUserRegistrationStatistics();
    dashboardObj.prepareApprovedRequestStatistics();
});