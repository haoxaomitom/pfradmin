app.controller('PaymentController', function ($scope, $http, $location) {
    $scope.payments = [];
    $scope.userPayments = [];
    $scope.selectedPayment = {};
    $scope.searchQuery = '';
    $scope.sortCriteria = 'paymentDate';
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.totalPages = 0;
    $scope.searchParams = {
        userId: null,
        paymentId: null,
        postId: null,
        page: 0,
        size: 10
    };

    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    // Cấu hình headers với token
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    $scope.loadAllPayments = function () {
        // Gọi API với các tham số phân trang
        $http.get('http://localhost:8080/api/admin/payments/all', {
            params: {
                page: $scope.currentPage,
                size: $scope.pageSize
            },
            headers: config.headers // Thêm headers
        })
        .then(function (response) {
            $scope.payments = response.data.content; // Lấy dữ liệu thanh toán từ `content`
            console.log($scope.payments);
            $scope.totalPages = response.data.totalPages; // Tổng số trang
            $scope.totalElements = response.data.totalElements; // Tổng số phần tử
        })
        .catch(function (error) {
            console.error('Lỗi khi tải danh sách thanh toán:', error);
            $scope.errorMessage = 'Không thể tải danh sách thanh toán. Vui lòng thử lại sau.';
        });
    };

    $scope.searchPayments = function (query) {
        if (!query) {
            $scope.errorMessage = 'Vui lòng nhập từ khóa tìm kiếm!';
            return;
        }

        const params = {
            userId: null,
            paymentId: null,
            postId: null,
            page: $scope.currentPage,
            size: $scope.pageSize
        };

        if (!isNaN(query)) {
            if (query.length >= 10) {
                params.paymentId = query; // ID thanh toán
            } else if (query.length <= 5) {
                params.userId = query; // UserId
            } else {
                params.postId = query; // ID bài đăng
            }
        } else {
            $scope.errorMessage = 'Chỉ hỗ trợ tìm kiếm bằng số!';
            return;
        }

        $http.get('http://localhost:8080/admin/payments/search', {
            params: params,
            headers: config.headers // Thêm headers
        })
        .then(function (response) {
            $scope.payments = response.data.content; // Dữ liệu trang hiện tại
            $scope.totalPages = response.data.totalPages; // Tổng số trang
            $scope.currentPage = response.data.number;   // Trang hiện tại
            $scope.errorMessage = ''; // Xóa lỗi cũ
        })
        .catch(function (error) {
            console.error('Lỗi khi tìm kiếm thanh toán:', error);
            $scope.errorMessage = 'Không thể tìm kiếm thanh toán. Vui lòng thử lại sau.';
        });
    };

    $scope.loadPayments = function (userId, page, size) {
        $http.get(`http://localhost:8080/api/vnpay/user/${userId}`, {
            params: { page: page, size: size },
            headers: config.headers // Thêm headers
        })
        .then(function (response) {
            $scope.userPayments = response.data.content; // Payments for the current page
            $scope.totalPages = response.data.totalPages; // Total pages
            $scope.currentPage = response.data.number;   // Current page
        })
        .catch(function (error) {
            console.error('Lỗi khi lấy danh sách thanh toán:', error);
        });
    };

    $scope.viewPayment = function (paymentId) {
        $http.get(`http://localhost:8080/api/vnpay/${paymentId}`, config)
        .then(function (response) {
            $scope.selectedPayment = response.data;
            $('#paymentModal').modal('show');
        })
        .catch(function (error) {
            console.error('Lỗi khi lấy chi tiết thanh toán:', error);
        });
    };

    $scope.viewDetails = function (postId) {
        const currentPath = $location.path();
        localStorage.setItem('redirectUrl', currentPath);
        $location.path('/post-detail').search({ postId: postId });
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPages - 1) {
            $scope.currentPage++;
            $scope.loadAllPayments();
        }
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
            $scope.loadAllPayments();
        }
    };

    $scope.formatCurrency = function (amount) {
        if (amount != null) {
            return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        return "0 VND";
    };

    $scope.loadAllPayments();
});
