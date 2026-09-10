/* =========================================================
   學生出缺勤管理系統
   app.js
========================================================= */


/* =========================================================
   全域資料
========================================================= */

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


/* =========================================================
   系統啟動
========================================================= */

async function startApp() {

    setToday();

    setupEvents();

    await loadClasses();

}


/* =========================================================
   系統事件
========================================================= */

function setupEvents() {

    const dateInput =
        document.getElementById(
            "attendanceDate"
        );


    if (dateInput) {

        dateInput.addEventListener(
            "change",
            async function () {

                await loadAttendanceStudents();

            }
        );

    }

}


/* =========================================================
   設定今天日期
========================================================= */

function setToday() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    const today =
        `${year}-${month}-${day}`;


    const input =
        document.getElementById(
            "attendanceDate"
        );


    if (input) {

        input.value =
            today;

    }

}


/* =========================================================
   切換頁面
========================================================= */

function showPage(pageID) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            page => {

                page.style.display =
                    "none";

            }
        );


    const target =
        document.getElementById(
            pageID
        );


    if (target) {

        target.style.display =
            "block";

    }


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


    if (
        pageID ===
        "attendancePage"
    ) {

        loadAttendanceStudents();

    }

}


/* =========================================================
   班級管理
========================================================= */


/* -------------------------
   新增班級
------------------------- */

async function addClass() {

    const schoolYearInput =
        document.getElementById(
            "schoolYear"
        );


    const classNameInput =
        document.getElementById(
            "className"
        );


    const schoolYear =
        schoolYearInput
            ? schoolYearInput.value.trim()
            : "";


    const className =
        classNameInput
            ? classNameInput.value.trim()
            : "";


    if (
        !schoolYear ||
        !className
    ) {

        alert(
            "請輸入學年度與班級"
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from(
                "classes"
            )
            .insert({

                school_year:
                    schoolYear,

                class_name:
                    className

            });


    if (error) {

        if (
            error.code ===
            "23505"
        ) {

            alert(
                "這個班級已經建立過了"
            );

        }

        else {

            alert(
                "新增班級失敗：\n" +
                error.message
            );

        }


        return;

    }


    if (classNameInput) {

        classNameInput.value =
            "";

    }


    alert(
        "班級新增成功"
    );


    await loadClasses();

}


/* -------------------------
   讀取班級
------------------------- */

async function loadClasses() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "classes"
            )
            .select(
                "*"
            )
            .order(
                "school_year",
                {
                    ascending:
                        false
                }
            )
            .order(
                "class_name",
                {
                    ascending:
                        true
                }
            );


    if (error) {

        console.error(
            "讀取班級錯誤：",
            error
        );


        return;

    }


    classes =
        data || [];


    renderClassList();

    renderClassSelects();

}


/* -------------------------
   顯示班級清單
------------------------- */

function renderClassList() {

    const container =
        document.getElementById(
            "classList"
        );


    if (!container) {

        return;

    }


    if (
        classes.length ===
        0
    ) {

        container.innerHTML =
            "<p>目前尚未建立班級。</p>";

        return;

    }


    container.innerHTML =
        classes
            .map(
                item => `

                    <div class="student-row">

                        <strong>
                            ${escapeHtml(
                                item.school_year
                            )}
                            學年度
                            ${escapeHtml(
                                item.class_name
                            )}
                        </strong>

                    </div>

                `
            )
            .join("");

}


/* -------------------------
   顯示班級下拉選單
------------------------- */

