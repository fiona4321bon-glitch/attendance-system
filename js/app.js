let classes = [];

let currentAttendance = [];

const statuses = [
    "到校",
    "遲到",
    "病假",
    "事假",
    "公假",
    "曠課",
    "早退"
];


/* =====================================
   系統啟動
===================================== */

async function startApp() {

    setToday();

    await loadClasses();

}


/* =====================================
   設定今天日期
===================================== */

function setToday() {

    const now = new Date();

    const year = now.getFullYear();

    const month =
        String(now.getMonth() + 1)
        .padStart(2, "0");

    const day =
        String(now.getDate())
        .padStart(2, "0");

    const today =
        `${year}-${month}-${day}`;

    document
        .getElementById("attendanceDate")
        .value = today;

}


/* =====================================
   切換頁面
===================================== */

function showPage(pageID) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.style.display =
                "none";

        });


    document
        .getElementById(pageID)
        .style.display =
        "block";


    if (pageID === "classPage") {

        loadClasses();

    }


    if (pageID === "studentPage") {

        loadStudents();

    }


    if (pageID === "attendancePage") {

        loadAttendanceStudents();

    }

}


/* =====================================
   新增班級
===================================== */

async function addClass() {

    const schoolYear =
        document
            .getElementById("schoolYear")
            .value
            .trim();


    const className =
        document
            .getElementById("className")
            .value
            .trim();


    if (!schoolYear || !className) {

        alert("請輸入學年度與班級");

        return;

    }


    const { error } =
        await supabaseClient
            .from("classes")
            .insert({

                school_year:
                    schoolYear,

                class_name:
                    className

            });


    if (error) {

        alert(
            "新增班級失敗：" +
            error.message
        );

        return;

    }


    document
        .getElementById("className")
        .value = "";


    alert("班級新增成功");


    await loadClasses();

}


/* =====================================
   載入班級
===================================== */

async function loadClasses() {

    const { data, error } =
        await supabaseClient
            .from("classes")
            .select("*")
            .order("school_year")
            .order("class_name");


    if (error) {

        console.error(error);

        return;

    }


    classes = data || [];


    renderClassList();

    renderClassSelects();

}


/* =====================================
   顯示班級清單
===================================== */

function renderClassList() {

    const container =
        document
            .getElementById("classList");


    if (!container) {

        return;

    }


    if (classes.length === 0) {

        container.innerHTML =
            "<p>目前尚未建立班級。</p>";

        return;

    }


    container.innerHTML =
        classes.map(item => `

            <div class="student-row">

                ${item.school_year}
                學年度

                <strong>
                    ${item.class_name}
                </strong>

            </div>

        `).join("");

}


/* =====================================
   班級下拉選單
===================================== */

function renderClassSelects() {

    const html =
        classes.map(item => `

            <option value="${item.id}">

                ${item.school_year}
                學年度
                ${item.class_name}

            </option>

        `).join("");


    const studentClass =
        document
            .getElementById("studentClass");


    const attendanceClass =
        document
            .getElementById("attendanceClass");


    if (studentClass) {

        studentClass.innerHTML = html;

    }


    if (attendanceClass) {

        attendanceClass.innerHTML = html;

    }


    if (classes.length > 0) {

        loadStudents();

        loadAttendanceStudents();

    }

}


/* =====================================
   新增學生
===================================== */

async function addStudent() {

    const classID =
        document
            .getElementById("studentClass")
            .value;


    const seatNo =
        document
            .getElementById("seatNo")
            .value;


    const studentName =
        document
            .getElementById("studentName")
            .value
            .trim();


    if (!classID || !seatNo || !studentName) {

        alert("請輸入座號與姓名");

        return;

    }


    const { error } =
        await supabaseClient
            .from("students")
            .insert({

                class_id:
                    classID,

                seat_no:
                    Number(seatNo),

                name:
                    studentName

            });


    if (error) {

        alert(
            "新增學生失敗：" +
            error.message
        );

        return;

    }


    document
        .getElementById("seatNo")
        .value = "";


    document
        .getElementById("studentName")
        .value = "";


    alert("學生新增成功");


    await loadStudents();

}


/* =====================================
   載入學生
===================================== */

