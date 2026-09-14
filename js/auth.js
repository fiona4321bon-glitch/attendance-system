/* =========================================================
   Supabase Authentication
   auth.js
========================================================= */


/*
 * 是否正在進行密碼重設
 */
let passwordRecoveryMode = false;



/* =========================================================
   建立帳號
========================================================= */

async function register() {

    const emailInput =
        document.getElementById(
            "email"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const email =
        emailInput
            ?
        emailInput.value.trim()
            :
        "";


    const password =
        passwordInput
            ?
        passwordInput.value
            :
        "";


    if (!email) {

        alert(
            "請輸入電子郵件"
        );

        return;

    }


    if (!password) {

        alert(
            "請輸入密碼"
        );

        return;

    }


    if (
        password.length <
        6
    ) {

        alert(
            "密碼至少需要 6 個字元"
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .signUp({

                email:
                    email,

                password:
                    password,

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


    /*
     * 如果 Supabase 要求驗證 Email
     */
    if (
        data.user &&
        !data.session
    ) {

        alert(

            "帳號已建立。\n\n" +

            "請到電子郵件信箱收取 Supabase 驗證信，完成 Email 驗證後再登入。"

        );

        return;

    }


    alert(
        "帳號建立成功"
    );


    await checkLogin();

}



/* =========================================================
   登入
========================================================= */

async function login() {

    const emailInput =
        document.getElementById(
            "email"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const email =
        emailInput
            ?
        emailInput.value.trim()
            :
        "";


    const password =
        passwordInput
            ?
        passwordInput.value
            :
        "";


    if (!email) {

        alert(
            "請輸入電子郵件"
        );

        return;

    }


    if (!password) {

        alert(
            "請輸入密碼"
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .signInWithPassword({

                email:
                    email,

                password:
                    password

            });


    if (error) {

        let message =
            error.message;


        /*
         * 常見錯誤轉成比較好懂的中文
         */
        if (
            message
                .toLowerCase()
                .includes(
                    "invalid login credentials"
                )
        ) {

            message =
                "電子郵件或密碼錯誤。若忘記密碼，請按「忘記密碼」。";

        }


        alert(

            "登入失敗：\n" +

            message

        );

        return;

    }


    await checkLogin();

}



/* =========================================================
   登出
========================================================= */

async function logout() {

    await supabaseClient
        .auth
        .signOut();


    passwordRecoveryMode =
        false;


    window.location.href =
        getSiteUrl();

}



/* =========================================================
   寄送忘記密碼信
========================================================= */

async function sendPasswordReset() {

    const emailInput =
        document.getElementById(
            "email"
        );


    const email =
        emailInput
            ?
        emailInput.value.trim()
            :
        "";


    if (!email) {

        alert(
            "請先在電子郵件欄位輸入您的帳號 Email"
        );

        return;

    }


    const confirmed =
        confirm(

            `確定要寄送密碼重設信到：\n\n${email}\n\n嗎？`

        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .auth
            .resetPasswordForEmail(

                email,

                {

                    redirectTo:
                        getSiteUrl()

                }

            );


    if (error) {

        alert(

            "寄送密碼重設信失敗：\n" +

            error.message

        );

        return;

    }


    alert(

        "密碼重設信已寄出！\n\n" +

        "請到您的電子郵件信箱查看信件，點擊信中的重設密碼連結。"

    );

}



/* =========================================================
   顯示密碼重設頁
========================================================= */

function showResetPasswordPage() {

    passwordRecoveryMode =
        true;


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
   更新新密碼
========================================================= */

async function updatePassword() {

    const newPasswordInput =
        document.getElementById(
            "newPassword"
        );


    const confirmPasswordInput =
        document.getElementById(
            "confirmNewPassword"
        );


    const newPassword =
        newPasswordInput
            ?
        newPasswordInput.value
            :
        "";


    const confirmPassword =
        confirmPasswordInput
            ?
        confirmPasswordInput.value
            :
        "";


    if (!newPassword) {

        alert(
            "請輸入新密碼"
        );

        return;

    }


    if (
        newPassword.length <
        6
    ) {

        alert(
            "新密碼至少需要 6 個字元"
        );

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        alert(
            "兩次輸入的密碼不同，請重新確認"
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .updateUser({

                password:
                    newPassword

            });


    if (error) {

        alert(

            "密碼修改失敗：\n" +

            error.message

        );

        return;

    }


    alert(

        "密碼修改成功！\n\n" +

        "系統會將您登出，請使用新密碼重新登入。"

    );


    /*
     * 更新成功後登出
     */
    await supabaseClient
        .auth
        .signOut();


    passwordRecoveryMode =
        false;


    /*
     * 移除網址裡可能殘留的 recovery token
     */
    window.history.replaceState(

        {},

        document.title,

        getSiteUrl()

    );


    window.location.href =
        getSiteUrl();

}



/* =========================================================
   檢查登入狀態
========================================================= */

async function checkLogin() {

    /*
     * 密碼重設時不要進主系統
     */
    if (
        passwordRecoveryMode
    ) {

        showResetPasswordPage();

        return;

    }


    const {
        data: {
            session
        }
    } =
        await supabaseClient
            .auth
            .getSession();


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


        const emailText =
            document.getElementById(
                "userEmail"
            );


        if (
            emailText &&
            session.user
        ) {

            emailText.innerText =
                session.user.email ||
                "";

        }


        /*
         * 啟動主系統
         */
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

}



/* =========================================================
   網站網址
========================================================= */

function getSiteUrl() {

    /*
     * 例如：
     * https://fiona4321bon-glitch.github.io/attendance-system/
     */

    let path =
        window.location.pathname;


    /*
     * 如果網址最後是 index.html，
     * 自動移除
     */
    path =
        path.replace(
            /index\.html$/,
            ""
        );


    /*
     * 確保最後有 /
     */
    if (
        !path.endsWith(
            "/"
        )
    ) {

        path +=
            "/";

    }


    return (

        window.location.origin +

        path

    );

}



/* =========================================================
   Supabase Auth 狀態監聽
========================================================= */

supabaseClient
    .auth
    .onAuthStateChange(

        async (
            event,
            session
        ) => {


            console.log(

                "Auth event:",

                event

            );


            /*
             * 使用者點了密碼重設信
             */
            if (
                event ===
                "PASSWORD_RECOVERY"
            ) {

                passwordRecoveryMode =
                    true;


                setTimeout(
                    () => {

                        showResetPasswordPage();

                    },
                    0
                );


                return;

            }


            /*
             * 密碼重設模式下，
             * 不要因為 SIGNED_IN
             * 自動跳進主系統
             */
            if (
                passwordRecoveryMode
            ) {

                return;

            }


            /*
             * 登出
             */
            if (
                event ===
                "SIGNED_OUT"
            ) {

                const loginPage =
                    document.getElementById(
                        "loginPage"
                    );


                const appPage =
                    document.getElementById(
                        "appPage"
                    );


                if (loginPage) {

                    loginPage.style.display =
                        "flex";

                }


                if (appPage) {

                    appPage.style.display =
                        "none";

                }

            }

        }

    );



/* =========================================================
   頁面開啟
========================================================= */

window.addEventListener(

    "load",

    async function () {


        /*
         * 舊式 Supabase recovery URL
         * 有時會在網址 # 裡出現 type=recovery
         */
        if (

            window.location.hash &&

            window.location.hash.includes(
                "type=recovery"
            )

        ) {

            passwordRecoveryMode =
                true;


            /*
             * 給 Supabase 一點時間讀取 token
             */
            setTimeout(

                () => {

                    showResetPasswordPage();

                },

                300

            );


            return;

        }


        await checkLogin();

    }

);
