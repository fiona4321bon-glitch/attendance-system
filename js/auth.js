/* =========================================================
   auth.js
   登入／註冊／忘記密碼
========================================================= */


/* =========================================================
   網站網址
========================================================= */

function getSiteUrl() {

    return "https://fiona4321bon-glitch.github.io/attendance-system/";

}



/* =========================================================
   建立帳號
========================================================= */

window.register = async function () {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    if (!email) {

        alert("請輸入電子郵件");

        return;

    }


    if (!password) {

        alert("請輸入密碼");

        return;

    }


    if (password.length < 6) {

        alert("密碼至少需要 6 個字元");

        return;

    }


    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                emailRedirectTo:
                    getSiteUrl()

            }

        });


    if (error) {

        alert(
            "建立帳號失敗：\n" +
            error.message
        );

        return;

    }


    alert(
        "帳號已建立。\n\n如果系統要求 Email 驗證，請到信箱收取確認信。"
    );

};



/* =========================================================
   登入
========================================================= */

window.login = async function () {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    if (!email) {

        alert("請輸入電子郵件");

        return;

    }


    if (!password) {

        alert("請輸入密碼");

        return;

    }


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        alert(
            "登入失敗：\n" +
            error.message
        );

        return;

    }


    await checkLogin();

};



/* =========================================================
   忘記密碼
========================================================= */

window.sendPasswordReset = async function () {

    /*
     * 這個 alert 是刻意留下來的。
     * 只要按鈕真的有呼叫到此函式，
     * 就一定先看到這個訊息。
     */

    alert("已收到忘記密碼指令，接下來準備寄送重設信。");


    const emailElement =
        document.getElementById("email");


    if (!emailElement) {

        alert(
            "找不到電子郵件輸入欄位。"
        );

        return;

    }


    const email =
        emailElement.value.trim();


    if (!email) {

        alert(
            "請先在電子郵件欄輸入您的帳號 Email。"
        );

        return;

    }


    const confirmed =
        confirm(
            "確定要寄送密碼重設信到：\n\n" +
            email +
            "\n\n嗎？"
        );


    if (!confirmed) {

        return;

    }


    try {

        const { error } =
            await supabaseClient.auth.resetPasswordForEmail(

                email,

                {

                    redirectTo:
                        getSiteUrl()

                }

            );


        if (error) {

            alert(
                "寄送失敗：\n" +
                error.message
            );

            console.error(error);

            return;

        }


        alert(
            "密碼重設信已送出。\n\n" +
            "請查看您的電子郵件信箱，也記得檢查垃圾郵件。"
        );

    }

    catch (error) {

        console.error(error);


        alert(
            "執行忘記密碼時發生錯誤：\n" +
            error.message
        );

    }

};



/* =========================================================
   顯示修改密碼畫面
========================================================= */

function showResetPasswordPage() {

    const loginPage =
        document.getElementById("loginPage");

    const appPage =
        document.getElementById("appPage");

    const resetPage =
        document.getElementById("resetPasswordPage");


    if (loginPage) {

        loginPage.style.display =
            "none";

    }


    if (appPage) {

        appPage.style.display =
            "none";

    }


    if (resetPage) {

        resetPage.style.display =
            "flex";

    }

}



/* =========================================================
   儲存新密碼
========================================================= */

window.updatePassword = async function () {

    const password =
        document.getElementById(
            "newPassword"
        ).value;


    const confirmPassword =
        document.getElementById(
            "confirmNewPassword"
        ).value;


    if (!password) {

        alert(
            "請輸入新密碼"
        );

        return;

    }


    if (password.length < 6) {

        alert(
            "新密碼至少需要 6 個字元"
        );

        return;

    }


    if (
        password !==
        confirmPassword
    ) {

        alert(
            "兩次輸入的新密碼不一致"
        );

        return;

    }


    const { error } =
        await supabaseClient.auth.updateUser({

            password: password

        });


    if (error) {

        alert(
            "修改密碼失敗：\n" +
            error.message
        );

        return;

    }


    alert(
        "密碼修改成功！\n\n請使用新密碼重新登入。"
    );


    await supabaseClient.auth.signOut();


    window.location.href =
        getSiteUrl();

};



/* =========================================================
   登出
========================================================= */

window.logout = async function () {

    await supabaseClient.auth.signOut();


    window.location.href =
        getSiteUrl();

};



/* =========================================================
   檢查登入
========================================================= */

window.checkLogin = async function () {

    const {
        data: {
            session
        }
    } =
        await supabaseClient.auth.getSession();


    const loginPage =
        document.getElementById(
            "loginPage"
        );


    const appPage =
        document.getElementById(
            "appPage"
        );


    const resetPage =
        document.getElementById(
            "resetPasswordPage"
        );


    if (session) {

        if (loginPage) {

            loginPage.style.display =
                "none";

        }


        if (resetPage) {

            resetPage.style.display =
                "none";

        }


        if (appPage) {

            appPage.style.display =
                "block";

        }


        const userEmail =
            document.getElementById(
                "userEmail"
            );


        if (userEmail) {

            userEmail.textContent =
                session.user.email || "";

        }


        if (
            typeof startApp ===
            "function"
        ) {

            await startApp();

        }

    }

    else {

        if (loginPage) {

            loginPage.style.display =
                "flex";

        }


        if (appPage) {

            appPage.style.display =
                "none";

        }


        if (resetPage) {

            resetPage.style.display =
                "none";

        }

    }

};



/* =========================================================
   Supabase 驗證事件
========================================================= */

supabaseClient.auth.onAuthStateChange(

    function (
        event,
        session
    ) {

        console.log(
            "Supabase Auth：",
            event
        );


        /*
         * 點擊忘記密碼信件後
         */
        if (
            event ===
            "PASSWORD_RECOVERY"
        ) {

            showResetPasswordPage();

        }

    }

);



/* =========================================================
   網頁載入
========================================================= */

window.addEventListener(

    "load",

    async function () {

        /*
         * 某些 Supabase 重設網址
         * 會帶 type=recovery
         */

        if (
            window.location.hash.includes(
                "type=recovery"
            )
        ) {

            setTimeout(
                showResetPasswordPage,
                500
            );

            return;

        }


        await checkLogin();

    }

);
