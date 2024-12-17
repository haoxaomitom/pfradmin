// let app = angular.module('app', [])
app.controller('PostDetailController', function ($scope, $http, $location) {
    // Retrieve userId from localStorage
    const token = localStorage.getItem('token');
    $scope.user_id = localStorage.getItem('userId');
    const queryParams = new URLSearchParams($location.absUrl().split('?')[1]);
    $scope.postId = queryParams.get('postId');
    const postId = $scope.postId;
    $scope.currentStep = 1;
    $scope.isLoading = false;
    $scope.isSubmitted = false; // kiểm tra đã đăng bài hay chưa

    $scope.tags = []; // Danh sách tiện ích hiển thị
    $scope.manualInput = ""; // Tiện ích nhập thủ công
    $scope.vehicleTags = []; // Danh sách loại xe hiển thị
    $scope.manualVehicleInput = ""; // Loại xe nhập thủ công


    $scope.checkboxOptions = {
        camera: 'Camera giám sát',
        security247: 'Bảo vệ 24/7',
        privatePath: 'Bảo vệ 24/24',
        electricParking: 'Chỗ để / sạc xe điện',
        wifi: 'Có rửa xe',
        key: 'Có khóa cổng riêng',
        cover: "Có mái che"
    };

    $scope.vehicleCheckboxOptions = {
        car: 'Xe oto',
        motorbike: 'Xe máy',
        bike: 'Xe du lịch 16 chỗ',
        electricCar: 'Xe oto điện',
        truck: 'Xe tải con',
        bigtruck: 'Xe tải trung',
        supertruck: 'Xe siêu tải trọng'
    };
    
    $scope.selectedAmenities = {}; // To keep track of selected amenities
    $scope.manualInput = ""; // For manual input of amenities

    // Function to move to the next step
    $scope.nextStep = function () {
        if ($scope.currentStep < 7) {
            $scope.currentStep++;
        }
    };
    $scope.prevStep = function () {
        if ($scope.currentStep > 1) {
            $scope.currentStep--;
        }
    };

    // Load dữ liệu tỉnh, huyện, xã
    $http.get('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json')
        .then(response => $scope.provinces = response.data)
        .catch(error => console.error('Error loading data:', error));

    // $scope.onProvinceChange = function () {
    //     $scope.selectedDistrict = null;
    //     $scope.selectedWard = null;
    // };

    // $scope.onDistrictChange = function () {
    //     $scope.selectedWard = null;
    // };

    // Thêm loại xe từ checkbox
    $scope.toggleVehicleCheckbox = function (key, label) {
        if ($scope.post.vehicleTypes[key]) {
            if (!$scope.vehicleTags.includes(label)) {
                $scope.vehicleTags.push(label); // Thêm vào tag nếu chọn
            }
        } else {
            $scope.vehicleTags = $scope.vehicleTags.filter(tag => tag !== label); // Loại khỏi tag nếu bỏ chọn
        }
    };


    // Thêm loại xe từ nhập thủ công
    $scope.addVehicleTag = function () {
        const tagText = $scope.manualVehicleInput.trim();
        if (!tagText || $scope.vehicleTags.includes(tagText)) {
            return alert('Loại xe đã tồn tại hoặc nhập rỗng!');
        }
        $scope.vehicleTags.push(tagText); // Thêm vào tag
        $scope.post.vehicleTypes[tagText] = true; // Thêm loại xe vào model
        $scope.manualVehicleInput = '';
    };


    // Xóa loại xe
    $scope.removeVehicleTag = function (tag) {
        $scope.vehicleTags = $scope.vehicleTags.filter(t => t !== tag);
        const key = Object.keys($scope.vehicleCheckboxOptions).find(k => $scope.vehicleCheckboxOptions[k] === tag);
        if (key) {
            $scope.post.vehicleTypes[key] = false; // Bỏ chọn checkbox
        } else {
            delete $scope.post.vehicleTypes[tag]; // Loại bỏ loại xe khỏi model
        }
    };


    // Thêm thẻ từ checkbox
    $scope.toggleCheckbox = function (key, label) {
        if ($scope.post.amenities[key]) {
            if (!$scope.tags.includes(label)) {
                $scope.tags.push(label); // Thêm vào tag nếu chọn
            }
        } else {
            $scope.tags = $scope.tags.filter(tag => tag !== label); // Loại khỏi tag nếu bỏ chọn
        }
    };


    // Thêm tiện ích từ nhập thủ công
    $scope.addTag = function () {
        const tagText = $scope.manualInput.trim();
        if (!tagText || $scope.tags.includes(tagText)) {
            return alert('Tiện ích đã tồn tại hoặc nhập rỗng!');
        }
        $scope.tags.push(tagText); // Thêm vào tag
        $scope.post.amenities[tagText] = true; // Thêm tiện ích vào model
        $scope.manualInput = '';
    };


    // Xóa tiện ích
    $scope.removeTag = function (tag) {
        $scope.tags = $scope.tags.filter(t => t !== tag);
        const key = Object.keys($scope.checkboxOptions).find(k => $scope.checkboxOptions[k] === tag);
        if (key) {
            $scope.post.amenities[key] = false; // Bỏ chọn checkbox
        } else {
            delete $scope.post.amenities[tag]; // Loại bỏ tiện ích khỏi model
        }
    };

    const apiUrl = `http://localhost:8080/api/posts/${postId}`;

    $scope.post = {};
    $scope.imageUrls = []; // Danh sách URL ảnh cũ
    $scope.newImages = []; // Danh sách file ảnh mới được chọn
    $scope.deletedImages = []; // Danh sách ảnh bị xóa
    $scope.loadPostData = function () {
        $http.get(apiUrl)
            .then(function (response) {
                $scope.post = response.data;
                // Populate form with data from API (province, district, ward)

                $scope.selectedProvince = $scope.provinces.find(province => province.Name === $scope.post.provinceName);
                
                $scope.selectedDistrict = $scope.selectedProvince ? $scope.selectedProvince.Districts.find(district => district.Name === $scope.post.districtName) : null;
                $scope.selectedWard = $scope.selectedDistrict ? $scope.selectedDistrict.Wards.find(ward => ward.Name === $scope.post.wardName) : null;
                $scope.post.priceUnit = $scope.post.priceUnit

                // Map amenities to checkbox model and tags
                if ($scope.post.amenities) {
                    $scope.post.amenities.forEach(amenity => {
                        const key = Object.keys($scope.checkboxOptions).find(k => $scope.checkboxOptions[k] === amenity.amenitiesName);
                        if (key) {
                            $scope.post.amenities[key] = true; // Tích checkbox
                            $scope.tags.push($scope.checkboxOptions[key]); // Thêm vào tag
                        } else {
                            // If the amenity is not in checkboxOptions, display it as a tag
                            $scope.tags.push(amenity.amenitiesName);
                        }
                    });
                }

                // Map vehicle types to checkbox model and tags
                if ($scope.post.vehicleTypes) {
                    $scope.post.vehicleTypes.forEach(vehicleType => {
                        const key = Object.keys($scope.vehicleCheckboxOptions).find(k => $scope.vehicleCheckboxOptions[k] === vehicleType.vehicleTypesName);
                        if (key) {
                            $scope.post.vehicleTypes[key] = true; // Tích checkbox
                            $scope.vehicleTags.push($scope.vehicleCheckboxOptions[key]); // Thêm vào tag
                        } else {
                            // If the vehicle type is not in vehicleCheckboxOptions, display it as a tag
                            $scope.vehicleTags.push(vehicleType.vehicleTypesName);
                        }
                    });
                }

                if ($scope.post.images) {
                    console.log($scope.post.images);
                    $scope.imageUrls = []; // Khởi tạo mảng ảnh cũ
                    $scope.post.images.forEach(image => {
                        // Đẩy URL ảnh vào imageUrls
                        $scope.imageUrls.push(image.imageUrl);
                    });
                }
                

            })
            .catch(function (error) {
                console.error("Error loading post data:", error);
                alert("Không thể tải dữ liệu bài đăng. Vui lòng thử lại.");
            });
    };


    $scope.amenities = {}; // Để ánh xạ tiện ích đến checkbox
    $scope.vehicleTypes = {}; // Để ánh xạ loại xe đến checkbox

    
    
    $scope.onFileSelect = function (files) {
        $scope.$apply(function () {
            Array.from(files).forEach(function (file) {
                file.preview = URL.createObjectURL(file); // Tạo preview URL cho file
                $scope.newImages.push(file); // Lưu vào newImages
            });
        });
    };
    
    $scope.removeImage = function (image) {
        if (image.preview) {
            // Nếu là ảnh mới
            const index = $scope.newImages.indexOf(image);
            if (index !== -1) {
                $scope.newImages.splice(index, 1); // Xóa khỏi danh sách ảnh mới
            }
        } else {
            // Nếu là ảnh cũ
            const index = $scope.imageUrls.indexOf(image);
            if (index !== -1) {
                $scope.deletedImages.push(image); // Đánh dấu là đã xóa
                $scope.imageUrls.splice(index, 1); // Xóa khỏi danh sách ảnh cũ
            }
        }
    };
    
    
    $scope.uploadImages = async function (postId) {
        const formData = new FormData();
    
        // Gửi danh sách ảnh bị xóa
        if ($scope.deletedImages.length > 0) {
            $scope.deletedImages.forEach(url => {
                formData.append('deletedImages', JSON.stringify(url)); // Gửi URL ảnh bị xóa
            });
        }
    
        // Gửi danh sách ảnh mới
        if ($scope.newImages.length > 0) {
            $scope.newImages.forEach(file => {
                formData.append('newImages', file);
            });
        }
    
        try {
            const response = await $http.post(`http://localhost:8080/api/updatePosts/updateImage/${postId}`, formData, {
                headers: { 'Content-Type': undefined, 'Authorization': `Bearer ${token}` },
                transformRequest: angular.identity
            });
    
            alert('Upload thành công!');
            return response.data.imageUrls || [];
        } catch (error) {
            alert('Có lỗi xảy ra trong quá trình upload!');
            console.error(error);
            return [];
        }
    };
    
    $scope.submitPost = async function () {
        if ($scope.isLoading || $scope.isSubmitted) return;
    
        $scope.isLoading = true;
        $scope.isSubmitted = true;
    
        try {
            // Cập nhật thông tin bài đăng
            const postData = {
                parkingName: $scope.post.parkingName,
                description: $scope.post.description,
                street: $scope.post.street,
                wardName: $scope.selectedWard ? $scope.selectedWard.Name : null,
                districtName: $scope.selectedDistrict ? $scope.selectedDistrict.Name : null,
                provinceName: $scope.selectedProvince ? $scope.selectedProvince.Name : null,
                price: $scope.post.price,
                priceUnit: $scope.post.priceUnit,
                capacity: $scope.post.capacity,
                latitude: $scope.post.latitude,
                longitude: $scope.post.longitude,
                amenities: $scope.tags.map(tag => ({ amenitiesName: tag })),
                vehicleTypes: $scope.vehicleTags.map(tag => ({ vehicleTypesName: tag }))
            };
    
            const url = `http://localhost:8080/api/updatePosts/${postId}`;
            await $http.put(url, postData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
    
            // Kiểm tra và upload ảnh nếu cần
            if ($scope.newImages.length > 0 || $scope.deletedImages.length > 0) {
                const uploadedImages = await $scope.uploadImages(postId);
                console.log('Ảnh đã upload:', uploadedImages);
            }
    
            // Xử lý kết quả thành công
            alert('Bài đăng đã được cập nhật thành công!');
            $location.path(`/post-detail?postId=${postId}`);
        } catch (error) {
            console.error('Lỗi khi cập nhật bài đăng:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            $scope.isLoading = false;
            $scope.isSubmitted = false;
            $scope.$apply();
        }
    };
    
    $scope.loadPostData();
});
let map;
let marker;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), { center: { lat: 10.8231, lng: 106.6297 }, zoom: 13 });
    map.addListener("click", (e) => placeMarker(e.latLng));
}

function placeMarker(location) {
    if (marker) marker.setMap(null);
    marker = new google.maps.Marker({ position: location, map: map });

    const scope = angular.element(document.getElementById('map')).scope();

    // Cập nhật tọa độ vào scope
    if (!scope.$$phase) {
        scope.$apply(() => {
            scope.post.latitude = location.lat();
            scope.post.longitude = location.lng();
        });
    } else {
        scope.post.latitude = location.lat();
        scope.post.longitude = location.lng();
    }

    alert("Đã lưu tọa độ: " + location.lat() + ", " + location.lng());
}