function renderClassSelects() {

    const studentClass =
        document.getElementById(
            "studentClass"
        );


    const attendanceClass =
        document.getElementById(
            "attendanceClass"
        );


    const oldStudentValue =
        studentClass
            ? studentClass.value
            : "";


    const oldAttendanceValue =
        attendanceClass
            ? attendanceClass.value
            : "";


    let html =
        `<option value="">
            請選擇班級
        </option>`;


    html +=
        classes
            .map(
                item => `

                    <option
                        value="${item.id}"
                    >

                        ${escapeHtml(
                            item.school_year
                        )}
                        學年度
                        ${escapeHtml(
                            item.class_name
                        )}

                    </option>

                `
            )
            .join("");


    if (studentClass) {

        studentClass.innerHTML =
            html;


        if (
            classes.some(
                item =>
                    item.id ===
                    oldStudentValue
            )
        ) {

            studentClass.value =
                oldStudentValue;

        }

        else if (
            classes.length >
            0
        ) {

            studentClass.value =
                classes[0].id;

        }

    }


    if (attendanceClass) {

        attendanceClass.innerHTML =
            html;


        if (
            classes.some(
                item =>
                    item.id ===
                    oldAttendanceValue
            )
        ) {

            attendanceClass.value =
                oldAttendanceValue;

        }

        else if (
            classes.length >
            0
        ) {

            attendanceClass.value =
                classes[0].id;

        }

    }


    if (
        classes.length >
        0
    ) {

        loadStudents();

        loadAttendanceStudents();

    }

}


/* =========================================================
   學生管理
========================================================= */


/* -------------------------
   新增單一學生
------------------------- */

