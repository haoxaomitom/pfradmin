app.controller('ApprovalPostController', function ($scope, $http, $location) {
    // Khởi tạo các biến
    $scope.approvalPosts = [];
    $scope.approvalPosts = null; // Kết quả tìm kiếm
    $scope.page = 0;
    $scope.size = 15

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Lấy tất cả bài viết với phân trang
    $scope.getAllApprovalPosts = function (page, size) {
        $http.get('http://localhost:8080/api/approval-posts', {
            params: { page: page, size: size },
            headers: headers
        })
            .then(function (response) {
                $scope.approvalPosts = response.data.content.map(post => {
                    post.reviewedAtFormatted = post.reviewedAt ? new Date(post.reviewedAt).toLocaleString('en-GB') : 'N/A';
                    return post;
                });
                $scope.totalPages = response.data.totalPages;
                $scope.currentPage = response.data.number;
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy danh sách bài viết:", error);
            });
    };

    // Duyệt bài viết
    $scope.approvePost = function (postId) {
        const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage

        $http.post(`http://localhost:8080/api/approval-posts/approve/${postId}`, null, {
            params: { userId: userId },
            headers: headers
        })

            .then(function (response) {
                const data = {
                    userId: userId,
                    title: "Đã duyệt bài đăng.",
                    content: "Bài viết của bạn đã được duyệt."
                }
                $http.post("http://localhost:8080/api/notifications/createNotificationApproval", data, {
                    headers: headers
                });

                alert("Bài viết đã được duyệt!");
                $scope.getAllApprovalPosts($scope.currentPage, $scope.pageSize);
            })
            .catch(function (error) {
                console.error("Lỗi khi duyệt bài viết:", error);
            });
    };

    // Từ chối bài viết
    $scope.rejectPost = function (postId) {
        const userId = localStorage.getItem("userId");
        const rejectionReason = prompt("Nhập lý do từ chối:");
        if (rejectionReason) {
            $http.post(`http://localhost:8080/api/approval-posts/reject/${postId}`, null, {
                params: { rejectionReason: rejectionReason, userId: userId },
                headers: headers
            })
                .then(function (response) {
                    const data = {
                        userId: userId,
                        title: "Từ chối duyệt bài đăng !.",
                        content: 'Bài viết của bạn không được duyệt, vui lòng kiểm tra thông tin tại phần "Bài đăng bị từ chối".'
                    }
                    $http.post("http://localhost:8080/api/notifications/createNotificationApproval", data, {
                    headers: headers
                    })
                    .then (function (response){
                        console.log(response);
                    })
                    .catch(function (error){
console.log(error);
                    })
                    alert("Bài viết đã bị từ chối!");
                    $scope.getAllApprovalPosts($scope.currentPage, $scope.pageSize);
                })
                .catch(function (error) {
                    console.error("Lỗi khi từ chối bài viết:", error);
                });
        }
    };

    // Tìm kiếm bài viết
    $scope.searchApprovalPosts = function () {
        // Lấy giá trị tìm kiếm từ input
        const searchQuery = ($scope.searchQuery || '').trim(); // Xử lý khoảng trắng thừa hoặc giá trị null

        // URL và các tham số của API
        const url = 'http://localhost:8080/api/approval-posts/search';
        const params = {
            postId: searchQuery,                     // Tìm kiếm gần đúng theo postId
            page: $scope.currentPage || 0,          // Trang hiện tại (mặc định là 0 nếu chưa có)
            size: $scope.pageSize || 15             // Số lượng bài viết mỗi trang (mặc định 15)
        };

        // Headers cho request
        const headers = {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Lấy token từ localStorage
            'Content-Type': 'application/json'                          // Đảm bảo content-type là JSON
        };

        // Gửi yêu cầu GET đến API
        $http.get(url, { params: params, headers: headers })
            .then(function (response) {
                // Xử lý dữ liệu trả về
                const data = response.data; // Kết quả trả về từ API
                $scope.approvalPosts = data.content.map(post => {
                    return {
                        ...post,
                        reviewedAtFormatted: post.reviewedAt ? new Date(post.reviewedAt).toLocaleString('vi-VN') : 'N/A' // Định dạng ngày giờ
                    };
                });
                $scope.totalPages = data.totalPages; // Tổng số trang
                $scope.currentPage = data.number;   // Trang hiện tại

                if ($scope.approvalPosts.length === 0) {
                    alert('Không tìm thấy bài viết nào phù hợp.');
                }
            })
            .catch(function (error) {
                console.error('Lỗi khi tìm kiếm:', error);
                alert('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.');
            });
    };

    $scope.nextPage = function () {
        if ($scope.page < $scope.totalPages - 1) {
            $scope.page++;
            $scope.getAllApprovalPosts($scope.page, $scope.size);
        }
    };

    // Chuyển trang trước
    $scope.previousPage = function () {
        if ($scope.page > 0) {
            $scope.page--;
            $scope.getAllApprovalPosts($scope.page, $scope.size);
        }
    };


    // Xem chi tiết bài viết
    $scope.viewDetails = function (postId) {
        // Lưu lại đường dẫn hiện tại vào localStorage
        const currentPath = $location.path();
        localStorage.setItem('redirectUrl', currentPath);

        // Điều hướng đến trang chi tiết bài đăng và truyền postId trong query parameters
        $location.path('/post-detail').search({ postId: postId });
    };


    // Khởi chạy
    $scope.getAllApprovalPosts($scope.page, $scope.size);
});
