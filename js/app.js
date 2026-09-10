/* =========================================================
   學生出缺勤管理系統
   app.js
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
   基本事件
========================================================= */

function setupEvents() {

    const attendanceDate =
        document.getElementById(
            "attendanceDate"
        );


    if (attendanceDate) {

        attendanceDate.addEventListener(
            "change",
            async () => {

                await loadAttendanceStudents();

            }
        );

    }

}



/* =========================================================
   今天日期
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


    const attendanceDate =
        document.getElementById(
            "attendanceDate"
        );


    const recordDate =
        document.getElementById(
            "recordDate"
        );


    if (attendanceDate) {

        attendanceDate.value =
            today;

    }


    if (recordDate) {

        recordDate.value =
            today;

    }

}



/* =========================================================
   切換頁面
========================================================= */

async function showPage(
    pageID
) {

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

        await loadClasses();

    }


    if (
        pageID ===
        "studentPage"
    ) {

        await loadStudents();

    }


    if (
        pageID ===
        "attendancePage"
    ) {

        await loadAttendanceStudents();

    }


    if (
        pageID ===
        "recordPage"
    ) {

        await loadRecordStudents();

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
            ?
        schoolYearInput
            .value
            .trim()
            :
        "";


    const className =
        classNameInput
            ?
        classNameInput
            .value
            .trim()
            :
        "";


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


    classNameInput.value =
        "";


    alert(
        "班級新增成功"
    );


    await loadClasses();

}



/* -------------------------
   載入班級
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


    await renderClassSelects();

}



/* -------------------------
   班級清單
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

                    <div
                        class="student-row"
                    >

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
   班級下拉選單
------------------------- */

async function renderClassSelects() {

    const studentClass =
        document.getElementById(
            "studentClass"
        );


    const attendanceClass =
        document.getElementById(
            "attendanceClass"
        );


    const recordClass =
        document.getElementById(
            "recordClass"
        );


    const oldStudentValue =
        studentClass
            ?
        studentClass.value
            :
        "";


    const oldAttendanceValue =
        attendanceClass
            ?
        attendanceClass.value
            :
        "";


    const oldRecordValue =
        recordClass
            ?
        recordClass.value
            :
        "";


    let html = `

        <option value="">

            請選擇班級

        </option>

    `;


    html +=
        classes
            .map(
                item => `

                    <option
                        value="${escapeAttribute(
                            item.id
                        )}"
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


    setClassSelectValue(

        studentClass,

        html,

        oldStudentValue

    );


    setClassSelectValue(

        attendanceClass,

        html,

        oldAttendanceValue

    );


    setClassSelectValue(

        recordClass,

        html,

        oldRecordValue

    );


    if (
        classes.length >
        0
    ) {

        await loadStudents();

        await loadAttendanceStudents();

        await loadRecordStudents();

    }

}



/* -------------------------
   設定班級選單
------------------------- */

function setClassSelectValue(

    selectElement,

    html,

    oldValue

) {

    if (!selectElement) {

        return;

    }


    selectElement.innerHTML =
        html;


    if (

        classes.some(

            item =>

                item.id ===
                oldValue

        )

    ) {

        selectElement.value =
            oldValue;

    }

    else if (
        classes.length >
        0
    ) {

        selectElement.value =
            classes[0].id;

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
            ?
        classSelector.value
            :
        "";


    const seatNo =
        seatInput
            ?
        Number(
            seatInput.value
        )
            :
        0;


    const studentName =
        nameInput
            ?
        nameInput
            .value
            .trim()
            :
        "";


    if (!classID) {

        alert(
            "請先選擇班級"
        );

        return;

    }


    if (

        !Number.isInteger(
            seatNo
        ) ||

        seatNo <= 0 ||

        !studentName

    ) {

        alert(
            "請輸入正確的座號與學生姓名"
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


    seatInput.value =
        "";


    nameInput.value =
        "";


    alert(
        "學生新增成功"
    );


    await loadStudents();

    await loadAttendanceStudents();

    await loadRecordStudents();

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
            ?
        classSelector.value
            :
        "";


    const rawData =
        batchInput
            ?
        batchInput
            .value
            .trim()
            :
        "";


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
             * Google Sheets Tab
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
             * 半形逗號
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

        const continueImport =
            confirm(

                "以下資料格式無法辨識：\n\n" +

                errors.join(
                    "\n"
                ) +

                "\n\n是否仍要匯入其他正確資料？"

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


    batchInput.value =
        "";


    await loadStudents();

    await loadAttendanceStudents();

    await loadRecordStudents();

}



/* -------------------------
   載入學生
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
   今日點名
========================================================= */


/* -------------------------
   載入點名學生
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
            ?
        classSelector.value
            :
        "";


    const date =
        dateInput
            ?
        dateInput.value
            :
        "";


    if (!classID) {

        currentAttendance =
            [];


        renderAttendance();

        return;

    }



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


    if (
        studentError
    ) {

        alert(

            "讀取學生失敗：\n" +

            studentError.message

        );

        return;

    }



    currentAttendance =
        (
            students ||
            []
        )
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
     * 讀取之前已經儲存的紀錄
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
   顯示點名學生
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
                        class="attendance-extra"
                    >


                        <label>

                            到校時間

                            <input

                                type="time"

                                value="${
                                    escapeAttribute(
                                        student.arrival_time ||
                                        ""
                                    )
                                }"

                                onchange="
                                    updateAttendanceField(
                                        ${index},
                                        'arrival_time',
                                        this.value
                                    )
                                "

                            >

                        </label>



                        <label>

                            離校時間

                            <input

                                type="time"

                                value="${
                                    escapeAttribute(
                                        student.leave_time ||
                                        ""
                                    )
                                }"

                                onchange="
                                    updateAttendanceField(
                                        ${index},
                                        'leave_time',
                                        this.value
                                    )
                                "

                            >

                        </label>



                        <label
                            class="note-field"
                        >

                            備註

                            <input

                                type="text"

                                placeholder="例如：看牙醫、上午請假"

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

                        </label>


                    </div>

                </div>

                `
            )
            .join("");


    renderSummary();

}



