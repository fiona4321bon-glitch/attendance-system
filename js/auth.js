async function register() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;


    if (!email || !password) {

        alert("請輸入 Email 與密碼");

        return;

    }


    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password

        });


    if (error) {

        alert(
            "建立帳號失敗：" +
            error.message
        );

        return;

    }


    alert(
        "帳號已建立，請依 Supabase 設定完成登入。"
    );

}



async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;


    const { data, error } =
        await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });


    if (error) {

        alert(
            "登入失敗：" +
            error.message
        );

        return;

    }


    checkLogin();

}



async function logout() {

    await supabaseClient.auth.signOut();

    location.reload();

}



async function checkLogin() {

    const {
        data: { session }
    } =
        await supabaseClient.auth
            .getSession();


    if (session) {

        document
            .getElementById("loginPage")
            .style.display =
            "none";


        document
            .getElementById("appPage")
            .style.display =
            "block";


        document
            .getElementById("userEmail")
            .innerText =
            session.user.email;


        startApp();

    }

    else {

        document
            .getElementById("loginPage")
            .style.display =
            "flex";


        document
            .getElementById("appPage")
            .style.display =
            "none";

    }

}



window.addEventListener(
    "load",
    checkLogin
);
