app.controller('PriceController', ['$scope', '$http', function ($scope, $http) {
    const baseUrl = 'https://doantotnghiepbe-production.up.railway.app/api/prices';

    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    // Cấu hình headers với token
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    $scope.prices = [];
    $scope.price = {};
    $scope.editingPrice = null;
    $scope.status = 'DEACTIVATE'

    // Lấy danh sách giá
    $scope.getAllPrices = function () {
        $http.get(baseUrl, config).then(
            function (response) {
                $scope.prices = response.data;
            },
            function (error) {
                console.error('Error fetching prices:', error);
            }
        );
    };

    // Hàm định dạng số thành VND
    $scope.convertToCurrency = function (amount) {
        if (!amount) return '';
        return parseInt(amount).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND'
        });
    };

    $scope.calculateFinalAmount = function () {
        if ($scope.price.amount && $scope.price.discountPercentage) {
            const discount = ($scope.price.amount * $scope.price.discountPercentage) / 100;
            $scope.price.finalAmount = $scope.price.amount - discount;
        } else {
            $scope.price.finalAmount = 0;
        }
    };

    $scope.formatCurrency = function (amount) {
        if (amount != null) {
            return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        return "0 VND";
    };

    // Tạo mới giá
    $scope.createPrice = function () {
        $http.post(baseUrl, $scope.price, config).then(
            function (response) {
                $scope.prices.push(response.data);
                $scope.newPrice = {}; // Reset form
            },
            function (error) {
                console.error('Error creating price:', error);
            }
        );
    };

    // Cập nhật giá
    $scope.updatePrice = function () {
        if ($scope.editingPrice) {
            $http.put(`${baseUrl}/${$scope.editingPrice.priceId}`, $scope.editingPrice, config).then(
                function (response) {
                    $scope.getAllPrices(); // Refresh danh sách
                    $scope.editingPrice = null; // Reset form
                },
                function (error) {
                    console.error('Error updating price:', error);
                }
            );
        }
    };

    // Chọn giá để chỉnh sửa
    $scope.editPrice = function (price) {
        $scope.editingPrice = angular.copy(price); // Sao chép thông tin của giá cần sửa
        $scope.price = $scope.editingPrice; // Điền dữ liệu vào form
    };

    $scope.priceToDelete = null; // Biến để lưu trữ giá cần xóa

    // Xử lý việc gọi modal và lưu thông tin của giá cần xóa
    $scope.deletePrice = function (price) {
        // Lưu thông tin price cần xóa vào biến $scope.priceToDelete
        $scope.priceToDelete = price;
        // Mở modal xác nhận xóa
        $('#confirmDeleteModal').modal('show');
    };


    // Xác nhận xóa
    $scope.confirmDelete = function () {

        // Gửi yêu cầu xóa với header Authorization
        if ($scope.priceToDelete && token) {
            $http.delete(`https://doantotnghiepbe-production.up.railway.app/api/prices/${$scope.priceToDelete.priceId}`, {
                headers: { 'Authorization': `Bearer ${token}` }  // Thêm header Authorization
            })
            .then(function (response) {
                // Xử lý thành công
                console.log('Xóa thành công:', response.data);
                // Đóng modal
                $('#confirmDeleteModal').modal('hide');
                // Cập nhật lại danh sách giá sau khi xóa
                $scope.getPrices();  // Hoặc phương thức tương tự để tải lại dữ liệu
            })
            .catch(function (error) {
                // Xử lý lỗi
                console.error('Lỗi khi xóa:', error);
                // Đóng modal
                $('#confirmDeleteModal').modal('hide');
                alert('Đã xảy ra lỗi khi xóa giá. Vui lòng thử lại.');
            });
        }
    };

    $scope.resetForm = function () {
        $scope.price = {
            duration: '',
            amount: '',
            discountPercentage: '',
            currency: '',
            finalAmount: '',
            description: '',
            status: 1
        };
        $scope.editingPrice = null; // Reset giá đang sửa
    };


    // Khởi tạo bằng cách load dữ liệu
    $scope.getAllPrices();
}]);

// Bộ lọc định dạng tiền tệ
app.filter('currencyFormat', function () {
    return function (amount) {
        if (!amount) return '';
        return parseInt(amount).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND'
        });
    };
});