/* -------------------------
   更改狀態
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
     * 遲到自動填現在時間
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
     * 早退自動填現在時間
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
   修改其他欄位
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
   點名統計
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
                        class="summary-chip"
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
            ?
        dateInput.value
            :
        "";


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


    await loadAttendanceStudents();

}



/* =========================================================
   紀錄查詢
========================================================= */


/* -------------------------
   載入紀錄查詢學生
------------------------- */

async function loadRecordStudents() {

    const classSelector =
        document.getElementById(
            "recordClass"
        );


    const studentSelector =
        document.getElementById(
            "recordStudent"
        );


    if (
        !classSelector ||
        !studentSelector
    ) {

        return;

    }


    const classID =
        classSelector.value;


    if (!classID) {

        studentSelector.innerHTML =
            `

                <option value="">

                    請先選擇班級

                </option>

            `;

        return;

    }


    const oldValue =
        studentSelector.value;



    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "students"
            )
            .select(
                "id, seat_no, name"
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

            "讀取紀錄查詢學生錯誤：",

            error

        );


        studentSelector.innerHTML =
            `

                <option value="">

                    讀取失敗

                </option>

            `;


        return;

    }



    let html =
        `

            <option value="">

                請選擇學生

            </option>

        `;



    html +=
        (
            data ||
            []
        )
            .map(
                student => `

                    <option
                        value="${escapeAttribute(
                            student.id
                        )}"
                    >

                        ${student.seat_no}
                        號

                        ${escapeHtml(
                            student.name
                        )}

                    </option>

                `
            )
            .join("");



    studentSelector.innerHTML =
        html;



    if (

        (
            data ||
            []
        ).some(

            student =>

                student.id ===
                oldValue

        )

    ) {

        studentSelector.value =
            oldValue;

    }

}



/* -------------------------
   查詢某一天
------------------------- */

