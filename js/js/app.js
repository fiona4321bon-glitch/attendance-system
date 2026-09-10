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



async function startApp() {

    setToday();

    await loadClasses();

}



function setToday() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document
        .getElementById("attendanceDate")
        .value =
        today;

}



/* =========================
   顯示頁面
========================= */

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


    if (
        pageID ===
        "classPage"
    ) {

        loadClasses();

    }


    if (
        pageID ===
        "studentPage"
    ) {

        loadStudents();

    }

}



/* =========================
   班級
========================= */

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


    if (
        !schoolYear ||
        !className
    ) {

        alert(
            "請輸入學年度與班級"
        );

        return;

    }


    const { data, error } =
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
            error.message
        );

        return;

    }


    document
        .getElementById("className")
        .value =
        "";


    await loadClasses();

}



async function loadClasses() {

    const { data, error } =
        await supabaseClient
            .from("classes")
            .select("*")
            .order(
                "class_name"
            );


    if (error) {

        console.error(error);

        return;

    }


    classes =
        data || [];


    renderClassList();

    renderClassSelects();

}



function renderClassList() {

    const container =
        document
            .getElementById(
                "classList"
            );


    container.innerHTML =
        classes.map(
            item => `

            <div class="student-row">

                ${item.school_year}
                學年度

                <strong>
                    ${item.class_name}
                </strong>

            </div>

        `
        ).join("");

}



function renderClassSelects() {

    const html =
        classes.map(
            item => `

            <option
                value="${item.id}">

                ${item.school_year}
                學年度
                ${item.class_name}

            </option>

        `
        ).join("");


    document
        .getElementById(
            "studentClass"
        )
        .innerHTML =
        html;


    document
        .getElementById(
            "attendanceClass"
        )
        .innerHTML =
        html;


    if (
        classes.length > 0
    ) {

        loadStudents();

        loadAttendanceStudents();

    }

}



/* =========================
   學生
========================= */

async function addStudent() {

    const classID =
        document
            .getElementById(
                "studentClass"
            )
            .value;


    const seatNo =
        document
            .getElementById(
                "seatNo"
            )
            .value;


    const studentName =
        document
            .getElementById(
                "studentName"
            )
            .value
            .trim();


    if (
        !classID ||
        !seatNo ||
        !studentName
    ) {

        alert(
            "請輸入座號與姓名"
        );

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
            error.message
        );

        return;

    }


    document
        .getElementById(
            "seatNo"
        )
        .value =
        "";


    document
        .getElementById(
            "studentName"
        )
        .value =
        "";


    await loadStudents();

}



async function loadStudents() {

    const classID =
        document
            .getElementById(
                "studentClass"
            )
            .value;


    if (!classID) {

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

        console.error(
            error
        );

        return;

    }


    document
        .getElementById(
            "studentList"
        )
        .innerHTML =

        data.map(
            student => `

            <div
                class="student-row">

                ${student.seat_no}
                號

                <strong>

                    ${student.name}

                </strong>

            </div>

        `
        ).join("");

}



/* =========================
   點名
========================= */

async function loadAttendanceStudents() {

    const classID =
        document
            .getElementById(
                "attendanceClass"
            )
            .value;


    if (!classID) {

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
            error.message
        );

        return;

    }


    currentAttendance =
        data.map(
            student => ({

                student_id:
                    student.id,

                seat_no:
                    student.seat_no,

                name:
                    student.name,

                status:
                    "到校"

            })
        );


    renderAttendance();

}



function renderAttendance() {

    const container =
        document
            .getElementById(
                "attendanceList"
            );


    container.innerHTML =

        currentAttendance.map(

            (student, index) => `

            <div
                class="student-row">

                <div
                    class="student-title">

                    ${student.seat_no}
                    號

                    ${student.name}

                </div>


                <div
                    class="status-buttons">

                    ${statuses.map(
                        status => `

                        <button

                            class="
                                status-button
                                ${
                                student.status ===
                                status
                                    ?
                                "active"
                                    :
                                ""
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

                    `
                    ).join("")}

                </div>

            </div>

        `

        ).join("");


    renderSummary();

}



function changeStatus(
    index,
    status
) {

    currentAttendance[index]
        .status =
        status;


    renderAttendance();

}



function renderSummary() {

    const result = {};


    statuses.forEach(
        status => {

            result[status] =
                0;

        }
    );


    currentAttendance
        .forEach(
            student => {

                result[
                    student.status
                ]++;

            }
        );


    document
        .getElementById(
            "attendanceSummary"
        )
        .innerHTML =

        statuses.map(
            status => `

                <span
                    style="
                        margin-right:15px;
                    "
                >

                    ${status}：

                    <strong>

                        ${result[status]}

                    </strong>

                </span>

            `

        ).join("");

}



/* =========================
   儲存出缺勤
========================= */

async function saveAttendance() {

    const date =
        document
            .getElementById(
                "attendanceDate"
            )
            .value;


    if (!date) {

        alert(
            "請選擇日期"
        );

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


    const {
        data,
        error
    } =

        await supabaseClient
            .from(
                "attendance"
            )
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


    alert(
        "出缺勤已儲存"
    );

}
