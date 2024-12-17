let app = angular.module('ParkingAdminApp', ['ngRoute', 'ngSanitize']);

// Đặt đoạn mã xử lý logic trước khi thay đổi route
app.run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        // Kiểm tra token trong localStorage
        const token = localStorage.getItem('token');

        // Nếu không có token và không phải đang ở trang đăng nhập
        if (!token && $location.path() !== '/login') {
            event.preventDefault(); // Ngăn chặn điều hướng
            $location.path('/login'); // Chuyển hướng đến trang đăng nhập
        }
    });
}]);

app.config(["$routeProvider", "$locationProvider", function ($routeProvider,  $locationProvider) {
    $locationProvider.html5Mode(false); // Sử dụng hash mode
    $locationProvider.hashPrefix(''); // Không thêm ký tự "!"
    $routeProvider
        .when('/', {
            templateUrl: 'app/components/admin/Home.html',
            controller: 'HomeController'
        })
        .when('/statistic', {
            templateUrl: 'app/components/admin/statistic.html',
            controller: 'adminAppController'
        })
        .when('/login', {
            templateUrl: 'app/components/login/Login.html',
            controller: 'LoginController'
        })
        .when('/post', {
            templateUrl: 'app/components/admin/Post.html',
            controller: 'PostController'
        })
        .when('/post-detail', {
            templateUrl: 'app/components/admin/PostDetail.html',
            controller: 'PostDetailController'
        })
        .when('/approve', {
            templateUrl: 'app/components/admin/AprovePost.html',
            controller: 'ApprovalPostController'
        })
        .when('/account', {
            templateUrl: 'app/components/admin/Account.html',
            controller: 'AccountController'
        })
        .when('/payment', {
            templateUrl: 'app/components/admin/Payment.html',
            controller: 'PaymentController'
        })
        .when('/price', {
            templateUrl: 'app/components/admin/Price.html',
            controller: 'PriceController'
        })
        .when('/report', {
            templateUrl: 'app/components/admin/Rp.html',
            controller: 'ReportController'
        })
        .when('/user', {
            templateUrl: 'app/components/admin/Users.html',
            controller: 'AdminController'
        })
        .when('/detailAccount', {
            templateUrl: 'app/components/admin/DetailAcount.html',
            controller: 'detailUserController'
        })
        .otherwise({
            redirectTo: '/'
        });

}]);
// Đặt đoạn mã sửa lỗi URL
app.run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function () {
        let decodedPath = decodeURIComponent($location.path());
        if ($location.path() !== decodedPath) {
            $location.path(decodedPath).replace();
        }
    });
}]);