async function loadStudents() {

    const selector =
        document
            .getElementById("studentClass");


    if (!selector) {

        return;

    }


    const classID =
        selector.value;


    if (!classID) {

        const container =
            document
                .getElementById("studentList");

        if (container) {

            container.innerHTML =
                "<p>請先建立班級。</p>";

        }

        return;

    }


    const { data, error } =
        await supabaseClient
            .from("students")
            .select("*")
            .eq(
                "class_id",
                classID
            )
            .eq(
                "active",
                true
            )
            .order(
                "seat_no"
            );


    if (error) {

        console.error(error);

        return;

    }


    document
        .getElementById("studentList")
        .innerHTML =

        data.length === 0

        ?

        "<p>目前尚未建立學生。</p>"

        :

        data.map(student => `

            <div class="student-row">

                ${student.seat_no}
                號

                <strong>
                    ${student.name}
                </strong>

            </div>

        `).join("");

}


/* =====================================
   載入點名學生
===================================== */

async function loadAttendanceStudents() {

    const selector =
        document
            .getElementById("attendanceClass");


    if (!selector) {

        return;

    }


    const classID =
        selector.value;


    if (!classID) {

        currentAttendance = [];

        renderAttendance();

        return;

    }


    const { data, error } =
        await supabaseClient
            .from("students")
            .select("*")
            .eq(
                "class_id",
                classID
            )
            .eq(
                "active",
                true
            )
            .order(
                "seat_no"
            );


    if (error) {

        alert(
            "讀取學生失敗：" +
            error.message
        );

        return;

    }


    currentAttendance =
        data.map(student => ({

            student_id:
                student.id,

            seat_no:
                student.seat_no,

            name:
                student.name,

            status:
                "到校"

        }));


    renderAttendance();

}


/* =====================================
   顯示點名學生
===================================== */

function renderAttendance() {

    const container =
        document
            .getElementById("attendanceList");


    if (!container) {

        return;

    }


    if (currentAttendance.length === 0) {

        container.innerHTML =
            "<p>目前沒有可點名的學生。</p>";

        renderSummary();

        return;

    }


    container.innerHTML =

        currentAttendance.map(

            (student, index) => `

            <div class="student-row">

                <div class="student-title">

                    ${student.seat_no}
                    號

                    ${student.name}

                </div>


                <div class="status-buttons">

                    ${statuses.map(
                        status => `

                        <button

                            class="
                                status-button
                                ${
                                    student.status === status
                                    ? "active"
                                    : ""
                                }
                            "

                            onclick="
                                changeStatus(
                                    ${index},
                                    '${status}'
                                )
                            "

                        >

                            ${status}

                        </button>

                    `).join("")}

                </div>

            </div>

        `).join("");


    renderSummary();

}


/* =====================================
   修改出缺勤狀態
===================================== */

function changeStatus(index, status) {

    currentAttendance[index]
        .status = status;


    renderAttendance();

}


/* =====================================
   今日統計
===================================== */

function renderSummary() {

    const result = {};


    statuses.forEach(status => {

        result[status] = 0;

    });


    currentAttendance
        .forEach(student => {

            result[student.status]++;

        });


    const summary =
        document
            .getElementById(
                "attendanceSummary"
            );


    if (!summary) {

        return;

    }


    summary.innerHTML =

        statuses.map(status => `

            <span
                style="
                    display:inline-block;
                    margin-right:15px;
                    margin-bottom:10px;
                "
            >

                ${status}：

                <strong>
                    ${result[status]}
                </strong>

            </span>

        `).join("");

}


/* =====================================
   儲存出缺勤
===================================== */

async function saveAttendance() {

    const date =
        document
            .getElementById("attendanceDate")
            .value;


    if (!date) {

        alert("請選擇日期");

        return;

    }


    if (currentAttendance.length === 0) {

        alert("目前沒有學生可以儲存");

        return;

    }


    const rows =
        currentAttendance.map(
            student => ({

                student_id:
                    student.student_id,

                attendance_date:
                    date,

                status:
                    student.status

            })
        );


    const { error } =
        await supabaseClient
            .from("attendance")
            .upsert(
                rows,
                {
                    onConflict:
                        "student_id,attendance_date"
                }
            );


    if (error) {

        alert(
            "儲存失敗：" +
            error.message
        );

        return;

    }


    alert("出缺勤已儲存");

}
