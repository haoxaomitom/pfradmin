
app.controller('ReportController', function ($http, $scope) {

    const baseUrl = 'http://localhost:8080/api/admin/reports';
    const token = localStorage.getItem("token");

    $scope.reports = [];
    $scope.updateFilteredReports = [];
    $scope.searchQuery = '';
    $scope.sortBy = 'createdAt';
    $scope.currentPage = 1;
    $scope.itemsPerPage = 5;
    $scope.totalPages = 1;
    $scope.rejectingReport = null;
    $scope.rejectedReason = "";
    $scope.selectedReport = null; // Để lưu thông tin báo cáo được chọn

    $scope.loadReports = function () {
        $http.get(`${baseUrl}/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(function (response) {
            $scope.reports = response.data;
            console.log("Reports:", $scope.reports);
    
            $scope.totalPages = Math.ceil($scope.reports.length / $scope.itemsPerPage);
            $scope.updateFilteredReports();
        }).catch(function (error) {
            console.error("Lỗi khi tải báo cáo:", error);
            alert("Không thể tải báo cáo.");
        });
    };
    

    $scope.updateFilteredReports = function () {
        let filtered = $scope.reports;
    
        console.log("Before Filtering:", filtered);
    
        // Tìm kiếm báo cáo
        if ($scope.searchQuery) {
            filtered = filtered.filter(report =>
                report.reportContent.toLowerCase().includes($scope.searchQuery.toLowerCase()));
        }
        console.log("After Filtering:", filtered);
    
        // Sắp xếp báo cáo
        filtered.sort((a, b) => {
            if ($scope.sortBy === 'createdAt') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return a.status.localeCompare(b.status);
        });
        console.log("After Sorting:", filtered);
    
        // Phân trang
        const start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        const end = start + $scope.itemsPerPage;
        $scope.filteredReports = filtered.slice(start, end);
    
        console.log("Filtered Reports (Paginated):", $scope.filteredReports);
    };
    


    $scope.sortReports = function () {
        $scope.updateFilteredReports();
    };

    $scope.changePage = function (page) {
        if (page < 1 || page > $scope.totalPages) return;
        $scope.currentPage = page;
        $scope.updateFilteredReports();
    };

    $scope.approveReport = function (reportId) {
        $http.put(`${baseUrl}/${reportId}/status?status=Đã duyệt`, null, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(function () {
            const report = $scope.reports.find(r => r.reportId === reportId);
            if (report) report.status = 'Đã duyệt';
            $scope.updateFilteredReports();
            alert("Báo cáo đã được duyệt.");
        }).catch(function (error) {
            console.error("Lỗi khi duyệt báo cáo:", error);
            alert("Không thể duyệt báo cáo.");
        });
    };

    $scope.openRejectModal = function (report) {
        $scope.rejectingReport = report;
        $scope.rejectedReason = "";
        $('#rejectModal').modal('show');
    };

    $scope.viewReportDetails = function (report) {
        $scope.selectedReport = report;
        $('#detailsModal').modal('show'); // Mở modal xem chi tiết
    };

    $scope.confirmReject = function () {
        if (!$scope.rejectedReason.trim()) {
            alert("Vui lòng nhập lý do từ chối.");
            return;
        }
        const reportId = $scope.rejectingReport.reportId;
        $http.put(`${baseUrl}/${reportId}/status?status=Bị từ chối&reason=${encodeURIComponent($scope.rejectedReason)}`, null, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(function () {
            const report = $scope.reports.find(r => r.reportId === reportId);
            if (report) {
                report.status = 'Bị từ chối';
                report.rejectedReason = $scope.rejectedReason;
            }
            $scope.updateFilteredReports();
            alert("Báo cáo đã bị từ chối.");
            $('#rejectModal').modal('hide');
        }).catch(function (error) {
            console.error("Lỗi khi từ chối báo cáo:", error);
            alert("Không thể từ chối báo cáo.");
        });
    };

    // Initial data load
    $scope.loadReports();
});