
$(document).ready(function () {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
      console.error('JWT token is missing');
      window.location.href = '#login';
  }

  function fetchStudentCourses() {
      $.ajax({
        url: 'rest/routes/Course/get_courses.php',
        dataType: 'json',
        success: function (data) {
          const studentCourseList = $('#studentCourseList');
          studentCourseList.empty(); 
          $.each(data, function (index, course) {
            const card = `
            <div class="col-md-4 mb-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">${course.title}</h5>
                  <p class="card-text">${course.description}</p>
                  <a href="#coursedetails" class="btn btn-primary" data-course-id="${course.course_id}">View Course</a>
                </div>
              </div>
            </div>`;
            studentCourseList.append(card);
          });
          $('#studentDashboard').show(); 
        },
        error: function (xhr, status, error) {
          console.error('Error fetching student courses:', error);
        }
      });
    }

    function fetchProfessorCourses() {
      $.ajax({
        url: 'rest/routes/Course/get_instructor_courses.php',
        dataType: 'json',
        headers: {'TOKEN' : token},
        success: function (data) {
          const courseList = $('#courseList');
          courseList.empty(); 
          $.each(data, function (index, course) {
            const card = `
            <div class="col-md-4 mb-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">${course.name}</h5>
                  <p class="card-text">${course.description}</p>
                  <div class="text-end">
                    <button class="btn btn-primary btn-sm me-2 editCourse">Edit</button>
                    <button class="btn btn-danger btn-sm deleteCourse">Delete</button>
                  </div>
                </div>
              </div>
            </div>`;
            courseList.append(card);
          });
          $('#professorDashboard').show(); 
        },
        error: function (xhr, status, error) {
          console.error('Error fetching professor courses:', error);
        }
      });
    }

    function fetchUserRole() {
      $.ajax({
        url: 'rest/routes/User/get_user.php',
        dataType: 'json',
        headers: {'TOKEN' : token},
        success: function (data) {
          const user_id = data.user_id;
          if (data.role === 'instructor') {
            fetchProfessorCourses(); 
          } else {
            fetchStudentCourses(); 
          }
        },
        error: function (xhr, status, error) {
          console.error('Error fetching user role:', error);
        }
      });
    }

    fetchUserRole();

    

    $('#addCourseButton').click(function () {
      $('#createCourseForm').show(); 
    });

    $('#createCourseForm').on('submit', () => {
      const courseTitle = $('#courseTitle').val();
      const courseDescription = $('#courseDescription').val();
      const courseMaterial = $('#courseMaterial').val();
      const enrollmentOptions = $('#enrollmentOptions').val();
      const category = $('#category').val();

      $.ajax({
        url: 'rest/routes/User/get_user.php',
        dataType: 'json',
        headers: {'TOKEN' : token},
        success: function (data) {
          const user_id = data.user_id;
          $.ajax({
            url: 'rest/routes/Instructor/get_instructor_by_user_id.php',
            data: {user_id: user_id},
            method: 'POST',
            success: function(instructor){
              var instructor_json = JSON.parse(instructor);
              const instructor_id = instructor_json[0].instructor_id;
              $.ajax({
                url:'rest/routes/Course/add_course.php',
                method: 'POST',
                data: {course_title: courseTitle, course_description: courseDescription, course_material: courseMaterial, enrollment_options: enrollmentOptions, category: category, instructor_id : instructor_id},
                success: function(){
                  alert('Successfully added course');
                }
              })
            }
          })
        },
        error: function (xhr, status, error) {
          console.error('Error fetching user: ', error);
        }
      });
      
    });

    $('#closeCreateCourseFormButton').click(function () {
      $('#createCourseForm').hide(); 
    });

    $('#courseList').on('click', '.editCourse', function () {
      $('#editCourseForm').show(); 
    });

    $('#closeEditCourseFormButton').click(function () {
      $('#editCourseForm').hide(); 
    });

    $('#courseList').on('click', '.deleteCourse', function () {
      const card = $(this).closest('.col-md-4');
      card.remove(); 
    });

    // fetchStudentCourses();
  });