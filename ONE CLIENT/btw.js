Array.from(document.querySelectorAll("font")).forEach((item) => item.style.color = "#000")
const handleCheckAuthenticate = () => {
    // send a request to check is login?
    // if login success call load user!
    $.ajax({
        method: "POST",
        url: "ajax/check_authenticate.php",
        success: (res) => {
            handleLoadUserInfo(JSON.parse(res).user)
        },
        error: (err) => {
            alert("Opps!Something wrong!")
            //    you can reload page here!
        }
    })
}


const handleAuthenticate = (callback)=>{
    // send a request to check is login?
    // if login success call load user!
    $.ajax({
        method: "POST",
        url: "ajax/check_authenticate.php",
        success: (res) => {
            res = JSON.parse(res)
            if (res.is_login){
                callback(res.user)
            }else {
                alert("Vui lòng đăng nhập!")
                window.location.assign(window.location.href.slice(0,window.location.href.indexOf("/uploads.html")))
            }
        },
        error: (err) => {
            alert("Opps!Something wrong!")
            //    you can reload page here!
        }
    })
}



const handleLoadUserInfo = (user) => {
    //    load data to dialog
    let userDialog = document.getElementById("user-info-dialog")
    let username = document.querySelector("#user-info-dialog .user-name")

    let id = document.querySelector("#user-info-dialog .user-id")

    let btnLogin = document.getElementById("btnLogin")
    let settingBtn = document.getElementById("settings-btn")
    let settingBtnOn = document.getElementById("settings-btn-on")
    let coins = document.querySelector(".user-coins")
    // settingBtnOn.style.display = "none"
    if (user) {
        console.log(user)
        username.textContent = user.username;

        userDialog.style.display = "flex"
        id.textContent = "ID:" + user.id
        btnLogin.style.display = "none"
        settingBtn.style.display = "none"
        settingBtnOn.style.display = "inline-block"
        userDialog.classList.add("hide-setting-btn")
        coins.textContent = ":" + user.coins
    } else {
        userDialog.style.display = "none"
        nick.value = ""
        btnLogin.style.display = "inline-block"
        id.textContent = ""
        settingBtnOn.style.display = "none"
        settingBtn.style.display = "inline-block"
        userDialog.classList.remove("hide-setting-btn")
    }

}

// handleCheckAuthenticate()

function logout() {
    $.post("logout.php", [], function (data) {
        if (data) {
            window.location.assign(window.location.href)
        }
    })
}