async function loadDateRecords() {

    const classSelector =
        document.getElementById(
            "recordClass"
        );


    const dateInput =
        document.getElementById(
            "recordDate"
        );


    const container =
        document.getElementById(
            "dateRecordList"
        );


    const classID =
        classSelector
            ?
        classSelector.value
            :
        "";


    const date =
        dateInput
            ?
        dateInput.value
            :
        "";


    if (!classID) {

        alert(
            "請先選擇班級"
        );

        return;

    }


    if (!date) {

        alert(
            "請先選擇日期"
        );

        return;

    }


    container.innerHTML =
        "<p>讀取中...</p>";



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
                "id, seat_no, name"
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


    if (
        studentError
    ) {

        container.innerHTML =

            `<p>
                讀取學生失敗：
                ${escapeHtml(
                    studentError.message
                )}
            </p>`;

        return;

    }



    if (
        !students ||
        students.length ===
        0
    ) {

        container.innerHTML =
            "<p>這個班級目前沒有學生。</p>";

        return;

    }



    const studentIDs =
        students.map(
            student =>
                student.id
        );



    const {
        data:
            records,
        error:
            recordError
    } =
        await supabaseClient
            .from(
                "attendance"
            )
            .select(

                "student_id, attendance_date, status, arrival_time, leave_time, note"

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
        recordError
    ) {

        container.innerHTML =

            `<p>
                讀取紀錄失敗：
                ${escapeHtml(
                    recordError.message
                )}
            </p>`;

        return;

    }



    const recordMap =
        {};


    (
        records ||
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



    const rows =
        students.map(
            student => {

                const record =
                    recordMap[
                        student.id
                    ];


                return {

                    seat_no:
                        student.seat_no,

                    name:
                        student.name,

                    status:
                        record
                            ?
                        record.status
                            :
                        "未儲存",

                    arrival_time:
                        record
                            ?
                        (
                            record.arrival_time ||
                            ""
                        )
                            :
                        "",

                    leave_time:
                        record
                            ?
                        (
                            record.leave_time ||
                            ""
                        )
                            :
                        "",

                    note:
                        record
                            ?
                        (
                            record.note ||
                            ""
                        )
                            :
                        ""

                };

            }
        );



    const savedCount =
        rows.filter(

            row =>

                row.status !==
                "未儲存"

        ).length;



    container.innerHTML =
        `

            <p>

                日期：

                <strong>

                    ${escapeHtml(
                        formatDateTW(
                            date
                        )
                    )}

                </strong>

                &nbsp;&nbsp;

                已有紀錄：

                <strong>

                    ${savedCount}

                </strong>

                /

                ${rows.length}

                人

            </p>



            <div
                class="table-wrapper"
            >

                <table
                    class="record-table"
                >

                    <thead>

                        <tr>

                            <th>
                                座號
                            </th>

                            <th>
                                姓名
                            </th>

                            <th>
                                狀態
                            </th>

                            <th>
                                到校時間
                            </th>

                            <th>
                                離校時間
                            </th>

                            <th>
                                備註
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows
                            .map(
                                row => `

                                    <tr>

                                        <td>

                                            ${row.seat_no}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                row.name
                                            )}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                row.status
                                            )}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                shortTime(
                                                    row.arrival_time
                                                )
                                            )}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                shortTime(
                                                    row.leave_time
                                                )
                                            )}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                row.note
                                            )}

                                        </td>

                                    </tr>

                                `
                            )
                            .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

}



/* -------------------------
   個別學生紀錄
------------------------- */

async function loadStudentHistory() {

    const studentSelector =
        document.getElementById(
            "recordStudent"
        );


    const container =
        document.getElementById(
            "studentHistoryList"
        );


    const studentID =
        studentSelector
            ?
        studentSelector.value
            :
        "";


    if (!studentID) {

        alert(
            "請先選擇學生"
        );

        return;

    }


    container.innerHTML =
        "<p>讀取中...</p>";



    const selectedOption =
        studentSelector.options[
            studentSelector.selectedIndex
        ];


    const studentText =
        selectedOption
            ?
        selectedOption
            .textContent
            .trim()
            :
        "學生";



    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "attendance"
            )
            .select(

                "attendance_date, status, arrival_time, leave_time, note"

            )
            .eq(
                "student_id",
                studentID
            )
            .order(
                "attendance_date",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        container.innerHTML =

            `<p>
                讀取學生紀錄失敗：
                ${escapeHtml(
                    error.message
                )}
            </p>`;

        return;

    }



    const records =
        data || [];



    if (
        records.length ===
        0
    ) {

        container.innerHTML =

            `<p>
                ${escapeHtml(
                    studentText
                )}
                目前沒有出缺勤紀錄。
            </p>`;

        return;

    }



    const counts =
        {};


    statuses.forEach(
        status => {

            counts[
                status
            ] = 0;

        }
    );



    records.forEach(
        record => {

            if (
                counts[
                    record.status
                ] !==
                undefined
            ) {

                counts[
                    record.status
                ]++;

            }

        }
    );



    container.innerHTML =
        `

            <h4>

                ${escapeHtml(
                    studentText
                )}

            </h4>



            <div
                class="summary-block"
            >

                ${statuses
                    .map(
                        status => `

                            <span
                                class="summary-chip"
                            >

                                ${status}：

                                <strong>

                                    ${
                                        counts[
                                            status
                                        ]
                                    }

                                </strong>

                            </span>

                        `
                    )
                    .join("")
                }

            </div>



            <div
                class="table-wrapper"
            >

                <table
                    class="record-table"
                >

                    <thead>

                        <tr>

                            <th>
                                日期
                            </th>

                            <th>
                                狀態
                            </th>

                            <th>
                                到校時間
                            </th>

                            <th>
                                離校時間
                            </th>

                            <th>
                                備註
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${records
                            .map(
                                record => `

                                    <tr>

                                        <td>

                                            ${escapeHtml(
                                                formatDateTW(
                                                    record.attendance_date
                                                )
                                            )}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                record.status
                                            )}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                shortTime(
                                                    record.arrival_time
                                                )
                                            )}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                shortTime(
                                                    record.leave_time
                                                )
                                            )}

                                        </td>


                                        <td>

                                            ${escapeHtml(
                                                record.note ||
                                                ""
                                            )}

                                        </td>

                                    </tr>

                                `
                            )
                            .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

}



