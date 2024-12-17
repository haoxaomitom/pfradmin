
app.controller('PostController', function ($scope, $location, $http) {
  $scope.posts = [];
  $scope.page = 0;  // Số trang hiện tại
  $scope.size = 15;  // Số bài đăng mỗi trang
  $scope.totalPages = 0;  // Tổng số trang
  const token = localStorage.getItem("token");

  // Hàm load các bài đăng từ API
  $scope.loadPosts = function () {
    // Gửi yêu cầu GET đến API với các tham số trang và kích thước
    $http({
      method: 'GET',
      url: 'http://127.0.0.1:8080/api/posts', // Thay đổi URL tùy theo cấu hình của bạn
      params: {
        page: $scope.page,
        size: $scope.size
      },
      headers: {
        'Authorization': 'Bearer ' + token,
      }
    }).then(function (response) {
      // Khi nhận được dữ liệu, cập nhật posts và tổng số trang
      $scope.posts = response.data.content;  // Nội dung bài đăng
      $scope.totalPages = response.data.totalPages;  // Tổng số trang
    }, function (error) {
      console.log('Có lỗi xảy ra khi tải bài đăng:', error);
    });
  };

  // Hàm chuyển sang trang sau
  $scope.nextPage = function () {
    if ($scope.page < $scope.totalPages - 1) {
      $scope.page++;
      $scope.loadPosts();
    }
  };

  // Hàm chuyển sang trang trước
  $scope.previousPage = function () {
    if ($scope.page > 0) {
      $scope.page--;
      $scope.loadPosts();
    }
  };

  // Hàm tìm kiếm bài đăng theo từ khóa
  $scope.searchPosts = function () {
    if ($scope.searchQuery) {
      $http({
        method: 'GET',
        url: 'http://127.0.0.1:8080/api/posts/admin/search',
        params: {
          postId: $scope.searchQuery, // Đưa searchQuery vào params
          page: 0,
          size: $scope.size
        },
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      }).then(function (response) {
        $scope.posts = response.data.content;
        console.log($scope.posts);
        $scope.totalPages = response.data.totalPages;
      }).catch(function (error) {
        console.error('Error fetching posts:', error);
      });
    } else {
      $scope.loadPosts();
    }
  };

  $scope.viewDetails = function (postId) {
    // Lưu lại đường dẫn hiện tại vào localStorage
    const currentPath = $location.path();
    localStorage.setItem('redirectUrl', currentPath);

    // Điều hướng đến trang chi tiết bài đăng
    // $location.path('/admin/post-detail/' + postId);
    $location.path('/post-detail').search({ postId: postId });

  };

  
  // Hàm khởi tạo và tải các bài đăng khi load trang
  $scope.init = function () {
    $scope.loadPosts();
  };

  // Gọi hàm init khi controller được khởi tạo
  $scope.init();
});