async function addStudent() {

    const classSelector =
        document.getElementById(
            "studentClass"
        );


    const seatInput =
        document.getElementById(
            "seatNo"
        );


    const nameInput =
        document.getElementById(
            "studentName"
        );


    const classID =
        classSelector
            ? classSelector.value
            : "";


    const seatNo =
        seatInput
            ? Number(
                seatInput.value
            )
            : 0;


    const studentName =
        nameInput
            ? nameInput.value.trim()
            : "";


    if (!classID) {

        alert(
            "請先選擇班級"
        );

        return;

    }


    if (
        !seatNo ||
        !studentName
    ) {

        alert(
            "請輸入座號與學生姓名"
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from(
                "students"
            )
            .upsert(
                {

                    class_id:
                        classID,

                    seat_no:
                        seatNo,

                    name:
                        studentName,

                    active:
                        true

                },
                {

                    onConflict:
                        "class_id,seat_no"

                }
            );


    if (error) {

        alert(
            "新增學生失敗：\n" +
            error.message
        );

        return;

    }


    if (seatInput) {

        seatInput.value =
            "";

    }


    if (nameInput) {

        nameInput.value =
            "";

    }


    alert(
        "學生新增成功"
    );


    await loadStudents();

    await loadAttendanceStudents();

}


/* -------------------------
   批次匯入學生
------------------------- */

async function batchImportStudents() {

    const classSelector =
        document.getElementById(
            "studentClass"
        );


    const batchInput =
        document.getElementById(
            "batchStudentData"
        );


    const classID =
        classSelector
            ? classSelector.value
            : "";


    const rawData =
        batchInput
            ? batchInput.value.trim()
            : "";


    if (!classID) {

        alert(
            "請先選擇班級"
        );

        return;

    }


    if (!rawData) {

        alert(
            "請先貼上學生資料"
        );

        return;

    }


    const lines =
        rawData
            .split(
                /\r?\n/
            )
            .map(
                line =>
                    line.trim()
            )
            .filter(
                line =>
                    line !== ""
            );


    const students =
        [];


    const errors =
        [];


    const duplicateSeats =
        new Set();


    const seenSeats =
        new Set();


    lines.forEach(
        (
            line,
            index
        ) => {

            /*
             * 跳過標題列
             */

            if (
                line.includes(
                    "座號"
                ) &&
                line.includes(
                    "姓名"
                )
            ) {

                return;

            }


            let parts;


            /*
             * Google Sheets 複製通常是 Tab
             */

            if (
                line.includes(
                    "\t"
                )
            ) {

                parts =
                    line.split(
                        "\t"
                    );

            }

            /*
             * CSV
             */

            else if (
                line.includes(
                    ","
                )
            ) {

                parts =
                    line.split(
                        ","
                    );

            }

            /*
             * 中文逗號
             */

            else if (
                line.includes(
                    "，"
                )
            ) {

                parts =
                    line.split(
                        "，"
                    );

            }

            /*
             * 一般空白
             */

            else {

                parts =
                    line.split(
                        /\s+/
                    );

            }


            parts =
                parts.map(
                    value =>
                        value.trim()
                );


            const seatNo =
                Number(
                    parts[0]
                );


            const name =
                parts
                    .slice(1)
                    .join(" ")
                    .trim();


            if (
                !Number.isInteger(
                    seatNo
                ) ||
                seatNo <= 0 ||
                !name
            ) {

                errors.push(
                    `第 ${
                        index + 1
                    } 行：${line}`
                );

                return;

            }


            if (
                seenSeats.has(
                    seatNo
                )
            ) {

                duplicateSeats.add(
                    seatNo
                );

            }


            seenSeats.add(
                seatNo
            );


            students.push({

                class_id:
                    classID,

                seat_no:
                    seatNo,

                name:
                    name,

                active:
                    true

            });

        }
    );


    if (
        duplicateSeats.size >
        0
    ) {

        alert(
            "匯入資料中有重複座號：\n" +
            Array
                .from(
                    duplicateSeats
                )
                .join(
                    "、"
                ) +
            "\n\n請先修改後再匯入。"
        );

        return;

    }


    if (
        students.length ===
        0
    ) {

        alert(
            "沒有找到可以匯入的學生資料"
        );

        return;

    }


    if (
        errors.length >
        0
    ) {

        const message =
            "以下資料格式無法辨識：\n\n" +
            errors.join(
                "\n"
            ) +
            "\n\n是否仍要匯入其他正確資料？";


        const continueImport =
            confirm(
                message
            );


        if (
            !continueImport
        ) {

            return;

        }

    }


    const classData =
        classes.find(
            item =>
                item.id ===
                classID
        );


    const classText =
        classData
            ?
            `${classData.school_year}學年度 ${classData.class_name}`
            :
            "目前班級";


    const confirmed =
        confirm(

            `即將匯入 ${students.length} 位學生\n\n` +

            `班級：${classText}\n\n` +

            "若相同班級已有相同座號，將更新原本的學生姓名。\n\n" +

            "確定匯入嗎？"

        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from(
                "students"
            )
            .upsert(
                students,
                {

                    onConflict:
                        "class_id,seat_no"

                }
            );


    if (error) {

        alert(
            "批次匯入失敗：\n" +
            error.message
        );

        console.error(
            error
        );

        return;

    }


    alert(
        `成功匯入 ${students.length} 位學生`
    );


    if (batchInput) {

        batchInput.value =
            "";

    }


    await loadStudents();

    await loadAttendanceStudents();

}


/* -------------------------
   讀取學生
------------------------- */

async function loadStudents() {

    const classSelector =
        document.getElementById(
            "studentClass"
        );


    const container =
        document.getElementById(
            "studentList"
        );


    if (
        !classSelector ||
        !container
    ) {

        return;

    }


    const classID =
        classSelector.value;


    if (!classID) {

        container.innerHTML =
            "<p>請先選擇班級。</p>";

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "students"
            )
            .select(
                "*"
            )
            .eq(
                "class_id",
                classID
            )
            .eq(
                "active",
                true
            )
            .order(
                "seat_no",
                {
                    ascending:
                        true
                }
            );


    if (error) {

        console.error(
            "讀取學生錯誤：",
            error
        );


        container.innerHTML =
            "<p>讀取學生資料失敗。</p>";

        return;

    }


    if (
        !data ||
        data.length ===
        0
    ) {

        container.innerHTML =
            "<p>目前尚未建立學生。</p>";

        return;

    }


    container.innerHTML =
        data
            .map(
                student => `

                    <div
                        class="student-row"
                    >

                        <strong>
                            ${student.seat_no}
                            號
                        </strong>

                        &nbsp;&nbsp;

                        ${escapeHtml(
                            student.name
                        )}

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   點名管理
========================================================= */


/* -------------------------
   讀取點名名單
------------------------- */

async function loadAttendanceStudents() {

    const classSelector =
        document.getElementById(
            "attendanceClass"
        );


    const dateInput =
        document.getElementById(
            "attendanceDate"
        );


    const classID =
        classSelector
            ? classSelector.value
            : "";


    const date =
        dateInput
            ? dateInput.value
            : "";


    if (!classID) {

        currentAttendance =
            [];

        renderAttendance();

        return;

    }


    /*
     * 先抓學生
     */

    const {
        data:
            students,
        error:
            studentError
    } =
        await supabaseClient
            .from(
                "students"
            )
            .select(
                "*"
            )
            .eq(
                "class_id",
                classID
            )
            .eq(
                "active",
                true
            )
            .order(
                "seat_no",
                {
                    ascending:
                        true
                }
            );


    if (studentError) {

        alert(
            "讀取學生失敗：\n" +
            studentError.message
        );

        return;

    }


    /*
     * 先預設全部到校
     */

    currentAttendance =
        (students || [])
            .map(
                student => ({

                    student_id:
                        student.id,

                    seat_no:
                        student.seat_no,

                    name:
                        student.name,

                    status:
                        "到校",

                    arrival_time:
                        "",

                    leave_time:
                        "",

                    note:
                        ""

                })
            );


    /*
     * 如果有日期，
     * 再抓已經儲存過的點名紀錄
     */

    if (
        date &&
        currentAttendance.length >
        0
    ) {

        const studentIDs =
            currentAttendance
                .map(
                    student =>
                        student.student_id
                );


        const {
            data:
                attendanceData,
            error:
                attendanceError
        } =
            await supabaseClient
                .from(
                    "attendance"
                )
                .select(
                    "*"
                )
                .eq(
                    "attendance_date",
                    date
                )
                .in(
                    "student_id",
                    studentIDs
                );


        if (
            attendanceError
        ) {

            console.error(
                "讀取出缺勤紀錄錯誤：",
                attendanceError
            );

        }

        else {

            const recordMap =
                {};


            (
                attendanceData ||
                []
            )
                .forEach(
                    record => {

                        recordMap[
                            record.student_id
                        ] =
                            record;

                    }
                );


            currentAttendance =
                currentAttendance
                    .map(
                        student => {

                            const record =
                                recordMap[
                                    student.student_id
                                ];


                            if (!record) {

                                return student;

                            }


                            return {

                                ...student,

                                status:
                                    record.status ||
                                    "到校",

                                arrival_time:
                                    record.arrival_time ||
                                    "",

                                leave_time:
                                    record.leave_time ||
                                    "",

                                note:
                                    record.note ||
                                    ""

                            };

                        }
                    );

        }

    }


    renderAttendance();

}


/* -------------------------
   顯示點名名單
------------------------- */

function renderAttendance() {

    const container =
        document.getElementById(
            "attendanceList"
        );


    if (!container) {

        return;

    }


    if (
        currentAttendance.length ===
        0
    ) {

        container.innerHTML =
            "<p>目前沒有可點名的學生。</p>";

        renderSummary();

        return;

    }


    container.innerHTML =
        currentAttendance
            .map(
                (
                    student,
                    index
                ) => `

                <div
                    class="student-row"
                >

                    <div
                        class="student-title"
                    >

                        ${student.seat_no}
                        號

                        ${escapeHtml(
                            student.name
                        )}

                    </div>


                    <div
                        class="status-buttons"
                    >

                        ${statuses
                            .map(
                                status => `

                                    <button

                                        type="button"

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
                            )
                            .join("")
                        }

                    </div>


                    <div
                        style="
                            display:flex;
                            gap:8px;
                            flex-wrap:wrap;
                            margin-top:10px;
                        "
                    >

                        <input
                            type="time"
                            value="${
                                student.arrival_time ||
                                ""
                            }"
                            onchange="
                                updateAttendanceField(
                                    ${index},
                                    'arrival_time',
                                    this.value
                                )
                            "
                        >


                        <input
                            type="time"
                            value="${
                                student.leave_time ||
                                ""
                            }"
                            onchange="
                                updateAttendanceField(
                                    ${index},
                                    'leave_time',
                                    this.value
                                )
                            "
                        >


                        <input
                            type="text"
                            placeholder="備註"
                            value="${
                                escapeAttribute(
                                    student.note ||
                                    ""
                                )
                            }"
                            onchange="
                                updateAttendanceField(
                                    ${index},
                                    'note',
                                    this.value
                                )
                            "
                        >

                    </div>

                </div>

                `
            )
            .join("");


    renderSummary();

}


/* -------------------------
   修改點名狀態
------------------------- */

function changeStatus(
    index,
    status
) {

    if (
        !currentAttendance[
            index
        ]
    ) {

        return;

    }


    currentAttendance[
        index
    ].status =
        status;


    /*
     * 遲到時自動帶目前時間
     */

    if (
        status ===
        "遲到"
    ) {

        if (
            !currentAttendance[
                index
            ].arrival_time
        ) {

            currentAttendance[
                index
            ].arrival_time =
                getCurrentTime();

        }

    }


    /*
     * 早退時自動帶目前時間
     */

    if (
        status ===
        "早退"
    ) {

        if (
            !currentAttendance[
                index
            ].leave_time
        ) {

            currentAttendance[
                index
            ].leave_time =
                getCurrentTime();

        }

    }


    renderAttendance();

}


/* -------------------------
   修改點名其他欄位
------------------------- */

function updateAttendanceField(
    index,
    field,
    value
) {

    if (
        !currentAttendance[
            index
        ]
    ) {

        return;

    }


    currentAttendance[
        index
    ][field] =
        value;

}


/* -------------------------
   顯示今日統計
------------------------- */

function renderSummary() {

    const summary =
        document.getElementById(
            "attendanceSummary"
        );


    if (!summary) {

        return;

    }


    const result =
        {};


    statuses.forEach(
        status => {

            result[
                status
            ] = 0;

        }
    );


    currentAttendance.forEach(
        student => {

            if (
                result[
                    student.status
                ] !==
                undefined
            ) {

                result[
                    student.status
                ]++;

            }

        }
    );


    summary.innerHTML =
        statuses
            .map(
                status => `

                    <span
                        style="
                            display:inline-block;
                            margin-right:15px;
                            margin-bottom:10px;
                        "
                    >

                        ${status}：

                        <strong>
                            ${
                                result[
                                    status
                                ]
                            }
                        </strong>

                    </span>

                `
            )
            .join("");

}


/* -------------------------
   儲存出缺勤
------------------------- */

async function saveAttendance() {

    const dateInput =
        document.getElementById(
            "attendanceDate"
        );


    const date =
        dateInput
            ? dateInput.value
            : "";


    if (!date) {

        alert(
            "請選擇日期"
        );

        return;

    }


    if (
        currentAttendance.length ===
        0
    ) {

        alert(
            "目前沒有學生可以儲存"
        );

        return;

    }


    const rows =
        currentAttendance
            .map(
                student => ({

                    student_id:
                        student.student_id,

                    attendance_date:
                        date,

                    status:
                        student.status,

                    arrival_time:
                        student.arrival_time ||
                        null,

                    leave_time:
                        student.leave_time ||
                        null,

                    note:
                        student.note ||
                        null,

                    updated_at:
                        new Date()
                            .toISOString()

                })
            );


    const {
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
            "儲存失敗：\n" +
            error.message
        );


        console.error(
            error
        );


        return;

    }


    alert(
        "出缺勤已儲存"
    );


    /*
     * 儲存後重新讀一次
     */

    await loadAttendanceStudents();

}


/* =========================================================
   工具函式
========================================================= */


/* -------------------------
   目前時間
------------------------- */

function getCurrentTime() {

    const now =
        new Date();


    const hour =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minute =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return (
        `${hour}:${minute}`
    );

}


/* -------------------------
   HTML 安全處理
------------------------- */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* -------------------------
   HTML attribute 安全處理
------------------------- */

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}