/* -------------------------
   班級統計
------------------------- */

async function loadClassSummary() {

    const classSelector =
        document.getElementById(
            "recordClass"
        );


    const container =
        document.getElementById(
            "classSummary"
        );


    const classID =
        classSelector
            ?
        classSelector.value
            :
        "";


    if (!classID) {

        alert(
            "請先選擇班級"
        );

        return;

    }


    container.innerHTML =
        "<p>統計中...</p>";



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
                "id, seat_no, name"
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


    if (
        studentError
    ) {

        container.innerHTML =

            `<p>
                讀取學生失敗：
                ${escapeHtml(
                    studentError.message
                )}
            </p>`;

        return;

    }



    if (
        !students ||
        students.length ===
        0
    ) {

        container.innerHTML =
            "<p>這個班級目前沒有學生。</p>";

        return;

    }



    let records;



    try {

        records =
            await fetchAllAttendanceForStudents(

                students.map(
                    student =>
                        student.id
                )

            );

    }

    catch (
        error
    ) {

        container.innerHTML =

            `<p>
                讀取統計資料失敗：
                ${escapeHtml(
                    error.message
                )}
            </p>`;

        return;

    }



    const studentMap =
        {};


    students.forEach(
        student => {

            const counts =
                {};


            statuses.forEach(
                status => {

                    counts[
                        status
                    ] = 0;

                }
            );


            studentMap[
                student.id
            ] = {

                seat_no:
                    student.seat_no,

                name:
                    student.name,

                counts:
                    counts,

                total:
                    0

            };

        }
    );



    const classCounts =
        {};


    statuses.forEach(
        status => {

            classCounts[
                status
            ] = 0;

        }
    );



    records.forEach(
        record => {

            const item =
                studentMap[
                    record.student_id
                ];


            if (!item) {

                return;

            }


            if (
                item.counts[
                    record.status
                ] !==
                undefined
            ) {

                item.counts[
                    record.status
                ]++;


                classCounts[
                    record.status
                ]++;

            }


            item.total++;

        }
    );



    const summaryRows =
        students.map(
            student => {

                const item =
                    studentMap[
                        student.id
                    ];


                const presentLike =

                    item.counts[
                        "到校"
                    ] +

                    item.counts[
                        "遲到"
                    ] +

                    item.counts[
                        "早退"
                    ];


                const attendanceRate =

                    item.total >
                    0

                        ?

                    Math.round(

                        (
                            presentLike /
                            item.total
                        ) *

                        1000

                    ) /

                    10

                        :

                    0;


                return {

                    ...item,

                    attendanceRate:
                        attendanceRate

                };

            }
        );



    container.innerHTML =
        `

            <div
                class="summary-block"
            >

                ${statuses
                    .map(
                        status => `

                            <span
                                class="summary-chip"
                            >

                                ${status}：

                                <strong>

                                    ${
                                        classCounts[
                                            status
                                        ]
                                    }

                                </strong>

                            </span>

                        `
                    )
                    .join("")
                }

            </div>



            <div
                class="table-wrapper"
            >

                <table
                    class="record-table"
                >

                    <thead>

                        <tr>

                            <th>
                                座號
                            </th>

                            <th>
                                姓名
                            </th>

                            <th>
                                到校
                            </th>

                            <th>
                                遲到
                            </th>

                            <th>
                                病假
                            </th>

                            <th>
                                事假
                            </th>

                            <th>
                                公假
                            </th>

                            <th>
                                曠課
                            </th>

                            <th>
                                早退
                            </th>

                            <th>
                                紀錄日數
                            </th>

                            <th>
                                出席率
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${summaryRows
                            .map(
                                item => `

                                    <tr>

                                        <td>
                                            ${item.seat_no}
                                        </td>

                                        <td>

                                            ${escapeHtml(
                                                item.name
                                            )}

                                        </td>

                                        <td>
                                            ${item.counts["到校"]}
                                        </td>

                                        <td>
                                            ${item.counts["遲到"]}
                                        </td>

                                        <td>
                                            ${item.counts["病假"]}
                                        </td>

                                        <td>
                                            ${item.counts["事假"]}
                                        </td>

                                        <td>
                                            ${item.counts["公假"]}
                                        </td>

                                        <td>
                                            ${item.counts["曠課"]}
                                        </td>

                                        <td>
                                            ${item.counts["早退"]}
                                        </td>

                                        <td>
                                            ${item.total}
                                        </td>

                                        <td>

                                            ${item.attendanceRate}%

                                        </td>

                                    </tr>

                                `
                            )
                            .join("")
                        }

                    </tbody>

                </table>

            </div>

        `;

}



