app.controller('HomeController', function ($scope, $http, $location) {

    $scope.logout = function () {
        // Xóa toàn bộ dữ liệu lưu trữ trong localStorage
        localStorage.clear();

        // Chuyển hướng về trang đăng nhập
        $location.path('#/login');

    };
})
