const userDashboardHandler = function () {
    this.initialize = function () {
        copyReferLink();
        clearEventHandler();
        bindTransactionFilterEvent();
    };

    copyReferLink = function () {
        $(document).off('click', ".copy-referral-link").on('click', ".copy-referral-link", function () {
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

    clearEventHandler = function () {
        $(document).off('click', '.clear-transaction-graph').on('click', '.clear-transaction-graph', function () {
            _this.prepareTransactionStatistics();
        });
    };

    bindTransactionFilterEvent = function () {
        $(document).off('click', '.apply-transaction-statistics').on('click', '.apply-transaction-statistics', function () {
            const datePicked = $('.date-picker-transaction-graph').val();
            _this.prepareTransactionStatistics(datePicked);
        })
    };

    this.getUrl = function (dateRange) {
        let url = '/dashboard/user/transaction-statistics?';
        if (dateRange) {
            const date = dateRange.split(' - ');
            url += `from=${date[0]}&to=${date[1]}`
        }
        return url
    }
    this.prepareTransactionStatistics = function (dateRange) {
        let url = '';
        if (dateRange) url += this.getUrl(dateRange)
        else url += this.getUrl()
        $.ajax({
            type: 'get',
            url: url,
            success: function (res) {
                if (res.type == 'success') {
                    _this.loadCreditTransactionChart(res.creditLabel, res.creditAmount);
                    _this.loadDebitTransactionChart(res.debitLabel, res.debitAmount);
                    $('.date-picker-transaction-graph').val(`${res.search.from} - ${res.search.to}`)
                }
                else {
                    console.log("Error Generated When User Creates Transaction Graph");
                    console.log(res.message);
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    }

    this.loadCreditTransactionChart = function (xValues, yValues) {
        new Chart('credit-transaction-chart', {
            type: "doughnut",
            data: {
                labels: xValues,
                datasets: [{
                    data: yValues,
                }]
            },
        });
    }

    this.loadDebitTransactionChart = function (xValues, yValues) {
        new Chart('debit-transaction-chart', {
            type: "pie",
            data: {
                labels: xValues,
                datasets: [{
                    data: yValues,
                }]
            }
        });
    }
    const _this = this;
    this.initialize();
}

$(function () {
    const dashboardObj = new userDashboardHandler();
    dashboardObj.prepareTransactionStatistics();
});