/* -------------------------
   大量讀取紀錄
------------------------- */

async function fetchAllAttendanceForStudents(

    studentIDs

) {

    const pageSize =
        1000;


    let from =
        0;


    let allRecords =
        [];


    while (
        true
    ) {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "attendance"
                )
                .select(

                    "id, student_id, attendance_date, status, arrival_time, leave_time, note"

                )
                .in(
                    "student_id",
                    studentIDs
                )
                .order(
                    "id",
                    {
                        ascending:
                            true
                    }
                )
                .range(

                    from,

                    from +
                    pageSize -
                    1

                );


        if (error) {

            throw error;

        }


        const batch =
            data || [];


        allRecords =
            allRecords.concat(
                batch
            );


        if (
            batch.length <
            pageSize
        ) {

            break;

        }


        from +=
            pageSize;

    }


    return allRecords;

}



/* =========================================================
   工具
========================================================= */


/* -------------------------
   現在時間
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
   時間只顯示 HH:mm
------------------------- */

function shortTime(
    value
) {

    if (!value) {

        return "";

    }


    return String(
        value
    ).slice(
        0,
        5
    );

}



/* -------------------------
   日期顯示
------------------------- */

function formatDateTW(
    value
) {

    if (!value) {

        return "";

    }


    const parts =
        String(
            value
        ).split(
            "-"
        );


    if (
        parts.length !==
        3
    ) {

        return String(
            value
        );

    }


    return (

        `${parts[0]}/${parts[1]}/${parts[2]}`

    );

}



/* -------------------------
   防止 HTML 特殊字元
------------------------- */

function escapeHtml(
    value
) {

    return String(
        value ??
        ""
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
   HTML attribute 安全
------------------------- */

function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}
